import {
  StartChatUserRequest,
  ChatMessageRequest,
  ChatResponse,
  ApiResponse,
  MessageDto
} from '../types/api';

export interface AISession {
  sessionId: string;
  location?: string;
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionId?: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  reasoning: string;
  action?: string;
}

export class AIHotelService {
  private static currentSession: AISession | null = null;
  private static sessionHistory: AISession[] = [];

  /**
   * Инициализация новой сессии чата с ИИ
   */
  static async initializeSession(location?: string): Promise<AISession> {
    try {
      console.log('🤖 Инициализация AI сессии (offline режим)...', { location });
      
      // Создаем локальную сессию без запроса к API
      const session: AISession = {
        sessionId: `session-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        location: location || 'Ростов-на-Дону',
        createdAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0
      };

      this.currentSession = session;
      this.sessionHistory.unshift(session);

      console.log('✅ AI сессия инициализирована (offline):', session.sessionId);
      return session;
    } catch (error) {
      console.error('❌ Ошибка инициализации AI сессии:', error);
      throw new Error('Не удалось инициализировать сессию с ИИ. Попробуйте еще раз.');
    }
  }

  /**
   * Отправка сообщения в текущую сессию
   */
  static async sendMessage(message: string): Promise<ChatMessage> {
    if (!this.currentSession) {
      throw new Error('Сессия не инициализирована. Сначала инициализируйте сессию.');
    }

    try {
      console.log('📤 Обработка сообщения (offline режим):', { message, sessionId: this.currentSession.sessionId });

      // Генерируем ответ на основе хардкод данных
      const response = await this.generateOfflineResponse(message);

      // Обновляем активность сессии
      this.currentSession.lastActivity = new Date();
      this.currentSession.messageCount++;

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sessionId: this.currentSession.sessionId
      };

      console.log('✅ Ответ сгенерирован (offline)');
      return aiMessage;
    } catch (error) {
      console.error('❌ Ошибка обработки сообщения:', error);
      throw new Error('Не удалось обработать сообщение. Попробуйте еще раз.');
    }
  }

  /**
   * Генерация ответа на основе хардкод данных (offline режим)
   */
  private static async generateOfflineResponse(message: string): Promise<string> {
    const { hardcodedHotels, searchHotels, getHotelsByFilters } = await import('../data/hotels');
    const lowerMessage = message.toLowerCase();

    // Приветствие
    if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй') || lowerMessage.includes('hello')) {
      return `Привет! 👋 Я ваш AI-помощник по туризму в Ростове-на-Дону. Могу помочь с:\n\n🏨 Рекомендациями по отелям\n💰 Поиском по бюджету\n⭐ Лучшими вариантами по рейтингу\n🔍 Поиском конкретных отелей\n\nЧто вас интересует?`;
    }

    // Помощь
    if (lowerMessage.includes('помощь') || lowerMessage.includes('help') || lowerMessage.includes('что ты умеешь')) {
      return `🤖 Я умею:\n\n• Искать отели по названию\n• Рекомендовать бюджетные варианты\n• Показывать лучшие отели по рейтингу\n• Фильтровать по цене и удобствам\n• Давать советы по размещению\n\nПросто напишите что вас интересует!`;
    }

    // Поиск отелей по ключевым словам
    if (lowerMessage.includes('отель') || lowerMessage.includes('гостиниц') || lowerMessage.includes('где остановиться') || lowerMessage.includes('размещение')) {
      const hotels = searchHotels(message);
      
      if (hotels.length > 0) {
        let response = `🏨 Нашел для вас ${hotels.length} отел${hotels.length === 1 ? 'ь' : 'я/ей'}:\n\n`;
        hotels.slice(0, 3).forEach((hotel, i) => {
          response += `${i + 1}. **${hotel.name}** (${hotel.starRating}⭐)\n`;
          response += `   📍 ${hotel.address}\n`;
          response += `   💰 ${hotel.pricePerNight} ${hotel.currency}/ночь\n`;
          response += `   ⭐ Рейтинг: ${hotel.rating.toFixed(1)}\n`;
          response += `   ✨ ${hotel.description}\n\n`;
        });
        return response;
      }
    }

    // Рекомендации по цене
    if (lowerMessage.includes('бюджет') || lowerMessage.includes('недорог') || lowerMessage.includes('дешев') || lowerMessage.includes('эконом')) {
      const cheapHotels = hardcodedHotels
        .filter(h => h.pricePerNight < 5000)
        .sort((a, b) => a.pricePerNight - b.pricePerNight)
        .slice(0, 3);
      
      let response = '💰 Бюджетные варианты отелей (до 5000₽/ночь):\n\n';
      cheapHotels.forEach((hotel, i) => {
        response += `${i + 1}. **${hotel.name}** (${hotel.starRating}⭐)\n`;
        response += `   💰 ${hotel.pricePerNight} ₽/ночь\n`;
        response += `   ⭐ Рейтинг: ${hotel.rating.toFixed(1)}\n`;
        response += `   📍 ${hotel.address}\n\n`;
      });
      return response;
    }

    // Дорогие отели
    if (lowerMessage.includes('дорог') || lowerMessage.includes('люкс') || lowerMessage.includes('премиум') || lowerMessage.includes('роскошн')) {
      const luxuryHotels = hardcodedHotels
        .filter(h => h.pricePerNight > 8000)
        .sort((a, b) => b.pricePerNight - a.pricePerNight)
        .slice(0, 3);
      
      let response = '💎 Премиум отели (от 8000₽/ночь):\n\n';
      luxuryHotels.forEach((hotel, i) => {
        response += `${i + 1}. **${hotel.name}** (${hotel.starRating}⭐)\n`;
        response += `   💰 ${hotel.pricePerNight} ₽/ночь\n`;
        response += `   ⭐ Рейтинг: ${hotel.rating.toFixed(1)}\n`;
        response += `   🎯 Удобства: ${hotel.amenities.slice(0, 3).join(', ')}\n\n`;
      });
      return response;
    }

    // Рекомендации по рейтингу
    if (lowerMessage.includes('лучш') || lowerMessage.includes('топ') || lowerMessage.includes('рейтинг') || lowerMessage.includes('популярн')) {
      const topHotels = hardcodedHotels
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
      
      let response = '🏆 Лучшие отели по рейтингу:\n\n';
      topHotels.forEach((hotel, i) => {
        response += `${i + 1}. **${hotel.name}** (${hotel.starRating}⭐)\n`;
        response += `   ⭐ Рейтинг: ${hotel.rating.toFixed(1)}\n`;
        response += `   💰 ${hotel.pricePerNight} ₽/ночь\n`;
        response += `   📍 ${hotel.address}\n\n`;
      });
      return response;
    }

    // Поиск по удобствам
    if (lowerMessage.includes('wi-fi') || lowerMessage.includes('парковк') || lowerMessage.includes('спа') || lowerMessage.includes('фитнес') || lowerMessage.includes('ресторан')) {
      const amenity = lowerMessage.includes('wi-fi') ? 'wi-fi' :
                     lowerMessage.includes('парковк') ? 'парковка' :
                     lowerMessage.includes('спа') ? 'спа' :
                     lowerMessage.includes('фитнес') ? 'фитнес' :
                     lowerMessage.includes('ресторан') ? 'ресторан' : '';
      
      if (amenity) {
        const hotelsWithAmenity = hardcodedHotels.filter(h => h.amenities.includes(amenity));
        
        let response = `🏨 Отели с ${amenity}:\n\n`;
        hotelsWithAmenity.slice(0, 3).forEach((hotel, i) => {
          response += `${i + 1}. **${hotel.name}**\n`;
          response += `   💰 ${hotel.pricePerNight} ₽/ночь\n`;
          response += `   ⭐ Рейтинг: ${hotel.rating.toFixed(1)}\n\n`;
        });
        return response;
      }
    }

    // Поиск по звездам
    if (lowerMessage.includes('5 звезд') || lowerMessage.includes('пять звезд')) {
      const fiveStarHotels = hardcodedHotels.filter(h => h.starRating === 5);
      let response = '⭐ Отели 5 звезд:\n\n';
      fiveStarHotels.forEach((hotel, i) => {
        response += `${i + 1}. **${hotel.name}**\n`;
        response += `   💰 ${hotel.pricePerNight} ₽/ночь\n`;
        response += `   ⭐ Рейтинг: ${hotel.rating.toFixed(1)}\n\n`;
      });
      return response;
    }

    if (lowerMessage.includes('4 звезд') || lowerMessage.includes('четыре звезд')) {
      const fourStarHotels = hardcodedHotels.filter(h => h.starRating === 4);
      let response = '⭐ Отели 4 звезды:\n\n';
      fourStarHotels.forEach((hotel, i) => {
        response += `${i + 1}. **${hotel.name}**\n`;
        response += `   💰 ${hotel.pricePerNight} ₽/ночь\n`;
        response += `   ⭐ Рейтинг: ${hotel.rating.toFixed(1)}\n\n`;
      });
      return response;
    }

    // Информация о Ростове-на-Дону
    if (lowerMessage.includes('ростов') || lowerMessage.includes('город') || lowerMessage.includes('достопримечательност')) {
      return `🏛️ Ростов-на-Дону - столица Юга России!\n\n📍 **Основные районы:**\n• Центр - деловой район с офисами\n• Нахичевань - исторический район\n• Левый берег - жилые кварталы\n\n🏨 **Рекомендации по размещению:**\n• Центр - удобно для бизнеса\n• Нахичевань - атмосферно и исторично\n• Близость к Дону - красивые виды\n\n💡 **Совет:** Большинство отелей находятся в центре города с хорошей транспортной доступностью.`;
    }

    // Конкретные отели
    const specificHotels = ['гранд', 'дон плаза', 'ростов', 'бизнес', 'уют', 'амакс', 'южная', 'парк инн', 'центральный', 'премиум'];
    for (const hotelName of specificHotels) {
      if (lowerMessage.includes(hotelName)) {
        const hotel = hardcodedHotels.find(h => h.name.toLowerCase().includes(hotelName));
        if (hotel) {
          return `🏨 **${hotel.name}**\n\n📍 **Адрес:** ${hotel.address}\n💰 **Цена:** ${hotel.pricePerNight} ₽/ночь\n⭐ **Рейтинг:** ${hotel.rating.toFixed(1)} (${hotel.starRating} звезд)\n\n✨ **Описание:** ${hotel.description}\n\n🎯 **Удобства:** ${hotel.amenities.join(', ')}\n\n📞 **Телефон:** ${hotel.phone}\n🌐 **Сайт:** ${hotel.website}`;
        }
      }
    }

    // Общие рекомендации
    return await this.getHotelRecommendations(this.currentSession?.location);
  }

  /**
   * Получение истории чата по sessionId (offline режим - возвращает пустой массив)
   */
  static async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      console.log('📜 История чата (offline режим):', sessionId);
      
      // В offline режиме история не сохраняется
      console.log('ℹ️ История чата недоступна в offline режиме');
        return [];
    } catch (error) {
      console.error('❌ Ошибка загрузки истории чата:', error);
      return [];
    }
  }

  /**
   * Получение рекомендаций отелей
   */
  static async getHotelRecommendations(location?: string): Promise<string> {
    try {
      console.log('🏨 Получение рекомендаций отелей:', location);

      // Используем хардкод данные отелей
      const { hardcodedHotels } = await import('../data/hotels');

      // Формируем текстовые рекомендации на основе хардкод данных
      const topHotels = hardcodedHotels
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);

      let recommendations = `🏨 **Топ-5 отелей в ${location || 'Ростове-на-Дону'}:**\n\n`;
      
      topHotels.forEach((hotel, index) => {
        const stars = '⭐'.repeat(hotel.starRating);
        recommendations += `**${index + 1}. ${hotel.name}** ${stars}\n`;
        recommendations += `📍 ${hotel.address}\n`;
        recommendations += `💰 ${hotel.pricePerNight} ${hotel.currency}/ночь\n`;
        recommendations += `⭐ Рейтинг: ${hotel.rating.toFixed(1)}\n`;
        recommendations += `✨ ${hotel.description}\n`;
        
        if (hotel.amenities.length > 0) {
          recommendations += `🎯 Удобства: ${hotel.amenities.slice(0, 4).join(', ')}\n`;
        }
        
        recommendations += `\n`;
      });

      // Добавляем категории
      const budgetHotel = hardcodedHotels.find(h => h.pricePerNight < 5000);
      const luxuryHotel = hardcodedHotels.find(h => h.pricePerNight > 8000);
      
      recommendations += `\n💡 **Рекомендации по категориям:**\n\n`;
      if (budgetHotel) {
        recommendations += `💰 **Бюджетный вариант:** ${budgetHotel.name} (${budgetHotel.pricePerNight}₽/ночь)\n`;
      }
      if (luxuryHotel) {
        recommendations += `💎 **Премиум вариант:** ${luxuryHotel.name} (${luxuryHotel.pricePerNight}₽/ночь)\n`;
      }
      recommendations += `🏆 **Лучший по рейтингу:** ${topHotels[0].name} (${topHotels[0].rating.toFixed(1)}⭐)\n\n`;
      
      recommendations += `🔍 **Нужна помощь с выбором?** Напишите:\n`;
      recommendations += `• "бюджетные отели" - для экономичных вариантов\n`;
      recommendations += `• "премиум отели" - для роскошного отдыха\n`;
      recommendations += `• "отели с парковкой" - по конкретным удобствам\n`;
      recommendations += `• название отеля - для подробной информации`;

      console.log('✅ Рекомендации сформированы из хардкод данных');
      return recommendations;
    } catch (error) {
      console.error('❌ Ошибка получения рекомендаций:', error);
      return 'Не удалось получить рекомендации отелей. Попробуйте еще раз.';
    }
  }

  /**
   * Получение текущей сессии
   */
  static getCurrentSession(): AISession | null {
    return this.currentSession;
  }

  /**
   * Получение истории сессий
   */
  static getSessionHistory(): AISession[] {
    return this.sessionHistory;
  }

  /**
   * Завершение текущей сессии
   */
  static endCurrentSession(): void {
    console.log('🔚 Завершение AI сессии');
    this.currentSession = null;
  }

  /**
   * Переключение на другую сессию
   */
  static async switchToSession(sessionId: string): Promise<AISession | null> {
    try {
      const session = this.sessionHistory.find(s => s.sessionId === sessionId);
      if (session) {
        this.currentSession = session;
        console.log('🔄 Переключение на сессию:', sessionId);
        return session;
      }
      return null;
    } catch (error) {
      console.error('❌ Ошибка переключения сессии:', error);
      return null;
    }
  }

  /**
   * Проверка активности сессии
   */
  static isSessionActive(): boolean {
    return this.currentSession !== null;
  }

  /**
   * Получение статистики сессии
   */
  static getSessionStats(): {
    totalSessions: number;
    currentSessionMessages: number;
    lastActivity?: Date;
  } {
    return {
      totalSessions: this.sessionHistory.length,
      currentSessionMessages: this.currentSession?.messageCount || 0,
      lastActivity: this.currentSession?.lastActivity
    };
  }

  /**
   * Очистка истории сессий
   */
  static clearSessionHistory(): void {
    console.log('🗑️ Очистка истории сессий');
    this.sessionHistory = [];
    this.currentSession = null;
  }

  /**
   * Создание приветственного сообщения
   */
  static createWelcomeMessage(session: AISession): ChatMessage {
    return {
      id: 'welcome',
      role: 'assistant',
      content: `Привет! Я ваш AI-помощник по туризму в ${session.location}. Могу помочь с рекомендациями по отелям, достопримечательностям и маршрутам. Что вас интересует?`,
      timestamp: new Date(),
      sessionId: session.sessionId
    };
  }

  /**
   * Создание сообщения об ошибке
   */
  static createErrorMessage(error: string): ChatMessage {
    return {
      id: 'error',
      role: 'assistant',
      content: `Извините, произошла ошибка: ${error}. Попробуйте еще раз или перезапустите сессию.`,
      timestamp: new Date()
    };
  }

  /**
   * Создание сообщения о загрузке
   */
  static createLoadingMessage(): ChatMessage {
    return {
      id: 'loading',
      role: 'assistant',
      content: 'Думаю... 🤔',
      timestamp: new Date()
    };
  }
}