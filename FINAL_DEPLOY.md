# 🚀 ФИНАЛЬНАЯ ИНСТРУКЦИЯ ПО ДЕПЛОЮ

## ✅ Все готово к деплою!

Все переменные окружения прописаны прямо в `docker-compose.yml` - не нужны отдельные .env файлы!

## 📋 Что сделано:

1. ✅ **docker-compose.yml** - переменные прописаны напрямую
2. ✅ **2GIS API ключ** - уже добавлен: `2aaa4ed7-7580-4e80-a139-f60e4be538c7`
3. ✅ **Dockerfile** - оптимизирован
4. ✅ **Сервис** - правильное имя `rostov-ai-travel-client`

## 🎯 Деплой на Dokploy:

### Шаг 1: Закоммитить изменения
```bash
git add .
git commit -m "Add environment variables to docker-compose"
git push origin main
```

### Шаг 2: В Dokploy
1. Остановите старый деплой (если есть)
2. Нажмите **Rebuild** или **Deploy**
3. Дождитесь завершения (3-5 минут)

### Шаг 3: Проверить
После успешного деплоя откройте в браузере:
```
http://ваш-dokploy-ip:5000/api/test
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

## 📱 Подключение клиента

После деплоя обновите `client/constants/http.ts`:

```typescript
// Замените IP на адрес вашего Dokploy сервера
const BACKEND_URL = 'http://ВАШ_DOKPLOY_IP:5000/api';
```

Например:
```typescript
const BACKEND_URL = 'http://123.45.67.89:5000/api';
```

Затем перезапустите клиент:
```bash
cd client
npm start
```

## 🔐 Безопасность (ВАЖНО!)

⚠️ **В продакшене** измените JWT секреты в docker-compose.yml:

```yaml
JWT_ACCESS_SECRET: your-super-secret-jwt-access-key-2024-CHANGE-ME
JWT_REFRESH_SECRET: your-super-secret-jwt-refresh-key-2024-CHANGE-ME
```

На сильные уникальные ключи (32+ символов):

```yaml
JWT_ACCESS_SECRET: ab3f9k2m9x7pq5n8v4j2h6g1d9c8b5a2
JWT_REFRESH_SECRET: z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4
```

## 📊 Структура после деплоя

```
┌──────────────────────────┐
│  rostov-ai-travel-client │
│    (Backend API)         │
│    Port: 5000            │
│                          │
│  ✅ Node.js              │
│  ✅ Express              │
│  ✅ 2GIS API             │
│  ✅ JWT Auth             │
└────────────┬─────────────┘
             │
             │ connects to
             ▼
┌──────────────────────────┐
│      rostov-mongo        │
│      (Database)          │
│      Port: 27017         │
│                          │
│  ✅ MongoDB 7.0          │
│  ✅ Persistent storage   │
└──────────────────────────┘
```

## 🧪 Тестирование API

После деплоя протестируйте endpoints:

```bash
# Проверка работы
curl http://YOUR_IP:5000/api/test

# Регистрация
curl -X POST http://YOUR_IP:5000/api/registration \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","username":"testuser"}'

# Вход
curl -X POST http://YOUR_IP:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Получить POI
curl http://YOUR_IP:5000/api/pois

# Получить отели
curl http://YOUR_IP:5000/api/hotels
```

## 🐛 Решение проблем

### Проблема: "Service not found"
**Решение:** Убедитесь, что имя сервиса в docker-compose.yml: `rostov-ai-travel-client`

### Проблема: "Build failed"
**Решение:** 
1. Проверьте логи Dokploy
2. Убедитесь, что все файлы закоммичены
3. Проверьте синтаксис docker-compose.yml

### Проблема: "Cannot connect to MongoDB"
**Решение:**
1. Подождите 10-20 секунд (MongoDB инициализируется)
2. Проверьте, что оба контейнера запущены
3. Посмотрите логи mongo

### Проблема: "Network Error" в клиенте
**Решение:**
1. Проверьте IP в `client/constants/http.ts`
2. Убедитесь, что сервер отвечает на `/api/test`
3. Проверьте firewall

## ✅ Checklist

- [ ] Git репозиторий обновлен
- [ ] Dokploy проект создан
- [ ] Деплой завершен успешно
- [ ] Backend отвечает на `/api/test`
- [ ] MongoDB работает
- [ ] IP обновлен в клиенте
- [ ] Клиент подключается к серверу
- [ ] JWT секреты изменены (для продакшена)

## 📚 Документация

- `DOKPLOY_DEPLOY.md` - деплой на Dokploy
- `CLIENT_CONNECTION.md` - подключение клиента
- `TWOGIS_SETUP.md` - настройка 2GIS
- `MIGRATION_TO_2GIS.md` - миграция на 2GIS
- `back/API_DOCUMENTATION.md` - API документация

## 🎉 Готово!

После выполнения всех шагов:
- ✅ Backend работает на Dokploy
- ✅ MongoDB хранит данные
- ✅ 2GIS API интегрирован
- ✅ Клиент может подключиться

---

**Нужна помощь?** Проверьте логи в Dokploy или см. документацию выше.

