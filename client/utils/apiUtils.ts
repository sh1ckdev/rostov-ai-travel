import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponseModel, ProblemDetails } from '../types/api';

/**
 * Утилиты для работы с API
 */
export class ApiUtils {
  /**
   * Сохранение токенов в AsyncStorage
   */
  static async saveTokens(loginResponse: LoginResponseModel): Promise<void> {
    try {
      if (loginResponse.accessToken) {
        await AsyncStorage.setItem('token', loginResponse.accessToken);
      }
      if (loginResponse.refreshToken) {
        await AsyncStorage.setItem('refreshToken', loginResponse.refreshToken);
      }
      if (loginResponse.username) {
        await AsyncStorage.setItem('username', loginResponse.username);
      }
      if (loginResponse.refreshTokenExpires) {
        await AsyncStorage.setItem('tokenExpires', loginResponse.refreshTokenExpires);
      }
    } catch (error) {
      console.error('Ошибка сохранения токенов:', error);
      throw error;
    }
  }

  /**
   * Получение токена доступа
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Ошибка получения токена:', error);
      return null;
    }
  }

  /**
   * Получение refresh токена
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Ошибка получения refresh токена:', error);
      return null;
    }
  }

  /**
   * Очистка всех токенов
   */
  static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'username', 'tokenExpires']);
    } catch (error) {
      console.error('Ошибка очистки токенов:', error);
      throw error;
    }
  }

  /**
   * Проверка, авторизован ли пользователь
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return token !== null && token.length > 0;
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      return false;
    }
  }

  /**
   * Проверка, истек ли токен
   */
  static async isTokenExpired(): Promise<boolean> {
    try {
      const expiresAt = await AsyncStorage.getItem('tokenExpires');
      if (!expiresAt) {
        return true;
      }
      
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      
      return now >= expirationDate;
    } catch (error) {
      console.error('Ошибка проверки истечения токена:', error);
      return true;
    }
  }

  /**
   * Получение имени пользователя
   */
  static async getUsername(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('username');
    } catch (error) {
      console.error('Ошибка получения имени пользователя:', error);
      return null;
    }
  }

  /**
   * Обработка ошибок API
   */
  static handleApiError(error: any): string {
    if (error.response?.data) {
      const problemDetails = error.response.data as ProblemDetails;
      
      if (problemDetails.title) {
        return problemDetails.title;
      }
      
      if (problemDetails.detail) {
        return problemDetails.detail;
      }
      
      if (typeof problemDetails === 'string') {
        return problemDetails;
      }
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'Произошла неизвестная ошибка';
  }

  /**
   * Форматирование даты для API
   */
  static formatDateForApi(date: Date): string {
    return date.toISOString();
  }

  /**
   * Парсинг даты из API
   */
  static parseDateFromApi(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Форматирование времени для API
   */
  static formatTimeForApi(hours: number, minutes: number): { hour: number; minute: number } {
    return {
      hour: hours,
      minute: minutes
    };
  }

  /**
   * Создание query параметров для фильтрации
   */
  static createFilterParams(filters: Record<string, any>): string {
    const filterParts: string[] = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'boolean') {
          filterParts.push(`${key}:${value}`);
        } else if (typeof value === 'number') {
          filterParts.push(`${key}:${value}`);
        } else if (typeof value === 'string') {
          filterParts.push(`${key}:${value}`);
        } else if (Array.isArray(value)) {
          filterParts.push(`${key}:${value.join(',')}`);
        }
      }
    });
    
    return filterParts.join(',');
  }

  /**
   * Создание query параметров для сортировки
   */
  static createSortParams(sorts: Record<string, 'asc' | 'desc'>): string {
    const sortParts: string[] = [];
    
    Object.entries(sorts).forEach(([field, direction]) => {
      sortParts.push(`${field}:${direction}`);
    });
    
    return sortParts.join(',');
  }

  /**
   * Валидация email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Валидация пароля
   */
  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  /**
   * Валидация логина
   */
  static isValidLogin(login: string): boolean {
    return login.length >= 3;
  }

  /**
   * Генерация уникального ID для сессии
   */
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Форматирование цены
   */
  static formatPrice(price: string | number): string {
    if (typeof price === 'number') {
      return `${price} ₽`;
    }
    return price;
  }

  /**
   * Форматирование времени
   */
  static formatTime(hours: number, minutes: number): string {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
  }

  /**
   * Форматирование даты
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Форматирование даты и времени
   */
  static formatDateTime(date: Date): string {
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Получение статуса бронирования на русском языке
   */
  static getBookingStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Ожидает подтверждения',
      'confirmed': 'Подтверждено',
      'cancelled': 'Отменено',
      'completed': 'Завершено',
      'expired': 'Истекло'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Получение цвета статуса бронирования
   */
  static getBookingStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'pending': '#FFA500',
      'confirmed': '#4CAF50',
      'cancelled': '#F44336',
      'completed': '#2196F3',
      'expired': '#9E9E9E'
    };
    
    return colorMap[status] || '#9E9E9E';
  }

  /**
   * Проверка, является ли дата сегодняшней
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Проверка, является ли дата завтрашней
   */
  static isTomorrow(date: Date): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  }

  /**
   * Получение относительного времени
   */
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Сегодня';
    } else if (diffInDays === 1) {
      return 'Завтра';
    } else if (diffInDays === -1) {
      return 'Вчера';
    } else if (diffInDays > 0) {
      return `Через ${diffInDays} дн.`;
    } else {
      return `${Math.abs(diffInDays)} дн. назад`;
    }
  }
}
