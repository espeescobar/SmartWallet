-- =============================================================================
-- SmartWallet — Migración inicial
-- Versión: 001
-- Módulos: Perfilamiento de Usuario, Registro de Transacciones,
--          Gestor de Metas de Ahorro, Dashboard de Estadísticas,
--          Chatbot de Educación Financiera
--
-- Nota sobre montos CLP: el peso chileno no tiene centavos. Se usa INTEGER
-- (máx ~2.147.000.000 CLP ≈ $2M USD), suficiente para finanzas personales.
-- =============================================================================

-- Requiere PostgreSQL 13+ para gen_random_uuid() nativo
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- FUNCIÓN AUXILIAR: auto-actualiza updated_at en cualquier tabla
-- =============================================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- 1. PERFILAMIENTO DE USUARIO
-- =============================================================================

CREATE TABLE users (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    email            VARCHAR(255)  UNIQUE NOT NULL,
    password_hash    VARCHAR(255)  NOT NULL,
    full_name        VARCHAR(100)  NOT NULL,
    avatar_url       TEXT,
    -- Ingreso mensual declarado por el usuario (usado en el dashboard)
    monthly_income   INTEGER       NOT NULL DEFAULT 0 CHECK (monthly_income >= 0),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Tokens de refresco JWT (un usuario puede tener sesiones en varios dispositivos)
CREATE TABLE refresh_tokens (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash   VARCHAR(255) NOT NULL UNIQUE,
    device_info  VARCHAR(255),
    expires_at   TIMESTAMPTZ  NOT NULL,
    revoked_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user     ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash     ON refresh_tokens(token_hash);


-- =============================================================================
-- 2. REGISTRO DE TRANSACCIONES
-- =============================================================================

-- Categorías del sistema (user_id NULL) y personalizadas por usuario
CREATE TABLE categories (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(50)  NOT NULL DEFAULT '💰',  -- emoji
    color       CHAR(7)      NOT NULL DEFAULT '#6E6E73', -- hex #RRGGBB
    type        VARCHAR(10)  NOT NULL CHECK (type IN ('income', 'expense')),
    is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    -- Un usuario no puede tener dos categorías con el mismo nombre y tipo
    CONSTRAINT uq_category_user_name_type UNIQUE NULLS NOT DISTINCT (user_id, name, type)
);

CREATE INDEX idx_categories_user ON categories(user_id);

CREATE TABLE transactions (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id      UUID         REFERENCES categories(id) ON DELETE SET NULL,
    -- Monto siempre positivo; el tipo (income/expense) determina la dirección
    amount           INTEGER      NOT NULL CHECK (amount > 0),
    type             VARCHAR(10)  NOT NULL CHECK (type IN ('income', 'expense')),
    description      VARCHAR(255),
    -- Fecha del movimiento (no necesariamente cuando se registró)
    transaction_date DATE         NOT NULL DEFAULT CURRENT_DATE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ  -- soft delete: NULL = activo
);

CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_transactions_user         ON transactions(user_id);
CREATE INDEX idx_transactions_date         ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category     ON transactions(category_id);
CREATE INDEX idx_transactions_type         ON transactions(user_id, type);
-- Índice parcial: solo filas activas (acelera todas las consultas normales)
CREATE INDEX idx_transactions_active       ON transactions(user_id, transaction_date DESC)
  WHERE deleted_at IS NULL;


-- =============================================================================
-- 3. GESTOR DE METAS DE AHORRO
-- =============================================================================

CREATE TABLE goals (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(100) NOT NULL,
    icon            VARCHAR(50)  NOT NULL DEFAULT '🎯',
    -- Monto objetivo en CLP
    target_amount   INTEGER      NOT NULL CHECK (target_amount > 0),
    -- Monto acumulado hasta ahora; lo mantiene consistente goal_contributions
    current_amount  INTEGER      NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    deadline        DATE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TRIGGER set_updated_at_goals
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_goals_user   ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(user_id, status) WHERE deleted_at IS NULL;

-- Historial de aportes y retiros a cada meta
CREATE TABLE goal_contributions (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id        UUID         NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    user_id        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Positivo = aporte, negativo = retiro
    amount         INTEGER      NOT NULL CHECK (amount != 0),
    note           VARCHAR(255),
    contributed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goal_contributions_goal ON goal_contributions(goal_id);
CREATE INDEX idx_goal_contributions_user ON goal_contributions(user_id);

-- Trigger: sincroniza goals.current_amount automáticamente al insertar un aporte
CREATE OR REPLACE FUNCTION trigger_sync_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goals
  SET current_amount = GREATEST(0, current_amount + NEW.amount),
      -- Auto-completar si se alcanzó la meta
      status = CASE
        WHEN GREATEST(0, current_amount + NEW.amount) >= target_amount THEN 'completed'
        ELSE status
      END
  WHERE id = NEW.goal_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_goal_amount_on_contribution
  AFTER INSERT ON goal_contributions
  FOR EACH ROW EXECUTE FUNCTION trigger_sync_goal_amount();


-- =============================================================================
-- 4. DASHBOARD DE ESTADÍSTICAS
-- =============================================================================

-- Presupuesto mensual por categoría (para comparar vs gasto real)
CREATE TABLE monthly_budgets (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount      INTEGER     NOT NULL CHECK (amount > 0),
    -- Primer día del mes: e.g. 2025-05-01. No se guarda el día real.
    month       DATE        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_budget_user_category_month UNIQUE (user_id, category_id, month)
);

CREATE TRIGGER set_updated_at_monthly_budgets
  BEFORE UPDATE ON monthly_budgets
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_monthly_budgets_user_month ON monthly_budgets(user_id, month DESC);

-- Vista materializada: resumen mensual de gastos por categoría
-- Se refresca con: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_expense_summary;
CREATE MATERIALIZED VIEW mv_monthly_expense_summary AS
SELECT
    t.user_id,
    DATE_TRUNC('month', t.transaction_date)::DATE  AS month,
    t.category_id,
    c.name                                          AS category_name,
    c.icon                                          AS category_icon,
    c.color                                         AS category_color,
    SUM(t.amount)                                   AS total_amount,
    COUNT(*)                                        AS transaction_count
FROM transactions t
LEFT JOIN categories c ON c.id = t.category_id
WHERE t.deleted_at IS NULL
  AND t.type = 'expense'
GROUP BY t.user_id, DATE_TRUNC('month', t.transaction_date)::DATE,
         t.category_id, c.name, c.icon, c.color;

CREATE UNIQUE INDEX idx_mv_monthly_summary
  ON mv_monthly_expense_summary(user_id, month, category_id);


-- =============================================================================
-- 5. CHATBOT DE EDUCACIÓN FINANCIERA
-- =============================================================================

CREATE TABLE chat_sessions (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Título auto-generado a partir del primer mensaje
    title       VARCHAR(255) NOT NULL DEFAULT 'Nueva consulta',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_chat_sessions
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id, created_at DESC);

CREATE TABLE chat_messages (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    -- 'user' = mensaje del usuario, 'assistant' = respuesta del LLM, 'system' = prompt de contexto
    role        VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content     TEXT        NOT NULL,
    -- Tokens consumidos (para monitorear costos de API)
    tokens_used INTEGER,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at ASC);

-- Consejos financieros curados (base de conocimiento del chatbot)
CREATE TABLE financial_tips (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    category    VARCHAR(50)  NOT NULL
                CHECK (category IN ('ahorro', 'presupuesto', 'deuda', 'inversion', 'habitos')),
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    difficulty  VARCHAR(20)  NOT NULL DEFAULT 'principiante'
                CHECK (difficulty IN ('principiante', 'intermedio', 'avanzado')),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_financial_tips_category ON financial_tips(category) WHERE is_active = TRUE;


-- =============================================================================
-- SEED: Categorías del sistema (user_id = NULL → disponibles para todos)
-- =============================================================================

INSERT INTO categories (user_id, name, icon, color, type, is_default) VALUES
    -- Gastos
    (NULL, 'Comida y Antojos',   '🍔', '#FF9500', 'expense', TRUE),
    (NULL, 'Transporte',         '🚇', '#34C759', 'expense', TRUE),
    (NULL, 'Supermercado',       '🛒', '#007AFF', 'expense', TRUE),
    (NULL, 'Salidas y Carrete',  '🎉', '#AF52DE', 'expense', TRUE),
    (NULL, 'Cuentas Fijas',      '💡', '#FF3B30', 'expense', TRUE),
    (NULL, 'Salud',              '💊', '#FF2D55', 'expense', TRUE),
    (NULL, 'Educación',          '📚', '#5AC8FA', 'expense', TRUE),
    (NULL, 'Ropa y Calzado',     '👕', '#FFCC00', 'expense', TRUE),
    (NULL, 'Tecnología',         '📱', '#636366', 'expense', TRUE),
    (NULL, 'Otros Gastos',       '💸', '#8E8E93', 'expense', TRUE),
    -- Ingresos
    (NULL, 'Sueldo',             '💼', '#30D158', 'income',  TRUE),
    (NULL, 'Freelance',          '💻', '#0A84FF', 'income',  TRUE),
    (NULL, 'Propinas',           '🤝', '#64D2FF', 'income',  TRUE),
    (NULL, 'Otros Ingresos',     '💰', '#FFD60A', 'income',  TRUE);


-- =============================================================================
-- SEED: Consejos financieros iniciales
-- =============================================================================

INSERT INTO financial_tips (category, title, content, difficulty) VALUES
    ('ahorro',
     'La regla 50/30/20',
     'Divide tu ingreso mensual en tres partes: 50% para necesidades (arriendo, comida, transporte), 30% para gustos personales y 20% para ahorro. Es el punto de partida más simple para ordenar tus finanzas.',
     'principiante'),

    ('presupuesto',
     'Registra todo durante 30 días',
     'Antes de hacer un presupuesto, anota cada gasto por un mes completo. Muchas personas se sorprenden al ver cuánto gastan en delivery o suscripciones. SmartWallet lo hace automático.',
     'principiante'),

    ('deuda',
     'El método avalancha para deudas',
     'Si tienes varias deudas, paga el mínimo en todas y destina el dinero extra a la que cobra más interés. Al eliminarla, ese dinero se aplica a la siguiente. Pagas menos interés total que el método bola de nieve.',
     'intermedio'),

    ('inversion',
     'Fondos mutuos como primer paso',
     'En Chile, los fondos mutuos de renta fija son una alternativa accesible para quien empieza a invertir. Puedes partir desde $1.000 CLP en plataformas como Fintual o BICE Inversiones, con liquidez diaria.',
     'intermedio'),

    ('habitos',
     'Automatiza tu ahorro',
     'Configura una transferencia automática el día que recibes tu sueldo. El cerebro humano gasta lo que ve disponible. Si el dinero del ahorro nunca llega a la cuenta corriente, no lo vas a extrañar.',
     'principiante'),

    ('ahorro',
     'Fondo de emergencia primero',
     'Antes de invertir o pagar deudas adicionales, construye un fondo de emergencia de 3 a 6 meses de gastos esenciales. En Chile, lo ideal es tenerlo en una cuenta de ahorro o fondo mutuo de liquidez inmediata.',
     'principiante');
