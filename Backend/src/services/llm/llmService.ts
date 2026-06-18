import OpenAI from 'openai';
import { env } from '../../config/env';

/**
 * Capa agnóstica de LLM. Groq es compatible con la API de OpenAI, por lo que
 * reutilizamos el SDK `openai` apuntando su baseURL al proveedor configurado.
 * Cambiar de proveedor = cambiar las variables LLM_* en el .env (sin tocar código).
 * Ver docs/chatbot-arquitectura.md (sección 5).
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMReply {
  content: string;
  tokensUsed: number | null;
}

/** Indica si el LLM está configurado (hay API key). */
export function isLLMConfigured(): boolean {
  return Boolean(env.LLM_API_KEY);
}

// Cliente perezoso: solo se instancia si hay API key.
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: env.LLM_API_KEY,
      baseURL: env.LLM_BASE_URL,
    });
  }
  return client;
}

/**
 * Genera la respuesta del asistente a partir del arreglo de mensajes
 * (system + historial + mensaje del usuario).
 */
export async function generateReply(messages: LLMMessage[]): Promise<LLMReply> {
  const completion = await getClient().chat.completions.create({
    model: env.LLM_MODEL,
    messages,
    temperature: 0.6,
    max_tokens: 500,
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? '';
  const tokensUsed = completion.usage?.total_tokens ?? null;

  return { content, tokensUsed };
}
