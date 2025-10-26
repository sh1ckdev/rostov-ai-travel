import { POI, POICategory } from '../types/poi';
import { $api, initializeAPI } from '@/constants/http';
import { staticPOIs, getPOIsByCategory, getPOIsByLocation, searchPOIs } from '../data/staticPOI';
import { staticRoutes, getRoutesByDifficulty, getRoutesByDuration, getRoutesByBudget, searchRoutes } from '../data/staticRoutes';
import { staticHotels, getHotelsByPriceRange, getHotelsByRating, getHotelsByLocation, searchHotels } from '../data/staticHotels';

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
      // Используем статические данные для рекомендаций
      const recommendations: AIRecommendation[] = [];
      
      // Получаем POI по интересам
      userPreferences.interests.forEach(interest => {
        const categoryMap: { [key: string]: string } = {
          'культура': 'CULTURE',
          'история': 'CULTURE',
          'природа': 'NATURE',
          'еда': 'RESTAURANT',
          'шопинг': 'SHOPPING',
          'развлечения': 'ENTERTAINMENT',
          'спорт': 'ENTERTAINMENT',
          'искусство': 'CULTURE'
        };
        
        const category = categoryMap[interest.toLowerCase()];
        if (category) {
          const pois = getPOIsByCategory(category);
          pois.forEach(poi => {
            if (poi.priceLevel <= Math.floor(userPreferences.budget / 1000)) {
              recommendations.push({
                id: poi.id,
                title: poi.name,
                description: poi.description,
                category: poi.category,
                confidence: 0.8,
                reasoning: `Соответствует вашему интересу к ${interest}`,
                action: 'view_details'
              });
            }
          });
        }
      });
      
      // Получаем маршруты по бюджету и времени
      const routes = staticRoutes.filter(route => 
        route.estimatedCost <= userPreferences.budget &&
        route.duration <= userPreferences.timeAvailable * 60
      );
      
      routes.forEach(route => {
        recommendations.push({
          id: `route_${route.id}`,
          title: route.name,
          description: route.description,
          category: 'ROUTE',
          confidence: 0.9,
          reasoning: `Подходит по бюджету и времени`,
          action: 'view_route'
        });
      });
      
      return recommendations.slice(0, 10); // Возвращаем топ-10 рекомендаций
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
      // Используем статические данные для создания маршрутов
      const suggestions: RouteSuggestion[] = [];
      
      // Фильтруем маршруты по параметрам
      let filteredRoutes = staticRoutes.filter(route => {
        // Проверяем продолжительность
        if (route.duration > params.duration * 60) return false;
        
        // Проверяем бюджет
        if (route.estimatedCost > params.budget) return false;
        
        // Проверяем транспорт
        if (route.transportMode !== params.transportMode) return false;
        
        // Проверяем исключенные категории
        if (params.excludeCategories && params.excludeCategories.length > 0) {
          const routePOIs = route.pois.map(poiId => 
            staticPOIs.find(poi => poi.id === poiId)
          ).filter(Boolean);
          
          const hasExcludedCategory = routePOIs.some(poi => 
            params.excludeCategories!.includes(poi!.category)
          );
          if (hasExcludedCategory) return false;
        }
        
        return true;
      });
      
      // Сортируем по релевантности интересам
      filteredRoutes = filteredRoutes.sort((a, b) => {
        const aRelevance = this.calculateRouteRelevance(a, params.interests);
        const bRelevance = this.calculateRouteRelevance(b, params.interests);
        return bRelevance - aRelevance;
      });
      
      // Преобразуем в RouteSuggestion
      filteredRoutes.slice(0, 3).forEach(route => {
        const pois = route.pois.map(poiId => 
          staticPOIs.find(poi => poi.id === poiId)
        ).filter(Boolean) as POI[];
        
        suggestions.push({
          id: route.id,
          name: route.name,
          description: route.description,
          duration: route.duration,
          distance: route.distance,
          difficulty: route.difficulty,
          pois: pois,
          estimatedCost: route.estimatedCost,
          tags: route.tags
        });
      });
      
      return suggestions.length > 0 ? suggestions : this.getFallbackRoutes();
    } catch (error) {
      console.error('Ошибка создания AI маршрута:', error);
      return this.getFallbackRoutes();
    }
  }

  // Отправить сообщение AI-помощнику
  static async sendMessage(message: string, context?: any): Promise<ChatMessage> {
    try {
      // Используем статические ответы для демо
      const response = this.generateStaticResponse(message);
      
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      };
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
      const response = await $api.post('/ai/demo/contextual-suggestions', {
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
      const response = await $api.post('/ai/demo/analyze-preferences', userHistory);
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

  // Генерация статических ответов для демо
  private static generateStaticResponse(message: string): { content: string; suggestions?: AIRecommendation[] } {
    const lowerMessage = message.toLowerCase();
    
    // Ответы на популярные вопросы
    if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй')) {
      return {
        content: 'Привет! Я ваш AI-помощник по туризму в Ростове-на-Дону. Могу помочь с рекомендациями по достопримечательностям, маршрутам и отелям. Что вас интересует?',
        suggestions: [
          {
            id: '1',
            title: 'Достопримечательности',
            description: 'Показать интересные места',
            category: 'CULTURE',
            confidence: 0.9,
            reasoning: 'Популярный запрос',
            action: 'view_pois'
          },
          {
            id: '2',
            title: 'Маршруты',
            description: 'Создать маршрут',
            category: 'ROUTE',
            confidence: 0.9,
            reasoning: 'Популярный запрос',
            action: 'create_route'
          }
        ]
      };
    }
    
    if (lowerMessage.includes('достопримечательности') || lowerMessage.includes('что посмотреть')) {
      return {
        content: 'В Ростове-на-Дону много интересных мест! Рекомендую посетить:\n\n• Ростовский театр драмы им. Горького - один из старейших театров России\n• Набережную реки Дон - отличное место для прогулок\n• Ростовский зоопарк - один из крупнейших в стране\n• Парк им. Горького - центральный парк с аттракционами\n• Музей краеведения - богатая коллекция по истории Дона',
        suggestions: [
          {
            id: '1',
            title: 'Театр им. Горького',
            description: 'Посетить театр',
            category: 'CULTURE',
            confidence: 0.9,
            reasoning: 'Популярная достопримечательность',
            action: 'view_details'
          },
          {
            id: '2',
            title: 'Набережная Дона',
            description: 'Прогуляться по набережной',
            category: 'NATURE',
            confidence: 0.8,
            reasoning: 'Красивое место для прогулок',
            action: 'view_details'
          }
        ]
      };
    }
    
    if (lowerMessage.includes('отели') || lowerMessage.includes('где остановиться')) {
      return {
        content: 'В Ростове-на-Дону есть отели на любой бюджет:\n\n• Дон Плаза (5*) - роскошный отель в центре\n• Гостиница Ростов (3*) - классическая гостиница\n• Бизнес-отель Атлант (4*) - для деловых поездок\n• Хостел Донской (2*) - бюджетный вариант\n• Парк Инн (3*) - семейный отель\n• Апарт-отель На Дону (4*) - для длительного проживания',
        suggestions: [
          {
            id: '1',
            title: 'Дон Плаза',
            description: 'Роскошный отель',
            category: 'HOTEL',
            confidence: 0.9,
            reasoning: 'Лучший отель города',
            action: 'view_hotel'
          },
          {
            id: '2',
            title: 'Хостел Донской',
            description: 'Бюджетный вариант',
            category: 'HOTEL',
            confidence: 0.8,
            reasoning: 'Недорогое размещение',
            action: 'view_hotel'
          }
        ]
      };
    }
    
    if (lowerMessage.includes('еда') || lowerMessage.includes('ресторан') || lowerMessage.includes('кухня')) {
      return {
        content: 'В Ростове-на-Дону отличная кухня! Рекомендую:\n\n• Ресторан "Донская кухня" - традиционные блюда Дона\n• Множество кафе в торговых центрах\n• Уличная еда на набережной\n• Местные специалитеты: донская уха, караси в сметане, вареники',
        suggestions: [
          {
            id: '1',
            title: 'Донская кухня',
            description: 'Попробовать местную кухню',
            category: 'RESTAURANT',
            confidence: 0.9,
            reasoning: 'Аутентичная кухня',
            action: 'view_details'
          }
        ]
      };
    }
    
    // Общий ответ
    return {
      content: 'Спасибо за вопрос! Я могу помочь с:\n\n• Рекомендациями по достопримечательностям\n• Созданием маршрутов\n• Поиском отелей\n• Информацией о ресторанах\n• Общими вопросами о городе\n\nЗадайте более конкретный вопрос, и я дам подробный ответ!',
      suggestions: [
        {
          id: '1',
          title: 'Создать маршрут',
          description: 'Планировщик маршрутов',
          category: 'ROUTE',
          confidence: 0.8,
          reasoning: 'Полезная функция',
          action: 'create_route'
        },
        {
          id: '2',
          title: 'Найти отель',
          description: 'Поиск размещения',
          category: 'HOTEL',
          confidence: 0.8,
          reasoning: 'Полезная функция',
          action: 'search_hotels'
        }
      ]
    };
  }

  // Вспомогательный метод для расчета релевантности маршрута
  private static calculateRouteRelevance(route: any, interests: string[]): number {
    let relevance = 0;
    
    // Проверяем соответствие тегов интересам
    route.tags.forEach((tag: string) => {
      interests.forEach(interest => {
        if (tag.toLowerCase().includes(interest.toLowerCase()) || 
            interest.toLowerCase().includes(tag.toLowerCase())) {
          relevance += 1;
        }
      });
    });
    
    // Проверяем соответствие POI интересам
    const routePOIs = route.pois.map((poiId: string) => 
      staticPOIs.find(poi => poi.id === poiId)
    ).filter(Boolean);
    
    routePOIs.forEach((poi: any) => {
      interests.forEach(interest => {
        if (poi.tags.some((tag: string) => 
          tag.toLowerCase().includes(interest.toLowerCase()))) {
          relevance += 0.5;
        }
      });
    });
    
    return relevance;
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
