import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Более надежное определение URL
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Для Android эмулятора
      return 'http://10.0.2.2:5000/api';
    } else if (Platform.OS === 'ios') {
      // Для iOS симулятора
      return 'http://localhost:5000/api';
    } else {
      // Для физических устройств - IP адрес вашего компьютера
      return 'http://192.168.31.250:5000/api';
    }
  }
  return 'https://your-production-url.com/api';
};

export const API_URL = getBaseURL();

const $api = axios.create({
  withCredentials: true,  
  baseURL: API_URL,
  timeout: 10000, // Добавляем таймаут
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