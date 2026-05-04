import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface User {
  id: string;
  full_name: string;
  email: string;
  monthly_income: number;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<User | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('access_token').then((stored) => {
      if (stored) {
        setToken(stored);
        api.get('/auth/me')
          .then((res) => setUser(res.data))
          .catch(() => AsyncStorage.removeItem('access_token'))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, tokens } = res.data;
    await AsyncStorage.setItem('access_token', tokens.accessToken);
    setToken(tokens.accessToken);
    setUser(userData);
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    await AsyncStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
