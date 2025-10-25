import { POI, POICategory } from '../types/poi';
import { $api } from '@/constants/http';

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  reasoning: string;
  action?: string;
}

export interface RouteSuggestion {
  id: string;
  name: string;
  description: string;
  duration: number; // в минутах
  distance: number; // в км
  difficulty: 'easy' | 'medium' | 'hard';
  pois: POI[];
  estimatedCost: number;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: AIRecommendation[];
}

export class AIService {
  // Получить персональные рекомендации
  static async getPersonalRecommendations(
    userPreferences: {
      interests: string[];
      budget: number;
      timeAvailable: number;
      location: { latitude: number; longitude: number };
    }
  ): Promise<AIRecommendation[]> {
    try {
      const response = await $api.post('/ai/recommendations', userPreferences);
      return response.data.data || [];
    } catch (error) {
      console.error('Ошибка получения рекомендаций:', error);
      return this.getFallbackRecommendations();
    }
  }

  // Создать маршрут с помощью AI
  static async createAIRoute(params: {
    startLocation: { latitude: number; longitude: number };
    endLocation?: { latitude: number; longitude: number };
    interests: string[];
    duration: number; // в часах
    budget: number;
    transportMode: 'walking' | 'driving' | 'public';
    excludeCategories?: string[];
  }): Promise<RouteSuggestion[]> {
    try {
      const response = await $api.post('/ai/create-route', params);
      return response.data.data || [];
    } catch (error) {
      console.error('Ошибка создания AI маршрута:', error);
      return this.getFallbackRoutes();
    }
  }

  // Отправить сообщение AI-помощнику
  static async sendMessage(message: string, context?: any): Promise<ChatMessage> {
    try {
      const response = await $api.post('/ai/chat', {
        message,
        context
      });
      
      // Убеждаемся, что timestamp является объектом Date
      const data = response.data.data;
      if (data && data.timestamp) {
        data.timestamp = new Date(data.timestamp);
      }
      
      return data;
    } catch (error) {
      console.error('Ошибка отправки сообщения AI:', error);
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date()
      };
    }
  }

  // Получить контекстные предложения
  static async getContextualSuggestions(
    currentLocation: { latitude: number; longitude: number },
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
    weather?: string
  ): Promise<AIRecommendation[]> {
    try {
      const response = await $api.post('/ai/contextual-suggestions', {
        location: currentLocation,
        timeOfDay,
        weather
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Ошибка получения контекстных предложений:', error);
      return this.getFallbackRecommendations();
    }
  }

  // Анализ предпочтений пользователя
  static async analyzeUserPreferences(
    userHistory: {
      visitedPOIs: POI[];
      likedRoutes: string[];
      searchQueries: string[];
    }
  ): Promise<{
    interests: string[];
    preferredCategories: POICategory[];
    budgetRange: { min: number; max: number };
    timePreferences: string[];
  }> {
    try {
      const response = await $api.post('/ai/analyze-preferences', userHistory);
      return response.data.data;
    } catch (error) {
      console.error('Ошибка анализа предпочтений:', error);
      return {
        interests: ['культура', 'история', 'развлечения'],
        preferredCategories: ['CULTURE', 'ATTRACTION', 'ENTERTAINMENT'],
        budgetRange: { min: 0, max: 5000 },
        timePreferences: ['утро', 'день']
      };
    }
  }

  // Резервные рекомендации
  private static getFallbackRecommendations(): AIRecommendation[] {
    return [
      {
        id: '1',
        title: 'Посетите Театр им. Горького',
        description: 'Один из старейших театров Ростова с богатой историей',
        category: 'CULTURE',
        confidence: 0.9,
        reasoning: 'Популярное место для культурного отдыха',
        action: 'view_details'
      },
      {
        id: '2',
        title: 'Прогуляйтесь по набережной',
        description: 'Красивая набережная с видом на Дон',
        category: 'NATURE',
        confidence: 0.8,
        reasoning: 'Отличное место для прогулок в любое время года',
        action: 'view_details'
      },
      {
        id: '3',
        title: 'Попробуйте местную кухню',
        description: 'Рекомендуем рестораны с донской кухней',
        category: 'RESTAURANT',
        confidence: 0.7,
        reasoning: 'Уникальный вкус региона',
        action: 'view_details'
      }
    ];
  }

  // Резервные маршруты
  private static getFallbackRoutes(): RouteSuggestion[] {
    return [
      {
        id: '1',
        name: 'Культурный маршрут по центру',
        description: 'Посещение основных культурных достопримечательностей',
        duration: 180,
        distance: 3.5,
        difficulty: 'easy',
        pois: [],
        estimatedCost: 2000,
        tags: ['культура', 'история', 'пешком']
      },
      {
        id: '2',
        name: 'Гастрономический тур',
        description: 'Знакомство с местной кухней и ресторанами',
        duration: 240,
        distance: 5.0,
        difficulty: 'medium',
        pois: [],
        estimatedCost: 3500,
        tags: ['еда', 'рестораны', 'дегустация']
      }
    ];
  }
}
