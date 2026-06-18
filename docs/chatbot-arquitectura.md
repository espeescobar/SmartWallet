# Arquitectura del Chatbot de Educación Financiera — SmartWallet

> Módulo de IA que integra un asistente conversacional en la app para fomentar la
> **responsabilidad financiera** y el **aprendizaje continuo** del usuario.

---

## 1. Objetivo

Integrar un agente virtual dentro de SmartWallet que:

- Responda dudas financieras en lenguaje cercano (español de Chile).
- Eduque sobre hábitos de ahorro, presupuesto, deuda e inversión.
- Use de forma **opcional y agregada** los datos financieros del usuario para dar
  consejos contextualizados, sin exponer el detalle transacción por transacción.
- Sea **agnóstico al proveedor de LLM** para poder cambiar de modelo sin reescribir
  la lógica de negocio.

El proveedor por defecto es **Groq** (tier gratuito, API compatible con OpenAI).

---

## 2. Flujo de datos

```
┌─────────────┐   1. POST /chat/sessions/:id/messages      ┌──────────────────┐
│   Mobile    │ ─────────────────────────────────────────► │     Backend      │
│ (FAB+modal) │        { content: "¿cómo ahorro?" }         │  chatController   │
└─────────────┘                                             └────────┬─────────┘
       ▲                                                             │
       │ 5. { role:'assistant', content, tokens_used }               ▼
       │                                                    ┌──────────────────┐
       │                                                    │   chatService     │
       │                                                    │  (orquestador)    │
       │                                                    └───┬───────┬───────┘
       │                                                        │       │
       │              2. resumen financiero agregado            │       │ 3. historial
       │                 ┌──────────────────────────────────────┘       │   (DB)
       │                 ▼                                               ▼
       │      ┌────────────────────┐                          ┌──────────────────┐
       │      │ chatContextService │◄── dashboardService      │  chatRepository   │
       │      │  (resumen híbrido) │◄── goalRepository        │ chat_messages     │
       │      └─────────┬──────────┘                          └──────────────────┘
       │                │
       │                ▼  4. messages = [system+contexto, ...historial, user]
       │      ┌────────────────────┐        HTTPS         ┌──────────────────┐
       └──────│     llmService     │ ──────────────────► │   Groq API        │
              │  (agnóstico)       │ ◄────────────────── │ (OpenAI-compat.)  │
              └────────────────────┘     respuesta        └──────────────────┘
```

### Paso a paso

1. El usuario escribe en el chat (modal abierto desde el FAB global). El mobile envía
   el mensaje al endpoint protegido por JWT.
2. `chatService` pide a `chatContextService` un **resumen financiero agregado** del mes
   en curso (reutiliza `dashboardService.getSummary` + `goalRepository`).
3. Carga el **historial** de la conversación desde `chat_messages` (limitado para
   controlar tokens).
4. Construye el arreglo de mensajes: `[ system (prompt base + contexto), ...historial,
   mensaje del usuario ]` y lo envía a `llmService`.
5. `llmService` llama al proveedor (Groq) y devuelve el texto + tokens usados. La
   respuesta se persiste en `chat_messages` y se devuelve al mobile.

---

## 3. Estrategia de contexto híbrido

El chatbot es **educador general por defecto** y recibe además un **resumen agregado**
de las finanzas del usuario. Esto da respuestas útiles sin comprometer la privacidad.

### Qué SÍ se envía al LLM (agregado)

- Mes en curso, total de ingresos, total de gastos y balance.
- Top de categorías de gasto: nombre, total del mes y presupuesto asignado (si existe).
- Metas de ahorro activas: título, monto objetivo, monto actual y % de avance.

### Qué NO se envía

- Transacciones individuales (descripción, fecha, monto puntual).
- Datos personales identificables (nombre, email, RUT, tokens, contraseñas).
- IDs internos de la base de datos.

> El resumen se arma como texto compacto y se inyecta dentro del mensaje `system`,
> no como datos crudos. Si el usuario no tiene movimientos, el bot opera en modo
> educador general.

---

## 4. Prompts base

### 4.1 Prompt de sistema (personalidad)

El agente actúa como **facilitador de responsabilidad financiera y aprendizaje
continuo**. Lineamientos:

- Tono cercano, motivador y sin juicios; español de Chile, sin tecnicismos
  innecesarios.
