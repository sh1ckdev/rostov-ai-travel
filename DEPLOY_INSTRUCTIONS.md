# 📝 Инструкция по деплою на Dokploy

## ✅ Что было сделано:

### 1. Упрощен docker-compose.yml
- ❌ Удален клиентский сервис (rostov-ai-travel-client)
- ❌ Удален nginx
- ❌ Удален redis и redis-commander
- ❌ Удален mongo-express
- ✅ Оставлены только: **backend** и **mongo**

### 2. Оптимизирован Dockerfile
- ✅ Добавлен curl для healthcheck
- ✅ Добавлена директория для логов
- ✅ Оптимизировано кеширование npm пакетов
- ✅ Добавлен healthcheck

### 3. Создан .dockerignore
- Исключены node_modules, логи, тесты для быстрой сборки

### 4. Обновлен env.production
- Убраны ненужные переменные (Redis, Mongo Express)
- Добавлены комментарии

## 🚀 Что нужно сделать для деплоя:

### 1. Закоммитить изменения
```bash
git add .
git commit -m "Fix docker-compose for backend-only deployment"
git push
```

### 2. В Dokploy настроить переменные окружения:
```
JWT_ACCESS_SECRET=ваш-секретный-ключ-access
JWT_REFRESH_SECRET=ваш-секретный-ключ-refresh
TWOGIS_API_KEY=ваш-2gis-api-ключ
OPENAI_API_KEY=ваш-openai-ключ (опционально)
NODE_ENV=production
PORT=5000
CORS_ORIGIN=*
```

> **🗺️ Важно**: Для получения `TWOGIS_API_KEY` см. инструкцию в файле `TWOGIS_SETUP.md`

### 3. В Dokploy:
- **Тип проекта**: Docker Compose
- **Путь к docker-compose.yml**: `./docker-compose.yml` (в корне)
- **Build context**: `./` (корень репозитория)

### 4. Запустить деплой в Dokploy

## 📊 Результат:

После успешного деплоя будут доступны:
- **Backend API**: http://ваш-домен:5000
- **MongoDB**: внутри Docker сети (недоступен извне)

### Проверка работы:
```bash
curl http://ваш-домен:5000/api/test
```

Должен вернуть:
```json
{
  "message": "Backend is working!",
  "timestamp": "...",
  "ip": "...",
  "userAgent": "..."
}
```

## 🔧 Структура сервисов:

```
┌─────────────────┐
│   backend       │  Port 5000
│  (Node.js API)  │
└────────┬────────┘
         │
         │ connects to
         ▼
┌─────────────────┐
│     mongo       │  Port 27017
│   (Database)    │
└─────────────────┘
```

## 🐛 Если что-то пошло не так:

### Ошибка: "service not found"
- ✅ Исправлено! Теперь сервис называется просто `backend`, а не `rostov-ai-travel-client`

### Ошибка при сборке
- Проверьте логи в Dokploy
- Убедитесь, что все файлы закоммичены в Git

### База данных не подключается
- MongoDB автоматически создается Docker Compose
- Проверьте переменную `DB_URL=mongodb://mongo:27017/rostov-ai-travel`

### CORS ошибки
- Установлено `CORS_ORIGIN=*` (разрешает все источники)
- Позже можно ограничить конкретными доменами

## 📱 Подключение клиента

После деплоя бекенда, в клиентском приложении измените:

**client/constants/http.ts:**
```typescript
const getBaseURL = () => {
  if (__DEV__) {
    return 'http://ваш-домен:5000/api';
  }
  return 'http://ваш-домен:5000/api';
};
```

## 🗺️ Интеграция 2GIS

Проект использует **2GIS API** для работы с картами и геолокацией:

### Backend (✅ готово):
- Геокодирование адресов
- Поиск мест рядом
- Построение маршрутов
- Получение информации о компаниях

### Frontend (требуется настройка):
1. Установить библиотеку 2GIS:
   ```bash
   npm install @2gis/mapgl-native
   ```

2. Добавить API ключ в клиент

3. Использовать MapGL компонент для отображения карт

Подробнее см. `TWOGIS_SETUP.md`

## 🎯 Следующие шаги:

1. ✅ Задеплоить бекенд
2. 🔄 Настроить домен (опционально)
3. 🔒 Настроить SSL/HTTPS (опционально, через Dokploy)
4. 📱 Обновить API_URL в клиентском приложении
5. 🧪 Протестировать все endpoints

## 💡 Полезные команды:

Посмотреть логи в Dokploy:
- Перейдите в проект → Logs
- Выберите сервис `backend`

Перезапустить сервис:
- Перейдите в проект → Services → backend
- Нажмите "Restart"

Обновить код:
- Сделайте push в GitHub
- Dokploy автоматически пересоберет проект (если включен auto-deploy)

