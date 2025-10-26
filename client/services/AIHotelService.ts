import { $api } from '../constants/http';
import {
  StartChatUserRequest,
  ChatMessageRequest,
  ChatResponse,
  HotelRecommendationParams,
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
      console.log('🤖 Инициализация AI сессии...', { location });
      
      const requestData: StartChatUserRequest = {
        location: location || 'Таганрог'
      };

      const response = await $api.post<ChatResponse>('/HotelService/chat/start', requestData);
      
      if (!response.data.sessionId) {
        throw new Error('Не получен sessionId от сервера');
      }

      const session: AISession = {
        sessionId: response.data.sessionId,
        location: location || 'Таганрог',
        createdAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0
      };

      this.currentSession = session;
      this.sessionHistory.unshift(session);

      console.log('✅ AI сессия инициализирована:', session.sessionId);
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
      console.log('📤 Отправка сообщения в AI:', { message, sessionId: this.currentSession.sessionId });

      const requestData: ChatMessageRequest = {
        sessionId: this.currentSession.sessionId,
        message: message
      };

      const response = await $api.post<ChatResponse>('/HotelService/chat/send', requestData);
      
      if (!response.data.sessionId) {
        throw new Error('Не получен ответ от сервера');
      }

      // Обновляем активность сессии
      this.currentSession.lastActivity = new Date();
      this.currentSession.messageCount++;

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.data.response || 'Извините, не удалось получить ответ',
        timestamp: new Date(),
        sessionId: this.currentSession.sessionId
      };

      console.log('✅ Получен ответ от AI:', aiMessage.content);
      return aiMessage;
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
      throw new Error('Не удалось отправить сообщение. Попробуйте еще раз.');
    }
  }

  /**
   * Получение истории чата по sessionId
   */
  static async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      console.log('📜 Загрузка истории чата:', sessionId);

      const response = await $api.get<ChatResponse>(`/HotelService/chat/history/${sessionId}`);
      
      if (!response.data.fullHistory) {
        return [];
      }

      const messages: ChatMessage[] = response.data.fullHistory.map((msg: MessageDto, index: number) => ({
        id: `${sessionId}_${index}`,
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content || '',
        timestamp: new Date(msg.timestamp),
        sessionId: sessionId
      }));

      console.log('✅ История чата загружена:', messages.length, 'сообщений');
      return messages;
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

      const params: HotelRecommendationParams = {
        location: location || 'Таганрог'
      };

      const response = await $api.get<ApiResponse>('/HotelService/recommendation', { params });
      
      const recommendations = response.data.response || 'Рекомендации недоступны';
      console.log('✅ Рекомендации получены:', recommendations);
      
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