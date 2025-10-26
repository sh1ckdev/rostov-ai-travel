import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Конфигурация для работы с сервером
const DEV_BACKEND_URLS = [
  'http://localhost:5000',          // Для эмулятора/симулятора
  'http://127.0.0.1:5000',          // Альтернативный localhost
  'http://10.60.104.3:5000',        // Ваш локальный IP
  'http://10.0.2.2:5000',           // Для Android эмулятора
  'http://192.168.1.100:5000'       // Резервный IP
];
const PROD_BACKEND_URL = 'http://10.60.104.3:5000'; // Продакшен URL

// Функция для тестирования доступности URL
const testURL = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/api/test`, {
      method: 'GET',
      timeout: 3000
    });
    return response.ok;
  } catch (error) {
    console.log(`❌ URL ${url} недоступен:`, error.message);
    return false;
  }
};

// Функция для поиска рабочего URL
const findWorkingURL = async (): Promise<string> => {
  console.log('🔍 Поиск доступного бекенда...');
  
  for (const url of DEV_BACKEND_URLS) {
    console.log(`🔍 Проверяем: ${url}`);
    const isWorking = await testURL(url);
    if (isWorking) {
      console.log(`✅ Найден рабочий URL: ${url}`);
      return url;
    }
  }
  
  console.log('❌ Ни один URL не доступен, используем первый по умолчанию');
  return DEV_BACKEND_URLS[0];
};

const getBaseURL = async () => {
  if (__DEV__) {
    // В режиме разработки ищем рабочий URL
    const workingURL = await findWorkingURL();
    console.log('🔧 Development mode - using URL:', workingURL);
    return workingURL;
  }
  // Для продакшена
  console.log('🚀 Production mode - using production IP:', PROD_BACKEND_URL);
  return PROD_BACKEND_URL;
};

// Экспортируем функцию для получения URL
export const getAPI_URL = getBaseURL;

// Для обратной совместимости создаем переменную
let cachedAPI_URL: string | null = null;

export const API_URL = {
  get value() {
    if (!cachedAPI_URL) {
      console.warn('⚠️ API_URL не инициализирован. Вызовите initializeAPI() сначала.');
      // Возвращаем первый URL по умолчанию с добавлением /api
      return `${DEV_BACKEND_URLS[0]}/api`;
    }
    return cachedAPI_URL;
  },
  set value(url: string) {
    cachedAPI_URL = url;
  }
};

// Функция для инициализации API URL
export const initializeAPI = async (): Promise<string> => {
  const url = await getBaseURL();
  const apiUrl = `${url}/api`;
  API_URL.value = apiUrl;
  console.log('🔧 API URL инициализирован:', apiUrl);
  return apiUrl;
};

// Создаем axios экземпляр с динамическим baseURL
const $api = axios.create({
  withCredentials: false, // Для React Native лучше отключить
  timeout: 15000, // Увеличен таймаут
});

// Перехватчик для установки правильного baseURL
$api.interceptors.request.use(async (config) => {
  if (!config.baseURL) {
    // Если API_URL уже содержит /api, не добавляем его повторно
    const baseURL = API_URL.value.includes('/api') ? API_URL.value : `${API_URL.value}/api`;
    config.baseURL = baseURL;
  }
  return config;
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
    console.log('🌐 API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });

    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('❌ Network error:', error);
      throw new Error(`Не удается подключиться к серверу. Проверьте:\n1. Подключение к интернету\n2. Запущен ли сервер на ${API_URL.value}\n3. Правильность IP адреса`);
    }

    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused:', error);
      throw new Error(`Сервер недоступен. Проверьте, что бекенд запущен на ${API_URL.value}`);
    }
    
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.get(`${API_URL.value}/refresh`, { 
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