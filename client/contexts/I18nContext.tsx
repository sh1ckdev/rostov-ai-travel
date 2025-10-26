import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'ru' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@app_language';

// Словари переводов
const translations = {
  ru: {
    // Общие
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.previous': 'Назад',
    'common.close': 'Закрыть',
    'common.confirm': 'Подтвердить',
    'common.yes': 'Да',
    'common.no': 'Нет',
    'common.ok': 'ОК',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.sort': 'Сортировка',
      'common.refresh': 'Обновить',
      'common.retry': 'Повторить',
      'common.all': 'Все',
      'common.seeAll': 'Смотреть все',
    
    // Навигация
      'nav.home': 'Главная',
      'nav.maps': 'Карты',
      'nav.ai': 'AI',
      'nav.profile': 'Профиль',
      'nav.explore': 'Исследовать',
      
      'home.greeting.morning': 'Доброе утро',
      'home.greeting.afternoon': 'Добрый день',
      'home.greeting.evening': 'Добрый вечер',
      'home.weather.sunny': 'Солнечно',
      'home.weather.cloudy': 'Облачно',
      'home.weather.rainy': 'Дождливо',
      'home.quickActions.title': 'Быстрые действия',
      'home.quickActions.ai': 'AI Помощник',
      'home.quickActions.aiDesc': 'Спросите о достопримечательностях',
      'home.quickActions.map': 'Карта города',
      'home.quickActions.mapDesc': 'Исследуйте Ростов-на-Дону',
      'home.quickActions.route': 'Планировщик маршрута',
      'home.quickActions.routeDesc': 'Создайте свой маршрут',
      'home.popular.title': 'Популярные места',
      'home.stats.places': 'Мест',
      'home.stats.restaurants': 'Ресторанов',
      'home.stats.hotels': 'Отелей',
    
    // Аутентификация
    'auth.login': 'Войти',
    'auth.register': 'Регистрация',
    'auth.logout': 'Выйти',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Подтвердите пароль',
    'auth.forgotPassword': 'Забыли пароль?',
    'auth.rememberMe': 'Запомнить меня',
    'auth.loginSuccess': 'Успешный вход',
    'auth.loginError': 'Ошибка входа',
    'auth.registerSuccess': 'Регистрация успешна',
    'auth.registerError': 'Ошибка регистрации',
    'auth.invalidCredentials': 'Неверные учетные данные',
    'auth.userExists': 'Пользователь уже существует',
    'auth.passwordsNotMatch': 'Пароли не совпадают',
    
    // Карты
    'maps.title': 'Карты',
    'maps.searchPlaceholder': 'Поиск мест...',
    'maps.currentLocation': 'Текущее местоположение',
    'maps.directions': 'Маршрут',
    'maps.distance': 'Расстояние',
    'maps.duration': 'Время в пути',
    'maps.startNavigation': 'Начать навигацию',
    'maps.stopNavigation': 'Остановить навигацию',
    'maps.clearRoute': 'Очистить маршрут',
    'maps.addWaypoint': 'Добавить точку',
    'maps.removeWaypoint': 'Удалить точку',
    'maps.myLocation': 'Мое местоположение',
    'maps.layers': 'Слои',
    'maps.satellite': 'Спутник',
    'maps.terrain': 'Рельеф',
    'maps.traffic': 'Пробки',
    'maps.poi': 'Интересные места',
    'maps.hotels': 'Отели',
    'maps.restaurants': 'Рестораны',
    'maps.attractions': 'Достопримечательности',
    
    // ИИ Помощник
    'ai.title': 'AI Помощник',
    'ai.placeholder': 'Задайте вопрос о путешествии...',
    'ai.send': 'Отправить',
    'ai.clear': 'Очистить',
    'ai.suggestions': 'Предложения',
    'ai.planRoute': 'Спланировать маршрут',
    'ai.findHotels': 'Найти отели',
    'ai.findRestaurants': 'Найти рестораны',
    'ai.weather': 'Погода',
    'ai.attractions': 'Достопримечательности',
    'ai.transport': 'Транспорт',
    'ai.budget': 'Бюджет',
    'ai.duration': 'Продолжительность',
    'ai.people': 'Количество людей',
    'ai.interests': 'Интересы',
    'ai.generatePlan': 'Сгенерировать план',
    'ai.planGenerated': 'План сгенерирован',
    'ai.errorGenerating': 'Ошибка генерации плана',
    
    // Профиль
    'profile.title': 'Профиль',
    'profile.settings': 'Настройки',
    'profile.theme': 'Тема',
    'profile.language': 'Язык',
    'profile.notifications': 'Уведомления',
    'profile.privacy': 'Конфиденциальность',
    'profile.about': 'О приложении',
    'profile.version': 'Версия',
    'profile.support': 'Поддержка',
    'profile.feedback': 'Обратная связь',
    'profile.rateApp': 'Оценить приложение',
    'profile.shareApp': 'Поделиться приложением',
    
    // Настройки темы
    'theme.light': 'Светлая',
    'theme.dark': 'Темная',
    'theme.system': 'Системная',
    'theme.auto': 'Автоматически',
    
    // Настройки языка
    'language.russian': 'Русский',
    'language.english': 'English',
    
    // Ошибки
    'error.network': 'Ошибка сети',
    'error.server': 'Ошибка сервера',
    'error.unknown': 'Неизвестная ошибка',
    'error.locationPermission': 'Нет разрешения на местоположение',
    'error.cameraPermission': 'Нет разрешения на камеру',
    'error.storagePermission': 'Нет разрешения на хранилище',
    'error.invalidInput': 'Неверный ввод',
    'error.required': 'Обязательное поле',
    'error.minLength': 'Минимальная длина: {min}',
    'error.maxLength': 'Максимальная длина: {max}',
    'error.invalidEmail': 'Неверный email',
    'error.weakPassword': 'Слабый пароль',
    
    // Успешные операции
    'success.saved': 'Сохранено',
    'success.deleted': 'Удалено',
    'success.updated': 'Обновлено',
    'success.created': 'Создано',
    'success.sent': 'Отправлено',
    'success.copied': 'Скопировано',
  },
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
      'common.refresh': 'Refresh',
      'common.retry': 'Retry',
      'common.all': 'All',
      'common.seeAll': 'See All',
    
    // Navigation
      'nav.home': 'Home',
      'nav.maps': 'Maps',
      'nav.ai': 'AI',
      'nav.profile': 'Profile',
      'nav.explore': 'Explore',
      
      'home.greeting.morning': 'Good morning',
      'home.greeting.afternoon': 'Good afternoon',
      'home.greeting.evening': 'Good evening',
      'home.weather.sunny': 'Sunny',
      'home.weather.cloudy': 'Cloudy',
      'home.weather.rainy': 'Rainy',
      'home.quickActions.title': 'Quick Actions',
      'home.quickActions.ai': 'AI Assistant',
      'home.quickActions.aiDesc': 'Ask about attractions',
      'home.quickActions.map': 'City Map',
      'home.quickActions.mapDesc': 'Explore Rostov-on-Don',
      'home.quickActions.route': 'Route Planner',
      'home.quickActions.routeDesc': 'Create your route',
      'home.popular.title': 'Popular Places',
      'home.stats.places': 'Places',
      'home.stats.restaurants': 'Restaurants',
      'home.stats.hotels': 'Hotels',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember Me',
    'auth.loginSuccess': 'Login successful',
    'auth.loginError': 'Login error',
    'auth.registerSuccess': 'Registration successful',
    'auth.registerError': 'Registration error',
    'auth.invalidCredentials': 'Invalid credentials',
    'auth.userExists': 'User already exists',
    'auth.passwordsNotMatch': 'Passwords do not match',
    
    // Maps
    'maps.title': 'Maps',
    'maps.searchPlaceholder': 'Search places...',
    'maps.currentLocation': 'Current Location',
    'maps.directions': 'Directions',
    'maps.distance': 'Distance',
    'maps.duration': 'Duration',
    'maps.startNavigation': 'Start Navigation',
    'maps.stopNavigation': 'Stop Navigation',
    'maps.clearRoute': 'Clear Route',
    'maps.addWaypoint': 'Add Waypoint',
    'maps.removeWaypoint': 'Remove Waypoint',
    'maps.myLocation': 'My Location',
    'maps.layers': 'Layers',
    'maps.satellite': 'Satellite',
    'maps.terrain': 'Terrain',
    'maps.traffic': 'Traffic',
    'maps.poi': 'Points of Interest',
    'maps.hotels': 'Hotels',
    'maps.restaurants': 'Restaurants',
    'maps.attractions': 'Attractions',
    
    // AI Assistant
    'ai.title': 'AI Assistant',
    'ai.placeholder': 'Ask a question about travel...',
    'ai.send': 'Send',
    'ai.clear': 'Clear',
    'ai.suggestions': 'Suggestions',
    'ai.planRoute': 'Plan Route',
    'ai.findHotels': 'Find Hotels',
    'ai.findRestaurants': 'Find Restaurants',
    'ai.weather': 'Weather',
    'ai.attractions': 'Attractions',
    'ai.transport': 'Transport',
    'ai.budget': 'Budget',
    'ai.duration': 'Duration',
    'ai.people': 'Number of People',
    'ai.interests': 'Interests',
    'ai.generatePlan': 'Generate Plan',
    'ai.planGenerated': 'Plan generated',
    'ai.errorGenerating': 'Error generating plan',
    
    // Profile
    'profile.title': 'Profile',
    'profile.settings': 'Settings',
    'profile.theme': 'Theme',
    'profile.language': 'Language',
    'profile.notifications': 'Notifications',
    'profile.privacy': 'Privacy',
    'profile.about': 'About App',
    'profile.version': 'Version',
    'profile.support': 'Support',
    'profile.feedback': 'Feedback',
    'profile.rateApp': 'Rate App',
    'profile.shareApp': 'Share App',
    
    // Theme settings
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'theme.auto': 'Auto',
    
    // Language settings
    'language.russian': 'Русский',
    'language.english': 'English',
    
    // Errors
    'error.network': 'Network error',
    'error.server': 'Server error',
    'error.unknown': 'Unknown error',
    'error.locationPermission': 'Location permission denied',
    'error.cameraPermission': 'Camera permission denied',
    'error.storagePermission': 'Storage permission denied',
    'error.invalidInput': 'Invalid input',
    'error.required': 'Required field',
    'error.minLength': 'Minimum length: {min}',
    'error.maxLength': 'Maximum length: {max}',
    'error.invalidEmail': 'Invalid email',
    'error.weakPassword': 'Weak password',
    
    // Success operations
    'success.saved': 'Saved',
    'success.deleted': 'Deleted',
    'success.updated': 'Updated',
    'success.created': 'Created',
    'success.sent': 'Sent',
    'success.copied': 'Copied',
    
    // Additional translations
    'common.all': 'All',
    'maps.style': 'Style',
    'maps.layers': 'Layers',
    'maps.satellite': 'Satellite',
    'maps.terrain': 'Terrain',
    'maps.traffic': 'Traffic',
    'maps.poi': 'Points of Interest',
    'maps.hotels': 'Hotels',
    'maps.restaurants': 'Restaurants',
    'maps.attractions': 'Attractions',
    'maps.shopping': 'Shopping',
    'maps.entertainment': 'Entertainment',
    'maps.transport': 'Transport',
    'maps.health': 'Health',
    'maps.education': 'Education',
    'maps.religious': 'Religious',
    'maps.nature': 'Nature',
    'maps.culture': 'Culture',
    'maps.sport': 'Sport',
    'maps.other': 'Other',
  },
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ru');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && ['ru', 'en'].includes(savedLanguage)) {
          setLanguageState(savedLanguage as Language);
        } else {
          setLanguageState('en');
        }
      } catch (error) {
        console.error('Ошибка загрузки языка:', error);
        setLanguageState('en');
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    } catch (error) {
      console.error('Ошибка сохранения языка:', error);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[language][key] || key;
    
    if (params) {
      return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return translation;
  };

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n должен использоваться внутри I18nProvider');
  }
  return context;
};
