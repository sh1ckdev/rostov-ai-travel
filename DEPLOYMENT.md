# 🚀 Деплой бэкенда с Docker

## Быстрый старт

### 1. Убедитесь, что Docker установлен
```bash
docker --version
docker-compose --version
```

### 2. Запустите деплой
**Для Windows:**
```bash
deploy.bat
```

**Для Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Или вручную:**
```bash
docker-compose up --build -d
```

## 📋 Что включено

- **Backend API** - Node.js сервер на порту 5000
- **MongoDB** - База данных на порту 27017
- **Mongo Express** - Веб-интерфейс для MongoDB на порту 8081

## 🌐 Доступные URL

После деплоя будут доступны:

- **API**: http://localhost:5000/api
- **MongoDB Admin**: http://localhost:8081
- **Тестовый эндпоинт**: http://localhost:5000/api/test

## 🔧 Управление

### Просмотр логов
```bash
docker-compose logs -f
```

### Остановка
```bash
docker-compose down
```

### Перезапуск
```bash
docker-compose restart
```

### Обновление
```bash
docker-compose down
docker-compose up --build -d
```

## 📱 Настройка клиента

После деплоя обновите URL в клиенте:

```typescript
// client/constants/http.ts
return 'http://localhost:5000/api'; // Для локального деплоя
// или
return 'https://your-domain.com/api'; // Для продакшена
```

## 🗄️ База данных

- **MongoDB** доступна на `localhost:27017`
- **Данные** сохраняются в Docker volume `mongo_data`
- **Admin UI** доступен на http://localhost:8081
  - Username: `admin`
  - Password: `password`

## 🔒 Безопасность

Для продакшена обязательно:

1. Измените пароли в `docker-compose.yml`
2. Настройте переменные окружения в `.env`
3. Используйте HTTPS
4. Настройте firewall

## 📊 Мониторинг

```bash
# Статус контейнеров
docker-compose ps

# Использование ресурсов
docker stats

# Логи конкретного сервиса
docker-compose logs backend
docker-compose logs mongo
```

## 🐛 Отладка

```bash
# Войти в контейнер
docker-compose exec backend sh

# Проверить подключение к базе
docker-compose exec backend node -e "console.log('DB connection test')"

# Перезапустить только backend
docker-compose restart backend
```
