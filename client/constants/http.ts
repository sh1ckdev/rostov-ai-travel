import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const DEV_BACKEND_URLS = [
  'http://192.168.31.250:5000',    // РЕАЛЬНЫЙ IP адрес компьютера (приоритет!)
  'http://10.60.104.3:5000',       
  'http://localhost:5000',          
  'http://127.0.0.1:5000',         
  'http://10.0.2.2:5000',           // Android эмулятор
  'http://192.168.1.100:5000'       
];
const PROD_BACKEND_URL = 'http://138.124.14.197:5000'; 

// Функция для тестирования доступности URL
const testURL = async (url: string): Promise<boolean> => {
  try {
    console.log(`   🔍 Тестируем URL: ${url}/api/test`);
    
    const response = await axios.get(`${url}/api/test`, {
      timeout: 3000,
      validateStatus: (status) => status === 200
    });
    
    if (response.data?.message === 'Backend is working!') {
      console.log(`   ✅ URL ${url} доступен и отвечает корректно!`);
      return true;
    }
    
    console.log(`   ⚠️ URL ${url} доступен, но ответ некорректный:`, response.data);
    return false;
  } catch (error: any) {
    console.log(`   ❌ URL ${url} недоступен:`, error.message || error.code);
    return false;
  }
};

// Функция для поиска рабочего URL
const findWorkingURL = async (): Promise<string> => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('🔍 ПОИСК ДОСТУПНОГО БЕКЕНДА');
  console.log('═══════════════════════════════════════');
  console.log('📋 Список URL для проверки:');
  DEV_BACKEND_URLS.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url}`);
  });
  console.log('');
  
  for (let i = 0; i < DEV_BACKEND_URLS.length; i++) {
    const url = DEV_BACKEND_URLS[i];
    console.log(`🔍 Проверка ${i + 1}/${DEV_BACKEND_URLS.length}: ${url}`);
    const isWorking = await testURL(url);
    if (isWorking) {
      console.log('');
      console.log('✅✅✅ НАЙДЕН РАБОЧИЙ БЕКЕНД! ✅✅✅');
      console.log(`📡 URL: ${url}`);
      console.log('═══════════════════════════════════════');
      console.log('');
      return url;
    }
    console.log('');
  }
  
  console.log('❌ Ни один URL не доступен!');
  console.log(`⚠️ Используем первый по умолчанию: ${DEV_BACKEND_URLS[0]}`);
  console.log('═══════════════════════════════════════');
  console.log('');
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
  console.log('🚀 Запуск initializeAPI()...');
  
  // Сбрасываем кеш, чтобы заново найти рабочий URL
  cachedAPI_URL = null;
  
  const url = await getBaseURL();
  const apiUrl = `${url}/api`;
  API_URL.value = apiUrl;
  console.log('✅ API URL инициализирован:', apiUrl);
  console.log('📡 Полный URL для запросов:', apiUrl);
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