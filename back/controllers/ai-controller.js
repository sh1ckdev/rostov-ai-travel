const ApiError = require('../exceptions/api-error');
const axios = require('axios');

class AIController {
  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
    this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.model = 'microsoft/phi-3-mini-128k-instruct:free';
    
    // Привязываем методы к контексту
    this.getPersonalRecommendations = this.getPersonalRecommendations.bind(this);
    this.createAIRoute = this.createAIRoute.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getContextualSuggestions = this.getContextualSuggestions.bind(this);
    this.analyzeUserPreferences = this.analyzeUserPreferences.bind(this);
    this.getAIResponse = this.getAIResponse.bind(this);
    this.generateAIResponse = this.generateAIResponse.bind(this);
    this.generateSuggestionsFromResponse = this.generateSuggestionsFromResponse.bind(this);
  }
  // Получить персональные рекомендации
  async getPersonalRecommendations(req, res, next) {
    try {
      const { interests, budget, timeAvailable, location } = req.body;

      // Простая логика рекомендаций (можно заменить на реальный AI)
      const recommendations = this.generateRecommendations({
        interests,
        budget,
        timeAvailable,
        location
      });

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      next(error);
    }
  }

  // Создать маршрут с помощью AI
  async createAIRoute(req, res, next) {
    try {
      const {
        startLocation,
        endLocation,
        interests,
        duration,
        budget,
        transportMode,
        excludeCategories = []
      } = req.body;

      // Используем AI для создания маршрута
      const aiController = new AIController();
      const aiRoutes = await aiController.generateAIRoutesWithAI({
        startLocation,
        endLocation,
        interests,
        duration,
        budget,
        transportMode,
        excludeCategories
      });

      res.json({
        success: true,
        data: aiRoutes
      });
    } catch (error) {
      console.error('Ошибка создания AI маршрута:', error);
      // Fallback на локальную генерацию
      const aiController = new AIController();
      const fallbackRoutes = aiController.generateAIRoutes({
        startLocation: req.body.startLocation,
        endLocation: req.body.endLocation,
        interests: req.body.interests,
        duration: req.body.duration,
        budget: req.body.budget,
        transportMode: req.body.transportMode,
        excludeCategories: req.body.excludeCategories || []
      });
      
      res.json({
        success: true,
        data: fallbackRoutes
      });
    }
  }

  // Создание маршрутов с помощью AI
  async generateAIRoutesWithAI(params) {
    try {
      if (!this.openRouterApiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      const prompt = `Создай персональный туристический маршрут по Ростову-на-Дону со следующими параметрами:
- Начальная точка: ${params.startLocation.latitude}, ${params.startLocation.longitude}
- Конечная точка: ${params.endLocation ? `${params.endLocation.latitude}, ${params.endLocation.longitude}` : 'не указана'}
- Интересы: ${params.interests.join(', ')}
- Продолжительность: ${params.duration} часов
- Бюджет: ${params.budget} рублей
- Транспорт: ${params.transportMode}
- Исключить категории: ${params.excludeCategories.join(', ')}

Верни JSON с массивом маршрутов, каждый маршрут должен содержать:
- name: название маршрута
- description: описание
- duration: продолжительность в минутах
- distance: расстояние в км
- difficulty: сложность (easy/medium/hard)
- pois: массив точек интереса с координатами
- estimatedCost: примерная стоимость
- tags: теги маршрута

Предложи 2-3 варианта маршрутов разной направленности.`;

      const response = await axios.post(this.openRouterUrl, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'Ты - эксперт по туризму в Ростове-на-Дону. Создавай детальные и полезные маршруты. Отвечай только в формате JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://rostov-ai-travel.com',
          'X-Title': 'Rostov AI Travel'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      
      try {
        // Пытаемся распарсить JSON ответ от AI
        const routes = JSON.parse(aiResponse);
        return Array.isArray(routes) ? routes : [routes];
      } catch (parseError) {
        console.error('Ошибка парсинга JSON от AI:', parseError);
        // Fallback на локальную генерацию
        return this.generateAIRoutes(params);
      }
    } catch (error) {
      console.error('Ошибка запроса к OpenRouter для маршрутов:', error);
      throw error;
    }
  }

  // Отправить сообщение AI-помощнику
  async sendMessage(req, res, next) {
    try {
      const { message, context } = req.body;
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Сообщение не может быть пустым'
        });
      }

      // Определяем тип запроса для более точного ответа
      const mapKeywords = [
        'карта', 'карты', 'навигация', 'маршрут', 'дорога', 'путь',
        'координаты', 'адрес', 'местоположение', 'где находится',
        'как добраться', 'проехать', 'доехать'
      ];
      const travelKeywords = [
        'путешествие', 'туризм', 'отдых', 'отпуск', 'поездка',
        'достопримечательность', 'музей', 'театр', 'парк',
        'ресторан', 'кафе', 'отель', 'гостиница', 'размещение',
        'что посмотреть', 'куда пойти', 'где поесть', 'где остановиться'
      ];
      
      const isMapRelated = mapKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      const isTravelRelated = travelKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      let systemPrompt = 'Ты - универсальный AI-помощник. Отвечай дружелюбно и полезно на любые вопросы. ';
      
      if (isMapRelated || isTravelRelated) {
        systemPrompt += 'Особенно хорошо ты разбираешься в туризме, картах и путешествиях по Ростову-на-Дону. ';
        systemPrompt += 'Можешь давать рекомендации по достопримечательностям, ресторанам, отелям и маршрутам. ';
      }
      
      systemPrompt += 'Отвечай на русском языке, будь полезным и дружелюбным.';

      // Используем OpenRouter для получения ответа от AI
      const aiResponse = await this.getAIResponse(message, context, systemPrompt);

      res.json({
        success: true,
        data: aiResponse
      });
    } catch (error) {
      console.error('Ошибка получения ответа от AI:', error);
      // Fallback на локальную генерацию
      const fallbackResponse = this.generateAIResponse(req.body.message, req.body.context);
      res.json({
        success: true,
        data: fallbackResponse
      });
    }
  }

  // Проверяет, связан ли запрос с картами
  isMapRelatedQuery(message) {
    const mapKeywords = [
      'карта', 'карты', 'навигация', 'маршрут', 'дорога', 'путь',
      'координаты', 'адрес', 'местоположение', 'где находится',
      'как добраться', 'проехать', 'доехать'
    ];
    return mapKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Проверяет, связан ли запрос с путешествиями
  isTravelRelatedQuery(message) {
    const travelKeywords = [
      'путешествие', 'туризм', 'отдых', 'отпуск', 'поездка',
      'достопримечательность', 'музей', 'театр', 'парк',
      'ресторан', 'кафе', 'отель', 'гостиница', 'размещение',
      'что посмотреть', 'куда пойти', 'где поесть', 'где остановиться'
    ];
    return travelKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Получить ответ от AI через OpenRouter
  async getAIResponse(message, context, customSystemPrompt = null) {
    try {
      if (!this.openRouterApiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      const systemPrompt = customSystemPrompt || `Ты - AI-помощник по туризму в Ростове-на-Дону. 
Твоя задача - помогать туристам с планированием поездок, рекомендациями мест для посещения, 
ресторанов, отелей и созданием маршрутов. 

Отвечай на русском языке, будь дружелюбным и полезным. 
Предлагай конкретные места в Ростове-на-Дону с их описанием.
Если пользователь спрашивает о достопримечательностях, ресторанах или маршрутах, 
давай подробные и полезные ответы.

Контекст: ${JSON.stringify(context || {})}`;

      const response = await axios.post(this.openRouterUrl, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://rostov-ai-travel.com',
          'X-Title': 'Rostov AI Travel'
        }
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        const aiMessage = response.data.choices[0].message.content;

        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: aiMessage,
          timestamp: new Date(),
          suggestions: this.generateSuggestionsFromResponse(aiMessage)
        };
      } else {
        throw new Error('Неожиданный формат ответа от OpenRouter');
      }
    } catch (error) {
      console.error('Ошибка запроса к OpenRouter:', error.response?.data || error.message);
      
      // Если ошибка 401 (неверный ключ) или другие ошибки API, используем fallback
      if (error.response?.status === 401) {
        console.log('OpenRouter API ключ недействителен, используем fallback');
        return this.generateAIResponse.call(this, message, context);
      }
      
      throw error;
    }
  }

  // Генерация предложений на основе ответа AI
  generateSuggestionsFromResponse(aiResponse) {
    const suggestions = [];
    const lowerResponse = aiResponse.toLowerCase();

    if (lowerResponse.includes('достопримечательность') || lowerResponse.includes('музей') || lowerResponse.includes('театр')) {
      suggestions.push({
        id: '1',
        title: 'Показать достопримечательности',
        description: 'Найти интересные места рядом',
        category: 'ATTRACTION',
        confidence: 0.9,
        reasoning: 'AI упомянул достопримечательности',
        action: 'show_attractions'
      });
    }

    if (lowerResponse.includes('ресторан') || lowerResponse.includes('кафе') || lowerResponse.includes('еда')) {
      suggestions.push({
        id: '2',
        title: 'Найти рестораны',
        description: 'Показать места для еды',
        category: 'RESTAURANT',
        confidence: 0.9,
        reasoning: 'AI упомянул рестораны',
        action: 'show_restaurants'
      });
    }

    if (lowerResponse.includes('маршрут') || lowerResponse.includes('план') || lowerResponse.includes('прогулка')) {
      suggestions.push({
        id: '3',
        title: 'Создать маршрут',
        description: 'Построить персональный маршрут',
        category: 'ROUTE',
        confidence: 0.8,
        reasoning: 'AI упомянул маршруты',
        action: 'create_route'
      });
    }

    return suggestions;
  }

  // Получить контекстные предложения
  async getContextualSuggestions(req, res, next) {
    try {
      const { location, timeOfDay, weather } = req.body;

      const suggestions = this.generateContextualSuggestions({
        location,
        timeOfDay,
        weather
      });

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      next(error);
    }
  }

  // Анализ предпочтений пользователя
  async analyzeUserPreferences(req, res, next) {
    try {
      const { visitedPOIs, likedRoutes, searchQueries } = req.body;

      const analysis = this.analyzePreferences({
        visitedPOIs,
        likedRoutes,
        searchQueries
      });

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }

  // Генерация рекомендаций
  generateRecommendations({ interests, budget, timeAvailable, location }) {
    const recommendations = [];

    // Рекомендации на основе интересов
    if (interests.includes('культура') || interests.includes('история')) {
      recommendations.push({
        id: '1',
        title: 'Посетите Ростовский областной музей краеведения',
        description: 'Богатая коллекция экспонатов по истории Донского края',
        category: 'CULTURE',
        confidence: 0.9,
        reasoning: 'Соответствует вашим интересам в культуре и истории',
        action: 'view_details'
      });
    }

    if (interests.includes('природа') || interests.includes('отдых')) {
      recommendations.push({
        id: '2',
        title: 'Прогуляйтесь по парку им. Горького',
        description: 'Красивый парк в центре города с множеством развлечений',
        category: 'NATURE',
        confidence: 0.8,
        reasoning: 'Отличное место для отдыха на природе',
        action: 'view_details'
      });
    }

    if (interests.includes('еда') || interests.includes('рестораны')) {
      recommendations.push({
        id: '3',
        title: 'Попробуйте донскую кухню',
        description: 'Рекомендуем рестораны с традиционными блюдами региона',
        category: 'RESTAURANT',
        confidence: 0.7,
        reasoning: 'Уникальный вкус донской кухни',
        action: 'view_details'
      });
    }

    // Рекомендации на основе бюджета
    if (budget < 1000) {
      recommendations.push({
        id: '4',
        title: 'Бесплатные достопримечательности',
        description: 'Список мест, которые можно посетить бесплатно',
        category: 'ATTRACTION',
        confidence: 0.9,
        reasoning: 'Подходит для ограниченного бюджета',
        action: 'view_details'
      });
    }

    return recommendations;
  }

  // Генерация AI маршрутов
  generateAIRoutes({ startLocation, endLocation, interests, duration, budget, transportMode, excludeCategories }) {
    const routes = [];

    // Культурный маршрут
    if (interests.includes('культура')) {
      routes.push({
        id: '1',
        name: 'Культурный маршрут по центру',
        description: 'Посещение основных культурных достопримечательностей',
        duration: Math.min(duration * 60, 180),
        distance: 3.5,
        difficulty: 'easy',
        pois: [
          {
            id: '1',
            name: 'Театр им. Горького',
            latitude: 47.2357,
            longitude: 39.7125,
            category: 'CULTURE'
          },
          {
            id: '2',
            name: 'Ростовский областной музей краеведения',
            latitude: 47.2400,
            longitude: 39.7200,
            category: 'CULTURE'
          }
        ],
        estimatedCost: Math.min(budget, 2000),
        tags: ['культура', 'история', transportMode]
      });
    }

    // Гастрономический маршрут
    if (interests.includes('еда')) {
      routes.push({
        id: '2',
        name: 'Гастрономический тур',
        description: 'Знакомство с местной кухней и ресторанами',
        duration: Math.min(duration * 60, 240),
        distance: 5.0,
        difficulty: 'medium',
        pois: [
          {
            id: '3',
            name: 'Ресторан "Донской"',
            latitude: 47.2300,
            longitude: 39.7100,
            category: 'RESTAURANT'
          },
          {
            id: '4',
            name: 'Кафе "Старый Ростов"',
            latitude: 47.2450,
            longitude: 39.7300,
            category: 'RESTAURANT'
          }
        ],
        estimatedCost: Math.min(budget, 3500),
        tags: ['еда', 'рестораны', 'дегустация']
      });
    }

    // Природный маршрут
    if (interests.includes('природа')) {
      routes.push({
        id: '3',
        name: 'Прогулка по паркам',
        description: 'Посещение зеленых зон города',
        duration: Math.min(duration * 60, 120),
        distance: 4.0,
        difficulty: 'easy',
        pois: [
          {
            id: '5',
            name: 'Парк им. Горького',
            latitude: 47.2500,
            longitude: 39.7400,
            category: 'NATURE'
          },
          {
            id: '6',
            name: 'Набережная Дона',
            latitude: 47.2200,
            longitude: 39.7000,
            category: 'NATURE'
          }
        ],
        estimatedCost: 0,
        tags: ['природа', 'прогулка', 'отдых']
      });
    }

    return routes;
  }

  // Генерация ответа AI
  generateAIResponse(message, context) {
    const responses = {
      'привет': {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Привет! Я ваш AI-помощник по Ростову-на-Дону. Чем могу помочь?',
        timestamp: new Date(),
        suggestions: [
          {
            id: '1',
            title: 'Показать достопримечательности',
            description: 'Найти интересные места рядом',
            category: 'ATTRACTION',
            confidence: 0.9,
            reasoning: 'Популярный запрос',
            action: 'show_attractions'
          }
        ]
      },
      'что посмотреть': {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'В Ростове-на-Дону много интересных мест! Рекомендую посетить Театр им. Горького, Ростовский областной музей краеведения, прогуляться по набережной Дона или парку им. Горького.',
        timestamp: new Date(),
        suggestions: [
          {
            id: '1',
            title: 'Создать маршрут',
            description: 'Построить персональный маршрут',
            category: 'ROUTE',
            confidence: 0.8,
            reasoning: 'Поможет спланировать посещение',
            action: 'create_route'
          }
        ]
      },
      'где поесть': {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Для знакомства с донской кухней рекомендую ресторан "Донской", кафе "Старый Ростов" или попробовать местные блюда в "Казачьем курене".',
        timestamp: new Date(),
        suggestions: [
          {
            id: '1',
            title: 'Показать рестораны',
            description: 'Найти рестораны поблизости',
            category: 'RESTAURANT',
            confidence: 0.9,
            reasoning: 'Соответствует запросу',
            action: 'show_restaurants'
          }
        ]
      }
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Общий ответ
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Я помогу вам с планированием поездки по Ростову-на-Дону. Можете спросить о достопримечательностях, ресторанах, маршрутах или любых других местах.',
      timestamp: new Date(),
      suggestions: [
        {
          id: '1',
          title: 'Что посмотреть?',
          description: 'Показать достопримечательности',
          category: 'ATTRACTION',
          confidence: 0.8,
          reasoning: 'Популярный вопрос',
          action: 'show_attractions'
        },
        {
          id: '2',
          title: 'Где поесть?',
          description: 'Найти рестораны',
          category: 'RESTAURANT',
          confidence: 0.8,
          reasoning: 'Частый запрос',
          action: 'show_restaurants'
        },
        {
          id: '3',
          title: 'Создать маршрут',
          description: 'Построить персональный маршрут',
          category: 'ROUTE',
          confidence: 0.7,
          reasoning: 'Поможет спланировать день',
          action: 'create_route'
        }
      ]
    };
  }

  // Генерация контекстных предложений
  generateContextualSuggestions({ location, timeOfDay, weather }) {
    const suggestions = [];

    // Предложения на основе времени дня
    if (timeOfDay === 'morning') {
      suggestions.push({
        id: '1',
        title: 'Утренняя прогулка по набережной',
        description: 'Отличное время для прогулки с красивыми видами',
        category: 'NATURE',
        confidence: 0.9,
        reasoning: 'Утром меньше людей и красивые виды',
        action: 'view_details'
      });
    }

    if (timeOfDay === 'afternoon') {
      suggestions.push({
        id: '2',
        title: 'Посетите музей или театр',
        description: 'Дневное время идеально для культурных мероприятий',
        category: 'CULTURE',
        confidence: 0.8,
        reasoning: 'Днем работают большинство культурных заведений',
        action: 'view_details'
      });
    }

    if (timeOfDay === 'evening') {
      suggestions.push({
        id: '3',
        title: 'Ужин в ресторане с видом на Дон',
        description: 'Романтический ужин с красивым закатом',
        category: 'RESTAURANT',
        confidence: 0.9,
        reasoning: 'Вечер - идеальное время для ужина',
        action: 'view_details'
      });
    }

    // Предложения на основе погоды
    if (weather === 'sunny') {
      suggestions.push({
        id: '4',
        title: 'Прогулка по парку',
        description: 'Отличная погода для прогулок на свежем воздухе',
        category: 'NATURE',
        confidence: 0.9,
        reasoning: 'Солнечная погода идеальна для прогулок',
        action: 'view_details'
      });
    }

    if (weather === 'rainy') {
      suggestions.push({
        id: '5',
        title: 'Посетите музей или торговый центр',
        description: 'В дождливую погоду лучше быть в помещении',
        category: 'CULTURE',
        confidence: 0.8,
        reasoning: 'Дождь - повод посетить крытые заведения',
        action: 'view_details'
      });
    }

    return suggestions;
  }

  // Анализ предпочтений пользователя
  analyzePreferences({ visitedPOIs, likedRoutes, searchQueries }) {
    const interests = [];
    const preferredCategories = [];
    let budgetRange = { min: 0, max: 5000 };
    const timePreferences = [];

    // Анализ посещенных POI
    if (visitedPOIs && visitedPOIs.length > 0) {
      const categoryCounts = {};
      visitedPOIs.forEach(poi => {
        categoryCounts[poi.category] = (categoryCounts[poi.category] || 0) + 1;
      });

      // Определяем предпочтительные категории
      Object.entries(categoryCounts).forEach(([category, count]) => {
        if (count > visitedPOIs.length * 0.3) {
          preferredCategories.push(category);
        }
      });
    }

    // Анализ поисковых запросов
    if (searchQueries && searchQueries.length > 0) {
      searchQueries.forEach(query => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('музей') || lowerQuery.includes('театр')) {
          interests.push('культура');
        }
        if (lowerQuery.includes('ресторан') || lowerQuery.includes('кафе')) {
          interests.push('еда');
        }
        if (lowerQuery.includes('парк') || lowerQuery.includes('прогулка')) {
          interests.push('природа');
        }
      });
    }

    // Удаляем дубликаты
    const uniqueInterests = [...new Set(interests)];

    return {
      interests: uniqueInterests.length > 0 ? uniqueInterests : ['культура', 'история', 'развлечения'],
      preferredCategories: preferredCategories.length > 0 ? preferredCategories : ['CULTURE', 'ATTRACTION', 'ENTERTAINMENT'],
      budgetRange,
      timePreferences: ['утро', 'день']
    };
  }
}

module.exports = new AIController();
