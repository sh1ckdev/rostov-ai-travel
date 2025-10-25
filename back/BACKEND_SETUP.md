# Настройка бэкенда - Ростов AI Travel

## Требования

- Node.js 16+
- MongoDB 4.4+
- Google Maps API ключ (опционально)

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` в корне проекта:
```env
# База данных
DB_URL=mongodb://localhost:27017/rostov-ai-travel

# JWT секрет
JWT_SECRET=your-super-secret-jwt-key

# Google Maps API (опционально)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Порт сервера
PORT=5000
```

3. Запустите сервер в режиме разработки:
```bash
npm run dev
```

Или в продакшене:
```bash
npm start
```

## Заполнение тестовыми данными

Для заполнения базы данных тестовыми POI выполните:

```bash
npm run seed
```

Это создаст 10 тестовых точек интереса в Ростове-на-Дону.

## API Endpoints

### POI (Points of Interest)
- `GET /api/pois` - Получить все POI
- `GET /api/pois/:id` - Получить POI по ID
- `POST /api/pois` - Создать новый POI (требует авторизации)
- `PUT /api/pois/:id` - Обновить POI (требует авторизации)
- `DELETE /api/pois/:id` - Удалить POI (требует авторизации)
- `GET /api/pois/category/:category` - Получить POI по категории
- `GET /api/pois/search` - Поиск POI
- `GET /api/pois/nearby` - Получить POI рядом с точкой
- `GET /api/pois/stats` - Статистика POI

### Маршруты
- `GET /api/routes` - Получить все маршруты
- `GET /api/routes/:id` - Получить маршрут по ID
- `POST /api/routes` - Создать новый маршрут (требует авторизации)
- `PUT /api/routes/:id` - Обновить маршрут (требует авторизации)
- `DELETE /api/routes/:id` - Удалить маршрут (требует авторизации)
- `GET /api/routes/user/my` - Маршруты пользователя (требует авторизации)
- `GET /api/routes/search` - Поиск маршрутов
- `GET /api/routes/popular` - Популярные маршруты
- `POST /api/routes/:id/like` - Лайкнуть маршрут
- `POST /api/routes/:id/complete` - Отметить как пройденный
- `GET /api/routes/stats` - Статистика маршрутов

### Карты
- `GET /api/map/directions` - Получить направления
- `GET /api/map/geocode` - Геокодирование
- `GET /api/map/reverse-geocode` - Обратное геокодирование
- `GET /api/map/nearby-places` - Поиск мест поблизости
- `GET /api/map/place/:placeId` - Детали места
- `GET /api/map/recommended-pois` - Рекомендуемые POI
- `POST /api/map/sync-poi/:poiId` - Синхронизация с Google Places (требует авторизации)
- `GET /api/map/stats` - Статистика карты
- `GET /api/map/distance` - Вычислить расстояние

## Структура базы данных

### Коллекция POI
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  category: String, // attraction, restaurant, hotel, etc.
  rating: Number, // 0-5
  imageUrl: String,
  address: String,
  phone: String,
  website: String,
  openingHours: String,
  priceLevel: Number, // 1-4
  isFavorite: Boolean,
  isActive: Boolean,
  createdBy: ObjectId, // ссылка на User
  tags: [String],
  features: [String],
  googlePlaceId: String, // для синхронизации с Google Places
  googleTypes: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Коллекция Routes
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  pois: [ObjectId], // ссылки на POI
  totalDistance: Number, // в метрах
  estimatedTime: Number, // в минутах
  difficulty: String, // easy, medium, hard
  isPublic: Boolean,
  isActive: Boolean,
  createdBy: ObjectId, // ссылка на User
  tags: [String],
  routeData: {
    overviewPolyline: String,
    steps: [Object]
  },
  statistics: {
    views: Number,
    likes: Number,
    completed: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Индексы

База данных автоматически создает следующие индексы:

### POI
- `location: '2dsphere'` - для геолокационных запросов
- `name: 'text', description: 'text', address: 'text'` - для текстового поиска
- `category: 1` - для фильтрации по категориям
- `rating: -1` - для сортировки по рейтингу
- `isActive: 1` - для фильтрации активных POI
- `createdBy: 1` - для поиска по создателю

### Routes
- `name: 'text', description: 'text'` - для текстового поиска
- `difficulty: 1` - для фильтрации по сложности
- `isPublic: 1, isActive: 1` - для публичных активных маршрутов
- `createdBy: 1` - для поиска по создателю
- `statistics.views: -1` - для сортировки по популярности
- `statistics.likes: -1` - для сортировки по лайкам

## Тестирование

Для тестирования API используйте:

1. **Postman** - импортируйте коллекцию из `postman/`
2. **curl** - примеры в `API_DOCUMENTATION.md`
3. **Thunder Client** (VS Code extension)

### Примеры запросов

Получить все POI:
```bash
curl http://localhost:5000/api/pois
```

Получить рестораны рядом с центром:
```bash
curl "http://localhost:5000/api/pois?category=restaurant&latitude=47.2307&longitude=39.7203&radius=2000"
```

Создать POI (требует авторизации):
```bash
curl -X POST http://localhost:5000/api/pois \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Тестовый POI",
    "description": "Описание тестового POI",
    "latitude": 47.2307,
    "longitude": 39.7203,
    "category": "attraction"
  }'
```

## Мониторинг и логирование

Сервер выводит подробные логи всех запросов:
- Время запроса
- HTTP метод и URL
- Origin и User-Agent
- Тело запроса (если есть)
- Ошибки и исключения

## Безопасность

- JWT токены для аутентификации
- Валидация всех входящих данных
- CORS настроен для всех источников (в продакшене ограничить)
- Обработка ошибок без раскрытия внутренней информации

## Производительность

- Индексы для быстрого поиска
- Пагинация для больших наборов данных
- Геолокационные индексы для пространственных запросов
- Кэширование (можно добавить Redis)

## Масштабирование

Для увеличения производительности:
1. Добавить Redis для кэширования
2. Использовать кластер MongoDB
3. Добавить балансировщик нагрузки
4. Реализовать CDN для статических файлов
