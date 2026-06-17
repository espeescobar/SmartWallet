import { chatRepository } from '../repositories/chatRepository';
import { chatContextService } from './chatContextService';
import { SYSTEM_PROMPT } from './prompts';
import { generateReply, isLLMConfigured, LLMMessage } from './llm/llmService';
import { AppError } from '../middlewares/errorHandler';
import { ChatSession, ChatMessage } from '../models/types';

// Cuántos mensajes del historial se envían al LLM (control de tokens/costos).
const HISTORY_LIMIT = 12;

const FALLBACK_REPLY =
  'Por ahora no puedo responder (el asistente no está disponible). ' +
  'Intenta de nuevo en un momento. Mientras tanto, recuerda la regla 50/30/20: ' +
  '50% necesidades, 30% gustos y 20% ahorro.';

export const chatService = {

  async getSessions(userId: string): Promise<ChatSession[]> {
    return chatRepository.findSessionsByUserId(userId);
  },

  async createSession(userId: string): Promise<ChatSession> {
    return chatRepository.createSession(userId);
  },

  async getMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
    const session = await chatRepository.findSessionById(sessionId, userId);
    if (!session) throw new AppError(404, 'Sesión de chat no encontrada');
    return chatRepository.findMessages(sessionId);
  },

  async sendMessage(sessionId: string, userId: string, content: string): Promise<ChatMessage> {
    const session = await chatRepository.findSessionById(sessionId, userId);
    if (!session) throw new AppError(404, 'Sesión de chat no encontrada');

    // Guardar mensaje del usuario
    await chatRepository.addMessage(sessionId, 'user', content);

    // Auto-titular la sesión con el primer mensaje
    if (session.title === 'Nueva consulta') {
      const title = content.length > 60 ? `${content.slice(0, 57)}...` : content;
      await chatRepository.updateSessionTitle(sessionId, title);
    }

    const replyText = await this.generateAssistantReply(sessionId, userId);

    return chatRepository.addMessage(
      sessionId,
      'assistant',
      replyText.content,
      replyText.tokensUsed ?? undefined,
    );
  },

  /** Construye el contexto + historial y llama al LLM. Devuelve fallback si falla. */
  async generateAssistantReply(
    sessionId: string,
    userId: string,
  ): Promise<{ content: string; tokensUsed: number | null }> {
    if (!isLLMConfigured()) {
      return { content: FALLBACK_REPLY, tokensUsed: null };
    }

    try {
      // Prompt de sistema + contexto financiero agregado (estrategia híbrida)
      const context = await chatContextService.buildContext(userId);
      const systemContent = context
        ? `${SYSTEM_PROMPT}\n\n${context}`
        : SYSTEM_PROMPT;

      // Historial reciente (ya incluye el mensaje del usuario recién guardado)
      const history = await chatRepository.findMessages(sessionId);
      const recent = history.slice(-HISTORY_LIMIT);

      const messages: LLMMessage[] = [
        { role: 'system', content: systemContent },
        ...recent.map((m) => ({
          role: m.role === 'system' ? ('assistant' as const) : m.role,
          content: m.content,
        })),
      ];

      const reply = await generateReply(messages);
      if (!reply.content) return { content: FALLBACK_REPLY, tokensUsed: null };
      return reply;
    } catch (err) {
      console.error('[chatService] Error generando respuesta del LLM:', err);
      return { content: FALLBACK_REPLY, tokensUsed: null };
    }
  },
};
