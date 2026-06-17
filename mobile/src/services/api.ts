import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL del backend. Por defecto localhost (web/simulador).
// Para celular físico se define en tiempo de ejecución con la variable
// EXPO_PUBLIC_API_URL (ver instrucciones), sin tocar el código.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // el chatbot llama a un LLM; damos margen para respuestas lentas
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el token JWT a cada request automáticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
