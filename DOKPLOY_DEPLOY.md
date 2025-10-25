# 🚀 Быстрый деплой на Dokploy

## ✅ Что исправлено:

1. **docker-compose.yml**
   - ✅ Упрощена конфигурация
   - ✅ Убраны сети (Docker создаст автоматически)
   - ✅ Добавлены container_name
   - ✅ Изменен формат environment

2. **Dockerfile**
   - ✅ Минимизированы зависимости
   - ✅ Оптимизирована сборка
   - ✅ Убраны не критичные пакеты

## 🎯 Шаги для деплоя:

### 1. Закоммитить изменения
```bash
git add .
git commit -m "Fix docker-compose for Dokploy deployment"
git push origin main
```

### 2. В Dokploy создать проект

**Настройки:**
- **Name**: Rostov AI Travel
- **Type**: Docker Compose
- **Repository**: https://github.com/sh1ckdev/rostov-ai-travel.git
- **Branch**: main
- **Compose Path**: docker-compose.yml

### 3. Настроить переменные окружения

В разделе **Environment Variables** добавить:

```env
JWT_ACCESS_SECRET=your-strong-secret-key-for-access-tokens-2024
JWT_REFRESH_SECRET=your-strong-secret-key-for-refresh-tokens-2024
TWOGIS_API_KEY=2aaa4ed7-7580-4e80-a139-f60e4be538c7
OPENAI_API_KEY=
CORS_ORIGIN=*
```

### 4. Запустить деплой

1. Нажать **Deploy**
2. Дождаться сборки (3-5 минут)
3. Проверить логи

## 🧪 Проверка работы

После успешного деплоя:

```bash
# Проверка API
curl https://ваш-домен.com/api/test

# Или если на порту 5000
curl http://ваш-домен.com:5000/api/test
```

Ожидаемый ответ:
```json
{
  "message": "Backend is working!",
  "timestamp": "2025-10-25T...",
  "ip": "...",
  "userAgent": "curl/..."
}
```

## 📊 Структура

После деплоя:
```
┌─────────────────────┐
│   rostov-backend    │ ← Backend API (Node.js)
│   Port: 5000        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   rostov-mongo      │ ← MongoDB
│   Port: 27017       │
└─────────────────────┘
```

## 🐛 Возможные проблемы

### Проблема: "Failed to build"
**Решение:**
1. Проверьте логи сборки
2. Убедитесь, что все файлы закоммичены
3. Проверьте синтаксис docker-compose.yml

### Проблема: "Service exited"
**Решение:**
1. Проверьте логи контейнера backend
2. Убедитесь, что MongoDB запущена
3. Проверьте переменные окружения

### Проблема: "Cannot connect to MongoDB"
**Решение:**
1. Подождите 10-20 секунд (MongoDB инициализируется)
2. Проверьте, что оба контейнера запущены
3. Перезапустите сервис

### Проблема: "CORS error"
**Решение:**
- CORS_ORIGIN установлен на "*" (разрешены все источники)
- Проверьте, что переменная установлена в Dokploy

## 📝 Логи

### Просмотр логов в Dokploy:

1. Перейти в проект
2. Выбрать **Logs**
3. Выбрать сервис:
   - `backend` - логи API
   - `mongo` - логи БД

### Важные логи для отладки:

**Backend успешно запущен:**
```
Сервер запущен на порте 5000 на всех интерфейсах
Доступен по адресам:
- http://localhost:5000
- http://127.0.0.1:5000
```

**MongoDB подключена:**
```
Connected to MongoDB
```

## 🔄 Обновление

Для обновления приложения:

1. Push изменения в Git:
   ```bash
   git push origin main
   ```

2. В Dokploy нажать **Rebuild**

3. Дождаться завершения

## ✅ Checklist деплоя

- [ ] Git репозиторий обновлен
- [ ] Переменные окружения настроены
- [ ] Проект создан в Dokploy
- [ ] Деплой запущен
- [ ] Backend отвечает на `/api/test`
- [ ] MongoDB работает
- [ ] Логи не содержат ошибок

## 🎉 Готово!

После успешного деплоя можно:
- ✅ Тестировать API endpoints
- ✅ Подключать мобильное приложение
- ✅ Настроить домен (опционально)
- ✅ Добавить SSL сертификат (опционально)

---

**Вопросы?** Проверьте логи или см. `DEPLOYMENT.md`

