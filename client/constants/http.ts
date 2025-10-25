import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Конфигурация для работы с сервером
// ВАЖНО: После деплоя на Dokploy замените на ваш IP или домен!
const BACKEND_URL = 'http://138.124.14.197:5000/api'; // Замените на IP вашего Dokploy сервера

const getBaseURL = () => {
  if (__DEV__) {
    // В режиме разработки
    return BACKEND_URL;
  }
  // Для продакшена
  return BACKEND_URL;
};

export const API_URL = getBaseURL();

const $api = axios.create({
  withCredentials: false, // Для React Native лучше отключить
  baseURL: API_URL,
  timeout: 15000, // Увеличен таймаут
});

$api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});

// Добавляем обработку ошибок сети
$api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('Network error:', error);
      throw new Error('Проверьте подключение к интернету и запущен ли сервер');
    }
    
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.get(`${API_URL}/refresh`, { 
          withCredentials: true 
        });
        if (response.data.accessToken) {
          await AsyncStorage.setItem('token', response.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return $api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await AsyncStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export { $api };