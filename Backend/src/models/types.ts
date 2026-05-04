// ─── Usuarios ────────────────────────────────────────────────────────────────

export interface User {
  id:             string;
  email:          string;
  password_hash:  string;
  full_name:      string;
  avatar_url:     string | null;
  monthly_income: number;
  created_at:     Date;
  updated_at:     Date;
}

/** Subconjunto seguro para devolver al cliente (sin password_hash) */
export type UserPublic = Omit<User, 'password_hash'>;

export interface RegisterDTO {
  email:          string;
  password:       string;
  full_name:      string;
  monthly_income?: number;
}

export interface LoginDTO {
  email:    string;
  password: string;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

// ─── Categorías ──────────────────────────────────────────────────────────────

export interface Category {
  id:         string;
  user_id:    string | null;   // NULL = categoría del sistema
  name:       string;
  icon:       string;
  color:      string;
  type:       'income' | 'expense';
  is_default: boolean;
  created_at: Date;
}

// ─── Transacciones ───────────────────────────────────────────────────────────

export interface Transaction {
  id:               string;
  user_id:          string;
  category_id:      string | null;
  amount:           number;   // CLP, siempre positivo; `type` indica dirección
  type:             'income' | 'expense';
  description:      string | null;
  transaction_date: Date;
  created_at:       Date;
  updated_at:       Date;
  deleted_at:       Date | null;
}

export interface CreateTransactionDTO {
  category_id?:     string;
  amount:           number;
  type:             'income' | 'expense';
  description?:     string;
  transaction_date?: string; // ISO date string, default hoy
}

/** Transaction con nombre de categoría incluido (para respuestas al cliente) */
export interface TransactionWithCategory extends Transaction {
  category_name:  string | null;
  category_icon:  string | null;
  category_color: string | null;
}

/** Resumen financiero de un mes — se devuelve junto con cada transacción creada */
export interface MonthBalance {
  month:          string; // "YYYY-MM"
  total_income:   number;
  total_expenses: number;
  available:      number; // total_income - total_expenses
}

export interface CreateTransactionResult {
  transaction: TransactionWithCategory;
  balance:     MonthBalance;
}

// ─── Metas de Ahorro ─────────────────────────────────────────────────────────

export interface Goal {
  id:             string;
  user_id:        string;
  title:          string;
  icon:           string;
  target_amount:  number;
  current_amount: number;
  deadline:       Date | null;
  status:         'active' | 'completed' | 'paused' | 'cancelled';
  created_at:     Date;
  updated_at:     Date;
  deleted_at:     Date | null;
}

export interface CreateGoalDTO {
  title:          string;
  icon?:          string;
  target_amount:  number;
  deadline?:      string; // ISO date string
}

export interface UpdateGoalDTO {
  title?:        string;
  icon?:         string;
  target_amount?: number;
  deadline?:     string;
  status?:       Goal['status'];
}

export interface GoalContribution {
  id:             string;
  goal_id:        string;
  user_id:        string;
  amount:         number;  // positivo = aporte, negativo = retiro
  note:           string | null;
  contributed_at: Date;
}

export interface CreateContributionDTO {
  amount: number;
  note?:  string;
}

// ─── Presupuesto mensual ──────────────────────────────────────────────────────

export interface MonthlyBudget {
  id:          string;
  user_id:     string;
  category_id: string;
  amount:      number;
  month:       Date;  // primer día del mes, e.g. 2025-05-01
  created_at:  Date;
  updated_at:  Date;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface CategorySummary {
  category_id:       string | null;
  category_name:     string | null;
  category_icon:     string | null;
  category_color:    string | null;
  total_amount:      number;
  transaction_count: number;
  budget_amount:     number | null;
}

export interface DashboardSummary {
  month:           string;  // "YYYY-MM"
  total_income:    number;
  total_expenses:  number;
  balance:         number;
  categories:      CategorySummary[];
}

// ─── Chatbot ─────────────────────────────────────────────────────────────────

export interface ChatSession {
  id:         string;
  user_id:    string;
  title:      string;
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessage {
  id:          string;
  session_id:  string;
  role:        'user' | 'assistant' | 'system';
  content:     string;
  tokens_used: number | null;
  created_at:  Date;
}

export interface SendMessageDTO {
  content: string;
}

export interface FinancialTip {
  id:         string;
  category:   'ahorro' | 'presupuesto' | 'deuda' | 'inversion' | 'habitos';
  title:      string;
  content:    string;
  difficulty: 'principiante' | 'intermedio' | 'avanzado';
  is_active:  boolean;
  created_at: Date;
}
