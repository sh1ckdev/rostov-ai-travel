# Настройка Dokploy для Rostov AI Travel

## 📋 Переменные окружения для Dokploy

В настройках Dokploy Dashboard добавьте следующие переменные окружения:

### Основные настройки
```
NODE_ENV=production
PORT=5000
DB_URL=mongodb://mongo:27017/rostov-ai-travel
```

### JWT секреты (ОБЯЗАТЕЛЬНО СМЕНИТЬ В ПРОДАКШЕНЕ!)
```
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-2024-CHANGE-ME-rostov-ai-travel
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-2024-CHANGE-ME-rostov-ai-travel
```

### API ключи
```
TWOGIS_API_KEY=2aaa4ed7-7580-4e80-a139-f60e4be538c7
OPENAI_API_KEY=
OPENROUTER_API_KEY=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
ROSREESTR_API_KEY=
BOOKING_API_KEY=
TRIPADVISOR_API_KEY=
```

### Настройки CORS и логирования
```
CORS_ORIGIN=*
USE_EXPO_LOCATION=true
USE_EXPO_MAPS=true
LOG_LEVEL=info
```

## 🔧 Пошаговая настройка

### 1. Войдите в Dokploy Dashboard
- Откройте ваш проект `rostovaitravel-client-tmx6vi`
- Перейдите в раздел "Settings" или "Environment Variables"

### 2. Добавьте переменные окружения
Скопируйте и вставьте все переменные из списка выше в соответствующие поля:
- **Key**: `NODE_ENV`
- **Value**: `production`
- Нажмите "Add" для каждой переменной

### 3. Сохраните настройки
- Нажмите "Save" или "Apply"
- Дождитесь применения изменений

### 4. Перезапустите проект
- Нажмите "Redeploy" или "Restart"
- Дождитесь завершения развертывания

## ✅ Проверка работы

### 1. Проверка API
```bash
curl http://localhost:5000/api/test
```

Ожидаемый ответ:
```json
{
  "message": "Rostov AI Travel API работает!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Проверка переменных окружения
```bash
docker exec -it rostov-client env | grep -E "(JWT|API|DB)"
```

### 3. Проверка логов
```bash
docker logs rostov-client -f
```

## 🚨 Важные замечания

### Безопасность
- **ОБЯЗАТЕЛЬНО** смените JWT секреты в продакшене
- Используйте сильные случайные строки для JWT_ACCESS_SECRET и JWT_REFRESH_SECRET
- Ограничьте CORS_ORIGIN для продакшена

### Генерация JWT секретов
```bash
# Генерация случайных секретов
openssl rand -base64 64
```

### Мониторинг
- Следите за логами на предмет ошибок
- Проверяйте доступность API
- Мониторьте использование ресурсов

## 🔄 Обновление

### Автоматическое обновление
Dokploy автоматически обновит проект при push в репозиторий

### Ручное обновление
1. В Dokploy Dashboard нажмите "Redeploy"
2. Или выполните в терминале:
```bash
cd /etc/dokploy/compose/rostovaitravel-client-tmx6vi/code
git pull
docker-compose down
docker-compose up -d --build
```

## 🐛 Устранение проблем

### Проблема: 2GIS API недоступен
**Решение**: Приложение автоматически использует fallback данные для Ростова-на-Дону

### Проблема: JWT ошибки
**Решение**: Проверьте правильность JWT_ACCESS_SECRET и JWT_REFRESH_SECRET

### Проблема: База данных недоступна
**Решение**: Проверьте подключение к MongoDB:
```bash
docker exec -it rostov-mongo mongosh --eval "db.adminCommand('ping')"
```

### Проблема: CORS ошибки
**Решение**: Проверьте настройку CORS_ORIGIN в переменных окружения
