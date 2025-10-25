# API Документация - Ростов AI Travel

## Базовый URL
```
http://localhost:5000/api
```

## Аутентификация
Большинство endpoints требуют аутентификации через JWT токен в заголовке:
```
Authorization: Bearer <your-jwt-token>
```

## POI (Points of Interest) API

### Получить все POI
```http
GET /pois
```

**Параметры запроса:**
- `page` (int, optional): Номер страницы (по умолчанию: 1)
- `limit` (int, optional): Количество элементов на странице (по умолчанию: 20, максимум: 100)
- `category` (string, optional): Фильтр по категории
- `search` (string, optional): Поиск по названию и описанию
- `latitude` (float, optional): Широта для поиска рядом
- `longitude` (float, optional): Долгота для поиска рядом
- `radius` (int, optional): Радиус поиска в метрах (по умолчанию: 10000)
- `sortBy` (string, optional): Поле сортировки (name, rating, createdAt, distance)
- `sortOrder` (string, optional): Порядок сортировки (asc, desc)

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Ростовский академический театр драмы",
      "description": "Один из старейших театров России",
      "latitude": 47.2307,
      "longitude": 39.7203,
      "category": "culture",
      "rating": 4.5,
      "address": "ул. Театральная, 1",
      "phone": "+7 (863) 240-40-00",
      "website": "https://rostovteatr.ru",
      "openingHours": "Вт-Вс: 10:00-19:00",
      "priceLevel": 2,
      "tags": ["театр", "культура", "история"],
      "features": ["Wi-Fi", "Парковка"],
      "createdBy": {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "admin"
      },
      "createdAt": "2023-07-20T10:00:00.000Z",
      "updatedAt": "2023-07-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Получить POI по ID
```http
GET /pois/:id
```

### Создать новый POI
```http
POST /pois
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "name": "Название POI",
  "description": "Описание POI",
  "latitude": 47.2307,
  "longitude": 39.7203,
  "category": "culture",
  "rating": 4.5,
  "address": "Адрес",
  "phone": "+7 (863) 123-45-67",
  "website": "https://example.com",
  "openingHours": "Пн-Пт: 09:00-18:00",
  "priceLevel": 2,
  "tags": ["тег1", "тег2"],
  "features": ["Wi-Fi", "Парковка"]
}
```

### Обновить POI
```http
PUT /pois/:id
Authorization: Bearer <token>
```

### Удалить POI
```http
DELETE /pois/:id
Authorization: Bearer <token>
```

### Получить POI по категории
```http
GET /pois/category/:category
```

### Поиск POI
```http
GET /pois/search?q=поисковый запрос
```

### Получить POI рядом с точкой
```http
GET /pois/nearby?latitude=47.2307&longitude=39.7203&radius=5000
```

### Получить статистику POI
```http
GET /pois/stats
```

## Маршруты API

### Получить все маршруты
```http
GET /routes
```

**Параметры запроса:**
- `page` (int, optional): Номер страницы
- `limit` (int, optional): Количество элементов на странице
- `difficulty` (string, optional): Фильтр по сложности (easy, medium, hard)
- `search` (string, optional): Поиск по названию и описанию
- `sortBy` (string, optional): Поле сортировки
- `sortOrder` (string, optional): Порядок сортировки

### Получить маршрут по ID
```http
GET /routes/:id
```

### Создать новый маршрут
```http
POST /routes
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "name": "Название маршрута",
  "description": "Описание маршрута",
  "poiIds": ["60f7b3b3b3b3b3b3b3b3b3b3", "60f7b3b3b3b3b3b3b3b3b3b4"],
  "difficulty": "easy",
  "isPublic": true,
  "tags": ["история", "культура"],
  "routeData": {
    "overviewPolyline": "encoded_polyline_string",
    "steps": [...]
  }
}
```

### Обновить маршрут
```http
PUT /routes/:id
Authorization: Bearer <token>
```

### Удалить маршрут
```http
DELETE /routes/:id
Authorization: Bearer <token>
```

### Получить маршруты пользователя
```http
GET /routes/user/my
Authorization: Bearer <token>
```

### Поиск маршрутов
```http
GET /routes/search?q=поисковый запрос
```

### Получить популярные маршруты
```http
GET /routes/popular?limit=10
```

### Лайкнуть маршрут
```http
POST /routes/:id/like
```

### Отметить маршрут как пройденный
```http
POST /routes/:id/complete
```

### Получить статистику маршрутов
```http
GET /routes/stats
```

## Карты API

### Получить направления
```http
GET /map/directions?originLat=47.2307&originLng=39.7203&destLat=47.2400&destLng=39.7300&mode=driving
```

**Параметры запроса:**
- `originLat` (float, required): Широта точки отправления
- `originLng` (float, required): Долгота точки отправления
- `destLat` (float, required): Широта точки назначения
- `destLng` (float, required): Долгота точки назначения
- `mode` (string, optional): Режим передвижения (driving, walking, bicycling, transit)
- `waypoints` (array, optional): Промежуточные точки

### Геокодирование
```http
GET /map/geocode?address=Ростов-на-Дону, ул. Большая Садовая, 1
```

### Обратное геокодирование
```http
GET /map/reverse-geocode?latitude=47.2307&longitude=39.7203
```

### Поиск мест поблизости
```http
GET /map/nearby-places?latitude=47.2307&longitude=39.7203&radius=5000&type=restaurant
```

### Получить детали места
```http
GET /map/place/:placeId?fields=name,formatted_address,rating
```

### Получить рекомендуемые POI
```http
GET /map/recommended-pois?latitude=47.2307&longitude=39.7203&radius=5000&limit=20
```

### Синхронизировать POI с Google Places
```http
POST /map/sync-poi/:poiId
Authorization: Bearer <token>
```

### Получить статистику карты
```http
GET /map/stats
```

### Вычислить расстояние
```http
GET /map/distance?lat1=47.2307&lng1=39.7203&lat2=47.2400&lng2=39.7300
```

## Категории POI

- `attraction` - Достопримечательности
- `restaurant` - Рестораны
- `hotel` - Отели
- `shopping` - Магазины
- `entertainment` - Развлечения
- `transport` - Транспорт
- `health` - Здоровье
- `education` - Образование
- `religious` - Религия
- `nature` - Природа
- `culture` - Культура
- `sport` - Спорт
- `other` - Другое

## Сложность маршрутов

- `easy` - Легкий
- `medium` - Средний
- `hard` - Сложный

## Коды ошибок

- `400` - Ошибка валидации
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Получить все рестораны рядом с центром Ростова
```http
GET /pois?category=restaurant&latitude=47.2307&longitude=39.7203&radius=2000
```

### Создать маршрут по достопримечательностям
```http
POST /routes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Культурный Ростов",
  "description": "Маршрут по основным культурным достопримечательностям города",
  "poiIds": ["60f7b3b3b3b3b3b3b3b3b3b3", "60f7b3b3b3b3b3b3b3b3b3b4"],
  "difficulty": "easy",
  "isPublic": true,
  "tags": ["культура", "история", "архитектура"]
}
```

### Построить маршрут между двумя точками
```http
GET /map/directions?originLat=47.2307&originLng=39.7203&destLat=47.2400&destLng=39.7300&mode=walking
```