- Respuestas **breves y accionables** (idealmente 2–5 frases o una lista corta).
- Promueve hábitos sanos: ahorro, presupuesto, control de deudas.
- Usa el resumen financiero del usuario cuando sea pertinente, con tacto y sin
  alarmar.
- **No** entrega asesoría de inversión regulada ni recomienda instrumentos
  específicos como si fuera un asesor certificado; educa y sugiere informarse.
- Si la pregunta no es financiera, redirige amablemente al propósito de la app.

El texto exacto vive en `Backend/src/services/prompts.ts` (`SYSTEM_PROMPT`).

### 4.2 Mensaje de contexto

Generado dinámicamente por `chatContextService` y concatenado al prompt de sistema.
Ejemplo del formato:

```
[Contexto financiero del usuario — mes 2026-06]
Ingresos: $850.000 · Gastos: $640.000 · Balance: $210.000
Top gastos:
- Salidas y Carrete: $180.000 (presupuesto $120.000) ⚠️
- Comida y Antojos: $150.000 (sin presupuesto)
Metas activas:
- Viaje a Sur: $300.000 / $600.000 (50%)
```

---

## 5. Capa agnóstica de LLM

`llmService` expone una única función `generateReply(messages)` y oculta el proveedor.
Groq es compatible con la API de OpenAI, por lo que se reutiliza el SDK `openai`
apuntando su `baseURL` a Groq.

Configuración por variables de entorno:

| Variable        | Descripción                                   | Ejemplo                                      |
|-----------------|-----------------------------------------------|----------------------------------------------|
| `LLM_PROVIDER`  | Proveedor activo                              | `groq`                                       |
| `LLM_API_KEY`   | API key del proveedor (Groq → console.groq.com) | `gsk_...`                                   |
| `LLM_MODEL`     | Modelo a usar                                 | `llama-3.3-70b-versatile`                    |
| `LLM_BASE_URL`  | Endpoint compatible con OpenAI                | `https://api.groq.com/openai/v1`             |

**Cambiar de proveedor** (p. ej. a OpenAI de pago) = cambiar estas 4 variables; no se
toca el código.

---

## 6. Control de costos y límites

- **Historial acotado**: solo se envían los últimos N mensajes (configurable) para
  acotar tokens.
- **`tokens_used`** se guarda por mensaje en `chat_messages` para monitorear consumo.
- **Modelo económico** por defecto (Groq gratuito).

---

## 7. Manejo de errores y fallback

- Si falta `LLM_API_KEY` o el proveedor falla, `chatService` igual guarda el mensaje
  del usuario y responde con un mensaje de fallback amable, sin romper la app.
- Los errores del proveedor se registran en el log del backend; el usuario nunca ve
  un stack trace.

---

## 8. Componentes y archivos

| Capa     | Archivo                                          | Rol                                            |
|----------|--------------------------------------------------|------------------------------------------------|
| Backend  | `services/llm/llmService.ts`                     | Cliente agnóstico del LLM                      |
| Backend  | `services/prompts.ts`                            | Prompt de sistema base                         |
| Backend  | `services/chatContextService.ts`                 | Arma el resumen financiero híbrido             |
| Backend  | `services/chatService.ts`                         | Orquesta historial + contexto + LLM            |
| Backend  | `config/env.ts`                                  | Variables `LLM_*`                              |
| Mobile   | `services/chatApi.ts`                             | Llamadas al backend de chat                    |
| Mobile   | `components/ChatFab.tsx`                          | Botón flotante global                          |
| Mobile   | `components/ChatModal.tsx`                        | UI conversacional (modal)                      |
| Mobile   | `components/NavBar.tsx`                           | Montaje global del FAB sobre los tabs          |

---

## 9. Endpoints (ya existentes)

| Método | Ruta                                  | Descripción                       |
|--------|---------------------------------------|-----------------------------------|
| GET    | `/api/v1/chat/sessions`               | Lista las sesiones del usuario    |
| POST   | `/api/v1/chat/sessions`               | Crea una sesión                   |
| GET    | `/api/v1/chat/sessions/:id/messages`  | Mensajes de una sesión            |
| POST   | `/api/v1/chat/sessions/:id/messages`  | Envía un mensaje y recibe respuesta |

Todos protegidos por JWT (`authenticate`).
