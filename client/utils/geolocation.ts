// Утилиты для работы с геолокацией

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export class GeolocationService {
  // Координаты Ростова-на-Дону по умолчанию
  private static readonly DEFAULT_COORDINATES: LocationCoordinates = {
    latitude: 47.2357,
    longitude: 39.7125
  };

  /**
   * Получить текущее местоположение пользователя
   */
  static async getCurrentPosition(options?: GeolocationOptions): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      // Проверяем поддержку геолокации
      if (!navigator.geolocation) {
        console.warn('Геолокация не поддерживается браузером');
        resolve(this.DEFAULT_COORDINATES);
        return;
      }

      const defaultOptions: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 минут
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          console.log('Геолокация получена:', coordinates);
          resolve(coordinates);
        },
        (error) => {
          console.warn('Ошибка геолокации:', error.message);
          
          // Обрабатываем различные типы ошибок
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.warn('Пользователь отказал в доступе к геолокации');
              break;
            case error.POSITION_UNAVAILABLE:
              console.warn('Информация о местоположении недоступна');
              break;
            case error.TIMEOUT:
              console.warn('Превышено время ожидания геолокации');
              break;
            default:
              console.warn('Неизвестная ошибка геолокации');
              break;
          }
          
          // Возвращаем координаты по умолчанию
          resolve(this.DEFAULT_COORDINATES);
        },
        defaultOptions
      );
    });
  }

  /**
   * Запросить разрешение на геолокацию
   */
  static async requestPermission(): Promise<boolean> {
    try {
      if (!navigator.permissions) {
        console.warn('API разрешений не поддерживается');
        return false;
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      
      if (permission.state === 'granted') {
        console.log('Разрешение на геолокацию уже предоставлено');
        return true;
      }
      
      if (permission.state === 'denied') {
        console.warn('Разрешение на геолокацию отклонено');
        return false;
      }

      // Для 'prompt' состояния - пытаемся получить геолокацию
      try {
        await this.getCurrentPosition({ timeout: 5000 });
        return true;
      } catch {
        return false;
      }
    } catch (error) {
      console.warn('Ошибка при запросе разрешения:', error);
      return false;
    }
  }

  /**
   * Получить координаты по умолчанию (Ростов-на-Дону)
   */
  static getDefaultCoordinates(): LocationCoordinates {
    return { ...this.DEFAULT_COORDINATES };
  }

  /**
   * Проверить, поддерживается ли геолокация
   */
  static isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Получить координаты с fallback
   */
  static async getLocationWithFallback(): Promise<LocationCoordinates> {
    try {
      // Сначала пытаемся получить реальное местоположение
      const position = await this.getCurrentPosition();
      
      // Проверяем, что получили реальные координаты (не дефолтные)
      if (position.latitude === this.DEFAULT_COORDINATES.latitude && 
          position.longitude === this.DEFAULT_COORDINATES.longitude) {
        console.log('Используем координаты по умолчанию (Ростов-на-Дону)');
      } else {
        console.log('Используем реальные координаты пользователя');
      }
      
      return position;
    } catch (error) {
      console.warn('Ошибка получения геолокации, используем координаты по умолчанию:', error);
      return this.getDefaultCoordinates();
    }
  }

  /**
   * Вычислить расстояние между двумя точками (в км)
   */
  static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Радиус Земли в км
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}
