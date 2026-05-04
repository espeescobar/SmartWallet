import { pool } from '../config/database';
import { ChatSession, ChatMessage } from '../models/types';

export const chatRepository = {

  async findSessionsByUserId(userId: string): Promise<ChatSession[]> {
    const { rows } = await pool.query<ChatSession>(
      'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId],
    );
    return rows;
  },

  async findSessionById(id: string, userId: string): Promise<ChatSession | null> {
    const { rows } = await pool.query<ChatSession>(
      'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    return rows[0] ?? null;
  },

  async createSession(userId: string, title = 'Nueva consulta'): Promise<ChatSession> {
    const { rows } = await pool.query<ChatSession>(
      'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING *',
      [userId, title],
    );
    return rows[0];
  },

  async updateSessionTitle(id: string, title: string): Promise<void> {
    await pool.query(
      'UPDATE chat_sessions SET title = $1 WHERE id = $2',
      [title, id],
    );
  },

  async findMessages(sessionId: string): Promise<ChatMessage[]> {
    const { rows } = await pool.query<ChatMessage>(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId],
    );
    return rows;
  },

  async addMessage(
    sessionId: string,
    role: ChatMessage['role'],
    content: string,
    tokensUsed?: number,
  ): Promise<ChatMessage> {
    const { rows } = await pool.query<ChatMessage>(
      `INSERT INTO chat_messages (session_id, role, content, tokens_used)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [sessionId, role, content, tokensUsed ?? null],
    );
    return rows[0];
  },
};
