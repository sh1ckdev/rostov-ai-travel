# 🔄 Миграция с Google Maps на Яндекс.Карты

## ✅ Что было изменено

### Backend (Полностью готов!)

#### 1. **back/services/map-service.js**
- ✅ Заменены все вызовы Google Maps API на Яндекс.Карты API
- ✅ Геокодер: `geocode-maps.yandex.ru`
- ✅ Маршрутизация: `api.routing.yandex.net`
- ✅ Поиск организаций: `search-maps.yandex.ru`
- ✅ Добавлены методы преобразования типов Yandex в наши категории
- ✅ Обновлены форматы ответов для совместимости

#### 2. **Переменные окружения**
- ❌ Удалена: `GOOGLE_MAPS_API_KEY`
- ✅ Добавлена: `YANDEX_MAPS_API_KEY`
- Обновлены файлы:
  - `env.production`
  - `docker-compose.yml`

#### 3. **Документация**
- ✅ `YANDEX_MAPS_SETUP.md` - Инструкция по получению API ключа
- ✅ `DEPLOY_INSTRUCTIONS.md` - Обновлены инструкции по деплою
- ✅ `MIGRATION_TO_YANDEX_MAPS.md` - Этот файл

### Frontend (Требуется обновление)

> **⚠️ Внимание**: Клиентская часть пока использует Google Maps компоненты.
> Для полной миграции необходимо обновить React Native компоненты.

#### Что нужно сделать:

1. **Установить react-native-yamap**
   ```bash
   cd client
   npm install react-native-yamap
   ```

2. **Обновить MapView компонент**
   - Заменить react-native-maps на react-native-yamap
   - Адаптировать props и callbacks

3. **Обновить DirectionsService**
   - Использовать Yandex API через бекенд (уже готово!)

4. **Обновить конфигурацию**
   - Android: добавить API ключ в AndroidManifest.xml
   - iOS: добавить API ключ в Info.plist

## 📋 Сравнение API

### Геокодирование

**Google Maps:**
```javascript
GET https://maps.googleapis.com/maps/api/geocode/json?address=...&key=KEY
```

**Яндекс.Карты:**
```javascript
GET https://geocode-maps.yandex.ru/1.x/?geocode=...&apikey=KEY&format=json
```

### Маршрутизация

**Google Maps:**
```javascript
GET https://maps.googleapis.com/maps/api/directions/json?origin=...&destination=...&key=KEY
```

**Яндекс.Карты:**
```javascript
GET https://api.routing.yandex.net/v2/route?waypoints=...&apikey=KEY
```

### Поиск мест

**Google Maps:**
```javascript
GET https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=...&radius=...&key=KEY
```

**Яндекс.Карты:**
```javascript
GET https://search-maps.yandex.ru/v1/?text=...&ll=...&spn=...&apikey=KEY
```

## 🎯 Основные отличия

| Параметр | Google Maps | Яндекс.Карты |
|----------|-------------|--------------|
| Формат координат | lat,lng | lng,lat |
| Параметр ключа | `key` | `apikey` |
| Режимы маршрута | driving, walking, bicycling, transit | auto, pedestrian, bicycle, masstransit |
| Язык по умолчанию | English | Русский |
| Бесплатный лимит | $200/месяц | 25,000 запросов/день |

## 🔧 Настройка

### 1. Получите API ключ Яндекс.Карт

См. подробную инструкцию в `YANDEX_MAPS_SETUP.md`

### 2. Настройте переменные окружения

**Локально (.env):**
```bash
YANDEX_MAPS_API_KEY=abcdef12-3456-7890-abcd-ef1234567890
```

**В Dokploy:**
Добавьте переменную окружения в настройках проекта.

### 3. Перезапустите backend

```bash
# Локально
docker-compose down
docker-compose up -d --build

# В Dokploy
Нажмите "Redeploy" в панели управления
```

## ✅ Проверка работы

### Тест геокодирования:
```bash
curl "http://localhost:5000/api/map/geocode?address=Ростов-на-Дону"
```

Ожидаемый ответ:
```json
{
  "success": true,
  "data": {
    "latitude": 47.222078,
    "longitude": 39.720358,
    "formattedAddress": "Россия, Ростов-на-Дону",
    "placeId": "..."
  }
}
```

### Тест маршрутизации:
```bash
curl "http://localhost:5000/api/map/directions?originLat=47.222078&originLng=39.720358&destLat=47.235100&destLng=39.712600&mode=driving"
```

## 🚨 Известные ограничения

1. **Yandex Router API v2** - требуется платная подписка для некоторых функций
   - Альтернатива: использовать Static API или JavaScript API

2. **Поиск организаций** - ограниченная информация по сравнению с Google Places
   - Нет рейтингов
   - Нет фотографий
   - Меньше деталей

3. **Координаты в другом порядке**
   - Нужна осторожность при преобразовании
   - Уже учтено в map-service.js

## 💡 Рекомендации

1. **Кешируйте результаты геокодирования**
   ```javascript
   // Сохраняйте координаты в базу при первом запросе
   // Используйте их повторно
   ```

2. **Используйте debounce для поиска**
   ```javascript
   // Не отправляйте запрос при каждом вводе символа
   ```

3. **Мониторьте использование**
   - Проверяйте статистику в личном кабинете Yandex
   - Настройте алерты при приближении к лимитам

4. **Fallback стратегия**
   ```javascript
   // Если Yandex API недоступен
   // Используйте данные из базы или кеш
   ```

## 📊 Преимущества перехода на Яндекс.Карты

✅ **Бесплатные лимиты** - достаточно для большинства проектов
✅ **Локальные данные** - лучше знает Россию и СНГ
✅ **Русский язык** - из коробки
✅ **Нет биллинга** - до превышения лимитов
✅ **Документация на русском** - проще разбираться

## 🔄 План дальнейших действий

- [x] Обновить backend API
- [x] Заменить переменные окружения
- [x] Обновить документацию
- [ ] Обновить React Native клиент (если требуется)
- [ ] Протестировать все endpoints
- [ ] Задеплоить на продакшен
- [ ] Мониторить использование API

## 🆘 Поддержка

**Проблемы с API:**
- [Документация Яндекс.Карт](https://yandex.ru/dev/maps/)
- [Личный кабинет](https://developer.tech.yandex.ru/)
- [Форум разработчиков](https://yandex.ru/dev/maps/forum/)

**Проблемы с бекендом:**
- Проверьте логи: `docker-compose logs backend`
- Убедитесь, что API ключ активен
- Проверьте лимиты в личном кабинете

