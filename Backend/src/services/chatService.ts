import { chatRepository } from '../repositories/chatRepository';
import { AppError } from '../middlewares/errorHandler';
import { ChatSession, ChatMessage } from '../models/types';

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

    // TODO: integrar LLM (Claude API) para generar la respuesta
    // Por ahora devuelve un placeholder
    const reply = await chatRepository.addMessage(
      sessionId,
      'assistant',
      'Pronto estaré conectado a un modelo de lenguaje para responder tus preguntas financieras.',
    );

    return reply;
  },
};
