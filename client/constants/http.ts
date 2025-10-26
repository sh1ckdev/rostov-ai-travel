import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Базовый URL бекенда согласно Swagger документации
const BACKEND_URL = 'http://138.124.14.197:8080';
const API_BASE_URL = `${BACKEND_URL}/api`;

// AI API URL (БЕЗ /api, HotelController не использует api/ префикс)
const AI_BACKEND_URL = 'http://138.124.14.197:8082';
const AI_API_BASE_URL = AI_BACKEND_URL;

// API URL для запросов
export const API_URL = {
  get value() {
    return API_BASE_URL;
  }
};

export const AI_API_URL = {
  get value() {
    return AI_API_BASE_URL;
  }
};

// Функция для инициализации API URL
export const initializeAPI = async (): Promise<string> => {
  console.log('✅ API URL инициализирован:', API_BASE_URL);
  console.log('✅ AI API URL инициализирован:', AI_API_BASE_URL);
  return API_BASE_URL;
};

// Создаем axios экземпляр согласно Swagger документации
const $api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 15000, // 15 секунд для обычных запросов
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Создаем отдельный axios экземпляр для AI API с увеличенным таймаутом
const $aiApi = axios.create({
  baseURL: AI_API_BASE_URL,
  withCredentials: false,
  timeout: 60000, // 60 секунд для AI запросов (OpenRouter может долго отвечать)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Функция для настройки interceptors (используется для обоих инстансов)
const setupInterceptors = (instance: typeof $api, apiName: string) => {
  // Перехватчик для добавления авторизации
  instance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';
    
    // Логируем запрос для отладки
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🌐 ${apiName} ${config.method?.toUpperCase()} запрос:`, fullUrl);
    
    // Дополнительное логирование для login/register
    if (config.url?.includes('/Auth/login') || config.url?.includes('/Auth/register')) {
      console.log('📝 Данные запроса:', JSON.stringify(config.data, null, 2));
    }
    
    return config;
  });

  // Обработка ошибок
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const isHealthCheck = error.config?.url?.includes('/Health');
      
      if (!isHealthCheck) {
        if (error.response?.status >= 500) {
          console.error(`❌ Ошибка ${apiName}:`, error.response?.status, error.config?.url);
        }
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error(`Превышено время ожидания ответа от ${apiName}`);
      }

      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error(`Не удается подключиться к ${apiName}. Проверьте подключение к интернету`);
      }

      if (error.code === 'ECONNREFUSED') {
        throw new Error(`${apiName} недоступен. Проверьте, что сервер запущен`);
      }
      
      const originalRequest = error.config;
      const isLoginRequest = originalRequest?.url?.includes('/Auth/login');
      const isRegisterRequest = originalRequest?.url?.includes('/Auth/register');
      
      // Для login и register не пытаемся обновлять токен
      if (error.response?.status === 401 && !originalRequest?._retry && !isHealthCheck && !isLoginRequest && !isRegisterRequest) {
        console.warn(`⚠️ Получена ошибка 401 для ${apiName}:`, originalRequest?.url);
        originalRequest._retry = true;
        
        try {
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          if (refreshToken) {
            console.log('🔄 Попытка обновить токен...');
            const accessToken = await AsyncStorage.getItem('token');
            
            const response = await axios.post(`${API_BASE_URL}/Auth/refresh`, {
              accessToken,
              refreshToken
            });
            
            if (response.data.accessToken) {
              console.log('✅ Токен успешно обновлён');
              await AsyncStorage.setItem('token', response.data.accessToken);
              if (response.data.refreshToken) {
                await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
              }
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              return instance(originalRequest);
            }
          } else {
            console.warn('⚠️ Refresh token отсутствует, требуется повторная авторизация');
          }
        } catch (refreshError) {
          console.error('❌ Не удалось обновить токен:', refreshError);
          // Очищаем токены только если обновление не удалось
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('refreshToken');
          
          // Создаём более понятную ошибку для пользователя
          const authError = new Error('Сессия истекла. Пожалуйста, войдите снова.');
          authError.name = 'AuthenticationError';
          return Promise.reject(authError);
        }
      }
      
      // Для других ошибок 401 (без refresh token или после неудачного обновления)
      if (error.response?.status === 401) {
        console.warn('⚠️ Неавторизованный запрос:', originalRequest?.url);
      }
      
      return Promise.reject(error);
    }
  );
};

// Настраиваем interceptors для обоих инстансов
setupInterceptors($api, 'API');
setupInterceptors($aiApi, 'AI API');

export { $api, $aiApi };