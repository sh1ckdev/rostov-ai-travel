# 🚀 Развертывание Rostov AI Travel Backend

## 📋 Требования
- Docker и Docker Compose установлены
- Git для клонирования репозитория

## 🔧 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/sh1ckdev/rostov-ai-travel.git
cd rostov-ai-travel
```

### 2. Настройка переменных окружения
Создайте файл `.env` в корне проекта или используйте `env.production`:
```bash
cp env.production .env
```

Обязательно измените следующие переменные:
- `JWT_ACCESS_SECRET` - секрет для access токенов
- `JWT_REFRESH_SECRET` - секрет для refresh токенов
- `GOOGLE_MAPS_API_KEY` - API ключ Google Maps (необходим для работы карт)

### 3. Запуск
```bash
docker-compose up -d
```

Сервисы будут доступны:
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### 4. Проверка работы
```bash
curl http://localhost:5000/api/test
```

Ответ должен быть:
```json
{
  "message": "Backend is working!",
  "timestamp": "...",
  ...
}
```

## 📦 Структура сервисов

### Backend
- **Порт**: 5000
- **Технологии**: Node.js, Express, MongoDB
- **База данных**: MongoDB (автоматически создается в Docker)

### MongoDB
- **Порт**: 27017
- **База**: rostov-ai-travel
- **Персистентность**: Docker volume `mongo_data`

## 🔄 Обновление

Для обновления приложения:
```bash
git pull
docker-compose down
docker-compose up -d --build
```

## 🛑 Остановка

```bash
docker-compose down
```

Для удаления вместе с данными:
```bash
docker-compose down -v
```

## 📝 Логи

Просмотр логов:
```bash
# Все сервисы
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только MongoDB
docker-compose logs -f mongo
```

## 🔐 Безопасность

**ВАЖНО для продакшена:**
1. Измените все секреты в `.env`
2. Используйте сильные пароли
3. Настройте firewall для ограничения доступа
4. Рассмотрите использование HTTPS через reverse proxy (nginx)
5. Настройте `CORS_ORIGIN` на конкретные домены вместо `*`

## 🐛 Отладка

### Проблемы с MongoDB
```bash
docker-compose exec mongo mongosh
```

### Проблемы с Backend
```bash
docker-compose logs backend
docker-compose exec backend sh
```

### Перезапуск сервиса
```bash
docker-compose restart backend
```

## 📊 Мониторинг

Проверка статуса:
```bash
docker-compose ps
```

Использование ресурсов:
```bash
docker stats
```

## 🌐 API Endpoints

- `GET /api/test` - Проверка работы API
- `POST /api/registration` - Регистрация пользователя
- `POST /api/login` - Вход
- `GET /api/pois` - Получить точки интереса
- `GET /api/routes` - Получить маршруты
- `GET /api/hotels` - Получить отели
- `GET /api/map/*` - Работа с картами и геолокацией

Полная документация API: см. `back/API_DOCUMENTATION.md`

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs -f`
2. Убедитесь, что все переменные окружения настроены
3. Проверьте, что порты 5000 и 27017 свободны

## 🔄 Dokploy Deployment

Для деплоя на Dokploy:
1. Создайте новый проект в Dokploy
2. Подключите GitHub репозиторий
3. Выберите `docker-compose.yml` в корне проекта
4. Настройте переменные окружения в Dokploy
5. Запустите деплой

Dokploy автоматически:
- Соберет Docker образы
- Запустит сервисы
- Настроит сеть между контейнерами
- Создаст volumes для персистентности данных

