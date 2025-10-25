# 🗺️ Настройка 2GIS API для Rostov AI Travel

## 📋 Что такое 2GIS?

2GIS - это российский картографический сервис с подробными картами городов России и других стран. Преимущества:
- ✅ Подробная информация о POI в России
- ✅ Актуальные данные о компаниях и адресах
- ✅ Бесплатные лимиты для разработки
- ✅ Русскоязычная поддержка

## 🔑 Получение API ключа

### Шаг 1: Регистрация

1. Перейдите на [API Console 2GIS](https://dev.2gis.com)
2. Зарегистрируйтесь или войдите
3. Создайте новый проект: **"Rostov AI Travel"**

### Шаг 2: Получение ключа

1. В проекте выберите "Создать ключ"
2. Выберите необходимые API:
   - ✅ **MapGL JS API** - JavaScript библиотека для карт
   - ✅ **Tiles API** - Векторная карта (500,000 запросов/месяц)
   - ✅ **Catalog API** - Поиск мест и компаний
   - ✅ **Directions API** - Построение маршрутов
3. Скопируйте полученный API ключ

### Шаг 3: Настройка проекта

Добавьте ключ в `.env`:
```bash
TWOGIS_API_KEY=ваш-ключ-2gis
```

## 📊 Лимиты API

Ваш текущий тариф:
- **MapGL JS API**: Без ограничений для разработки
- **Tiles API**: 500,000 запросов/месяц
- **Raster JS API**: 30,000 запросов/месяц
- **Catalog API**: 300,000 запросов/месяц
- **Directions API**: 100,000 запросов/месяц

## 🔧 Используемые API

### 1. Catalog API (Каталог мест)
**Base URL**: `https://catalog.api.2gis.com/3.0`

**Endpoints:**
- `/items` - Поиск мест
- `/items/geocode` - Геокодирование (адрес → координаты)
- `/items/byid` - Детали места по ID

**Примеры запросов:**
```bash
# Поиск ресторанов в Ростове
https://catalog.api.2gis.com/3.0/items?q=ресторан&region_id=93&key=YOUR_KEY

# Геокодирование
https://catalog.api.2gis.com/3.0/items/geocode?q=Ростов-на-Дону,+Большая+Садовая+115&key=YOUR_KEY

# Детали места
https://catalog.api.2gis.com/3.0/items/byid?id=PLACE_ID&key=YOUR_KEY
```

### 2. Directions API (Маршруты)
**Base URL**: `https://routing.api.2gis.com`

**Endpoints:**
- `/get_dist_matrix` - Построение маршрута

**Пример:**
```bash
https://routing.api.2gis.com/get_dist_matrix?point=39.7125,47.2357&point=39.7203,47.2307&type=car&key=YOUR_KEY
```

### 3. MapGL JS API (Карта)
**CDN**: `https://mapgl.2gis.com/api/js/v1`

```html
<script src="https://mapgl.2gis.com/api/js/v1"></script>
<script>
  const map = new mapgl.Map('map', {
    center: [39.7125, 47.2357], // Ростов-на-Дону
    zoom: 13,
    key: 'YOUR_API_KEY'
  });
</script>
```

## 🎯 Интеграция в проект

### Backend (уже реализовано)

Backend использует следующие сервисы 2GIS:

1. **Геокодирование** (`map-service.js`)
   ```javascript
   await mapService.geocode('Ростов-на-Дону, Большая Садовая 115')
   ```

2. **Поиск мест рядом**
   ```javascript
   await mapService.findNearbyPlaces(47.2357, 39.7125, 5000)
   ```

3. **Построение маршрутов**
   ```javascript
   await mapService.getDirections(origin, destination, waypoints, 'car')
   ```

### Frontend (React Native)

Для React Native используйте:
- **React Native MapGL** - библиотека для карт 2GIS
- Установка: `npm install @2gis/mapgl-native`

```typescript
import { MapView } from '@2gis/mapgl-native';

<MapView
  apiKey="YOUR_API_KEY"
  initialRegion={{
    latitude: 47.2357,
    longitude: 39.7125,
    zoom: 13
  }}
/>
```

## 📱 Особенности 2GIS API

### Форматы координат
2GIS использует формат **[longitude, latitude]** (долгота, широта), в отличие от многих других API.

```javascript
// 2GIS формат
point: "39.7125,47.2357" // lng,lat

// Наш формат (широко используемый)
{ latitude: 47.2357, longitude: 39.7125 }
```

### Типы мест (rubrics)
2GIS использует свою систему категорий (рубрик):
- Достопримечательности
- Рестораны, Кафе
- Отели, Гостиницы
- Торговые центры, Магазины
- Парки, Скверы
- и т.д.

## 🔐 Безопасность

**ВАЖНО:**
1. ❌ Никогда не коммитьте API ключи в Git
2. ✅ Используйте переменные окружения
3. ✅ Для продакшена настройте ограничения доменов в 2GIS Console
4. ✅ Следите за лимитами запросов

## 📚 Полезные ссылки

- [Документация 2GIS API](https://docs.2gis.com/)
- [API Console](https://dev.2gis.com/)
- [MapGL JS API Docs](https://docs.2gis.com/en/mapgl/overview)
- [Catalog API Docs](https://docs.2gis.com/en/api/search/places/overview)
- [Directions API Docs](https://docs.2gis.com/en/api/navigation/directions/overview)

## 🆘 Решение проблем

### Ошибка: "Invalid API key"
- Проверьте правильность ключа в `.env`
- Убедитесь, что проект активен в 2GIS Console
- Проверьте лимиты запросов

### Ошибка: "Quota exceeded"
- Вы превысили лимит запросов
- Подождите до следующего месяца или обновите тариф

### Карта не загружается
- Проверьте подключение к интернету
- Убедитесь, что API ключ активен
- Проверьте консоль браузера на ошибки

## 💡 Советы по оптимизации

1. **Кеширование** - сохраняйте результаты поиска в базе данных
2. **Батчинг** - объединяйте несколько запросов в один
3. **Дебаунсинг** - не делайте запрос при каждом вводе символа
4. **Локальные данные** - используйте POI из своей БД когда возможно

## 🚀 Готово!

Теперь ваше приложение использует 2GIS для:
- ✅ Отображения карт
- ✅ Поиска мест
- ✅ Геокодирования адресов
- ✅ Построения маршрутов
- ✅ Получения информации о компаниях

