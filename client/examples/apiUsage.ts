// Примеры использования всех API сервисов

import {
  AuthService,
  EventService,
  HotelService,
  AIHotelService,
  WeatherService,
  ApiUtils,
  RegisterModel,
  LoginModel,
  CreateEventDto,
  CreateHotelDto,
  EventBookingDto,
  HotelBookingDto
} from '../services';

/**
 * Примеры использования AuthService
 */
export class AuthExamples {
  /**
   * Регистрация нового пользователя
   */
  static async registerUser() {
    try {
      const registerData: RegisterModel = {
        login: 'newuser',
        password: 'password123',
        confirmPassword: 'password123',
        email: 'user@example.com',
        fullName: 'Иван Иванов'
      };

      const response = await AuthService.register(registerData);
      console.log('Регистрация успешна:', response.data);
    } catch (error) {
      console.error('Ошибка регистрации:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Вход в систему
   */
  static async loginUser() {
    try {
      const loginData: LoginModel = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await AuthService.login(loginData);
      
      // Сохраняем токены
      await ApiUtils.saveTokens(response.data);
      
      console.log('Вход успешен:', response.data);
    } catch (error) {
      console.error('Ошибка входа:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Получение информации о пользователе
   */
  static async getUserInfo() {
    try {
      const response = await AuthService.getMe();
      console.log('Информация о пользователе:', response.data);
    } catch (error) {
      console.error('Ошибка получения информации:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Выход из системы
   */
  static async logoutUser() {
    try {
      await AuthService.logout();
      await ApiUtils.clearTokens();
      console.log('Выход выполнен');
    } catch (error) {
      console.error('Ошибка выхода:', ApiUtils.handleApiError(error));
    }
  }
}

/**
 * Примеры использования EventService
 */
export class EventExamples {
  /**
   * Получение списка событий
   */
  static async getEvents() {
    try {
      const response = await EventService.getEvents({
        Page: 1,
        PageSize: 10,
        Filters: 'isAvalible:true'
      });
      console.log('События:', response.data);
    } catch (error) {
      console.error('Ошибка получения событий:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Создание нового события
   */
  static async createEvent() {
    try {
      const eventData: CreateEventDto = {
        name: 'Концерт в парке',
        description: 'Отличный концерт под открытым небом',
        cost: '500',
        adress: 'Центральный парк',
        contacts: '+7 (999) 123-45-67',
        ageLimit: 16,
        datetimeOpen: { hour: 18, minute: 0 },
        datetimeClose: { hour: 22, minute: 0 }
      };

      const response = await EventService.createEvent(eventData);
      console.log('Событие создано:', response.data);
    } catch (error) {
      console.error('Ошибка создания события:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Бронирование события
   */
  static async bookEvent() {
    try {
      const bookingData: EventBookingDto = {
        eventId: 1,
        ticketsCount: 2,
        bookingDate: ApiUtils.formatDateForApi(new Date()),
        notes: 'Бронирование на двоих'
      };

      const response = await EventService.bookEvent(1, bookingData);
      console.log('Бронирование создано:', response.data);
    } catch (error) {
      console.error('Ошибка бронирования:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Поиск событий
   */
  static async searchEvents() {
    try {
      const response = await EventService.searchEvents({ query: 'концерт' });
      console.log('Найденные события:', response.data);
    } catch (error) {
      console.error('Ошибка поиска:', ApiUtils.handleApiError(error));
    }
  }
}

/**
 * Примеры использования HotelService
 */
export class HotelExamples {
  /**
   * Получение списка отелей
   */
  static async getHotels() {
    try {
      const response = await HotelService.getHotels({
        Page: 1,
        PageSize: 10,
        Filters: 'isAvalible:true'
      });
      console.log('Отели:', response.data);
    } catch (error) {
      console.error('Ошибка получения отелей:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Создание нового отеля
   */
  static async createHotel() {
    try {
      const hotelData: CreateHotelDto = {
        name: 'Гранд Отель',
        description: 'Роскошный отель в центре города',
        cost: '5000',
        adress: 'ул. Центральная, 1',
        contacts: '+7 (999) 123-45-67',
        daytimeOpen: { hour: 0, minute: 0 },
        daytimeClose: { hour: 23, minute: 59 }
      };

      const response = await HotelService.createHotel(hotelData);
      console.log('Отель создан:', response.data);
    } catch (error) {
      console.error('Ошибка создания отеля:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Бронирование отеля
   */
  static async bookHotel() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const bookingData: HotelBookingDto = {
        hotelId: 1,
        checkInDate: ApiUtils.formatDateForApi(tomorrow),
        checkOutDate: ApiUtils.formatDateForApi(dayAfterTomorrow),
        notes: 'Бронирование на одну ночь'
      };

      const response = await HotelService.bookHotel(1, bookingData);
      console.log('Бронирование отеля создано:', response.data);
    } catch (error) {
      console.error('Ошибка бронирования отеля:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Проверка доступности отеля
   */
  static async checkHotelAvailability() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const response = await HotelService.checkAvailability({
        hotelId: 1,
        checkIn: ApiUtils.formatDateForApi(tomorrow),
        checkOut: ApiUtils.formatDateForApi(dayAfterTomorrow)
      });
      console.log('Доступность отеля:', response.data);
    } catch (error) {
      console.error('Ошибка проверки доступности:', ApiUtils.handleApiError(error));
    }
  }
}

/**
 * Примеры использования AIHotelService
 */
export class AIExamples {
  /**
   * Получение рекомендаций отелей
   */
  static async getHotelRecommendations() {
    try {
      const response = await AIHotelService.getRecommendations({
        location: 'Ростов-на-Дону'
      });
      console.log('Рекомендации отелей:', response.data);
    } catch (error) {
      console.error('Ошибка получения рекомендаций:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Начало чата с AI
   */
  static async startChat() {
    try {
      const response = await AIHotelService.startChat({
        location: 'Ростов-на-Дону'
      });
      console.log('Чат начат:', response.data);
      return response.data.sessionId;
    } catch (error) {
      console.error('Ошибка начала чата:', ApiUtils.handleApiError(error));
      return null;
    }
  }

  /**
   * Отправка сообщения в чат
   */
  static async sendMessage(sessionId: string) {
    try {
      const response = await AIHotelService.sendMessage({
        sessionId,
        message: 'Покажи мне лучшие отели в центре города'
      });
      console.log('Ответ AI:', response.data);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Полный пример чата
   */
  static async fullChatExample() {
    try {
      // Начинаем чат
      const sessionId = await this.startChat();
      if (!sessionId) return;

      // Отправляем несколько сообщений
      await this.sendMessage(sessionId);
      
      // Получаем историю чата
      const history = await AIHotelService.getChatHistory(sessionId);
      console.log('История чата:', history.data);
    } catch (error) {
      console.error('Ошибка в чате:', ApiUtils.handleApiError(error));
    }
  }
}

/**
 * Примеры использования WeatherService
 */
export class WeatherExamples {
  /**
   * Получение прогноза погоды
   */
  static async getWeatherForecast() {
    try {
      const response = await WeatherService.getPublicWeatherForecast();
      console.log('Прогноз погоды:', response.data);
    } catch (error) {
      console.error('Ошибка получения прогноза:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Получение погоды на сегодня
   */
  static async getTodayWeather() {
    try {
      const weather = await WeatherService.getTodayWeather();
      console.log('Погода сегодня:', weather);
    } catch (error) {
      console.error('Ошибка получения погоды:', ApiUtils.handleApiError(error));
    }
  }

  /**
   * Получение рекомендаций по одежде
   */
  static async getClothingRecommendations() {
    try {
      const recommendations = await WeatherService.getClothingRecommendations();
      console.log('Рекомендации по одежде:', recommendations);
    } catch (error) {
      console.error('Ошибка получения рекомендаций:', ApiUtils.handleApiError(error));
    }
  }
}

/**
 * Комплексный пример использования всех сервисов
 */
export class ComprehensiveExample {
  /**
   * Полный пример работы с приложением
   */
  static async fullAppExample() {
    try {
      console.log('🚀 Запуск комплексного примера...');

      // 1. Проверяем авторизацию
      const isAuth = await ApiUtils.isAuthenticated();
      console.log('Авторизован:', isAuth);

      if (!isAuth) {
        // 2. Регистрируемся или входим
        await AuthExamples.loginUser();
      }

      // 3. Получаем информацию о пользователе
      await AuthExamples.getUserInfo();

      // 4. Получаем прогноз погоды
      await WeatherExamples.getTodayWeather();
      await WeatherExamples.getClothingRecommendations();

      // 5. Получаем рекомендации отелей
      await AIExamples.getHotelRecommendations();

      // 6. Начинаем чат с AI
      await AIExamples.fullChatExample();

      // 7. Получаем список отелей
      await HotelExamples.getHotels();

      // 8. Получаем список событий
      await EventExamples.getEvents();

      console.log('✅ Комплексный пример завершен успешно!');
    } catch (error) {
      console.error('❌ Ошибка в комплексном примере:', ApiUtils.handleApiError(error));
    }
  }
}
