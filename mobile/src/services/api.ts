import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// En Expo web/simulador el backend corre en localhost.
// Si usas dispositivo físico o emulador Android, cambia a la IP de tu máquina.
const BASE_URL = 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el token JWT a cada request automáticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
