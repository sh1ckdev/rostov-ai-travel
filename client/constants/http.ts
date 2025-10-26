import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Базовый URL бекенда согласно Swagger документации
const BACKEND_URL = 'http://138.124.14.197:8080';
const API_BASE_URL = `${BACKEND_URL}/api`;

// API URL для запросов
export const API_URL = {
  get value() {
    return API_BASE_URL;
  }
};

// Функция для инициализации API URL
export const initializeAPI = async (): Promise<string> => {
  console.log('🚀 Запуск initializeAPI()...');
  console.log('✅ API URL инициализирован:', API_BASE_URL);
  console.log('📡 Полный URL для запросов:', API_BASE_URL);
  return API_BASE_URL;
};

// Создаем axios экземпляр согласно Swagger документации
const $api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Перехватчик для добавления авторизации
$api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  config.headers['Content-Type'] = 'application/json';
  config.headers['Accept'] = 'application/json';
  
  return config;
});

// Обработка ошибок
$api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('🌐 API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });

    // Обработка сетевых ошибок
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('❌ Network error:', error);
      throw new Error(`Не удается подключиться к серверу. Проверьте подключение к интернету и что сервер запущен на ${API_BASE_URL}`);
    }

    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused:', error);
      throw new Error(`Сервер недоступен. Проверьте, что бекенд запущен на ${API_BASE_URL}`);
    }
    
    // Обработка 401 Unauthorized
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const accessToken = await AsyncStorage.getItem('token');
          
          const response = await axios.post(`${API_BASE_URL}/Auth/refresh`, {
            accessToken,
            refreshToken
          });
          
          if (response.data.accessToken) {
            await AsyncStorage.setItem('token', response.data.accessToken);
            if (response.data.refreshToken) {
              await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return $api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
      }
    }
    
    return Promise.reject(error);
  }
);

export { $api };