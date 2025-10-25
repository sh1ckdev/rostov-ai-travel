# ⚡ Быстрый старт - Миграция на Яндекс.Карты

## 🎯 Что уже сделано

✅ **Backend полностью готов!**
- Все API переведены на Яндекс.Карты
- Геокодирование ✅
- Маршрутизация ✅  
- Поиск организаций ✅
- Синхронизация POI ✅

✅ **Docker конфигурация обновлена**
- docker-compose.yml упрощен (только backend + mongo)
- Dockerfile оптимизирован
- Переменные окружения обновлены

✅ **Документация создана**
- YANDEX_MAPS_SETUP.md - как получить API ключ
- MIGRATION_TO_YANDEX_MAPS.md - подробности миграции
- DEPLOY_INSTRUCTIONS.md - инструкции по деплою

## 🚀 Что нужно сделать ПРЯМО СЕЙЧАС

### Шаг 1: Получить API ключ Яндекс.Карт (5 минут)

1. Перейдите на https://developer.tech.yandex.ru/
2. Войдите или зарегистрируйтесь
3. Создайте проект "Rostov AI Travel"
4. Активируйте API:
   - JavaScript API
   - HTTP Геокодер
   - Маршрутизация
   - Поиск по организациям
5. Скопируйте полученный API ключ

> 📖 Подробная инструкция: `YANDEX_MAPS_SETUP.md`

### Шаг 2: Закоммитить изменения

```bash
git add .
git commit -m "Migrate from Google Maps to Yandex Maps"
git push
```

### Шаг 3: Настроить Dokploy

В настройках проекта в Dokploy добавьте/измените переменные:

```bash
JWT_ACCESS_SECRET=ваш-секретный-ключ
JWT_REFRESH_SECRET=ваш-секретный-ключ
YANDEX_MAPS_API_KEY=ваш-yandex-api-ключ-сюда
OPENAI_API_KEY=
NODE_ENV=production
PORT=5000
CORS_ORIGIN=*
```

### Шаг 4: Задеплоить

1. В Dokploy нажмите **"Deploy"** или **"Redeploy"**
2. Дождитесь завершения сборки (2-3 минуты)
3. Проверьте логи

### Шаг 5: Проверить работу

```bash
# Замените YOUR_DOMAIN на ваш домен
curl "http://YOUR_DOMAIN:5000/api/test"
curl "http://YOUR_DOMAIN:5000/api/map/geocode?address=Ростов-на-Дону"
```

## ✅ Готово!

Backend работает с Яндекс.Картами! 🎉

## 📱 Клиент (опционально, на будущее)

Клиентское приложение будет работать с backend через API.
Если хотите обновить карты на клиенте - см. `MIGRATION_TO_YANDEX_MAPS.md`

## 🐛 Если что-то не работает

### Ошибка: "Invalid API key"
✅ Проверьте, что ключ правильно добавлен в Dokploy
✅ Убедитесь, что нужные API активированы в личном кабинете Yandex

### Ошибка при сборке Docker
✅ Проверьте логи в Dokploy
✅ Убедитесь, что все файлы закоммичены
✅ Проверьте, что docker-compose.yml в корне проекта

### База данных не подключается
✅ MongoDB поднимается автоматически в docker-compose
✅ Проверьте логи: выберите сервис "mongo" в Dokploy

### CORS ошибки
✅ Уже настроено `CORS_ORIGIN=*`
✅ Если нужно ограничить - укажите конкретные домены

## 📚 Полезные ссылки

- 📘 [Документация Yandex Maps](https://yandex.ru/dev/maps/)
- 🔑 [Личный кабинет](https://developer.tech.yandex.ru/)
- 📦 [API Documentation](./back/API_DOCUMENTATION.md)
- 🚀 [Инструкции по деплою](./DEPLOY_INSTRUCTIONS.md)
- 🗺️ [Настройка Yandex Maps](./YANDEX_MAPS_SETUP.md)

## 💬 Примеры использования API

### Геокодирование
```bash
GET /api/map/geocode?address=Ростов-на-Дону
```

### Обратное геокодирование  
```bash
GET /api/map/reverse-geocode?latitude=47.222078&longitude=39.720358
```

### Построение маршрута
```bash
GET /api/map/directions?originLat=47.222&originLng=39.720&destLat=47.235&destLng=39.712&mode=driving
```

### Поиск мест рядом
```bash
GET /api/map/nearby-places?latitude=47.222078&longitude=39.720358&radius=5000&type=ресторан
```

### Получить все POI
```bash
GET /api/pois
```

### Получить отели
```bash
GET /api/hotels?city=Ростов-на-Дону
```

## 🎉 Готово к работе!

Теперь ваш backend использует Яндекс.Карты и готов к продакшену!

**Следующие шаги:**
1. ✅ Задеплоить backend
2. 📱 Обновить API_URL в клиентском приложении
3. 🧪 Протестировать все функции
4. 📊 Настроить мониторинг использования API
5. 🎨 (Опционально) Обновить карты в клиенте на Yandex

