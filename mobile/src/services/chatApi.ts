import { api } from './api';

// Tipos del backend (Backend/src/models/types.ts)
export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used: number | null;
  created_at: string;
}

export const chatApi = {
  async getSessions(): Promise<ChatSession[]> {
    const { data } = await api.get<ChatSession[]>('/chat/sessions');
    return data;
  },

  async createSession(): Promise<ChatSession> {
    const { data } = await api.post<ChatSession>('/chat/sessions');
    return data;
  },

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
    return data;
  },

  async sendMessage(sessionId: string, content: string): Promise<ChatMessage> {
    const { data } = await api.post<ChatMessage>(
      `/chat/sessions/${sessionId}/messages`,
      { content },
    );
    return data;
  },
};
