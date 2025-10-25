# 📱 Подключение клиента к серверу

## 🎯 Быстрая настройка

### Шаг 1: Узнайте адрес вашего сервера

После деплоя на Dokploy:
1. Откройте Dokploy
2. Перейдите в проект "Rostov AI Travel"
3. Найдите IP адрес или домен

### Шаг 2: Обновите файл

Откройте `client/constants/http.ts` и замените:

```typescript
// БЫЛО:
const BACKEND_URL = 'http://138.124.14.197:5000/api';

// СТАЛО (замените на ваш IP):
const BACKEND_URL = 'http://YOUR_DOKPLOY_IP:5000/api';
```

**Примеры:**

```typescript
// Если у вас IP адрес:
const BACKEND_URL = 'http://123.45.67.89:5000/api';

// Если у вас домен:
const BACKEND_URL = 'https://rostov.yourdomain.com/api';

// Если у вас домен с портом:
const BACKEND_URL = 'http://rostov.yourdomain.com:5000/api';
```

### Шаг 3: Проверьте подключение

**В браузере откройте:**
```
http://YOUR_IP:5000/api/test
```

**Должен вернуть:**
```json
{
  "message": "Backend is working!",
  "timestamp": "2025-10-25T...",
  "ip": "...",
  "userAgent": "..."
}
```

### Шаг 4: Перезапустите приложение

```bash
cd client
npm start
```

Или для Expo:
```bash
npx expo start
```

## 🔧 Что было исправлено

1. ✅ `withCredentials: false` - для React Native
2. ✅ `timeout: 15000` - увеличен до 15 секунд
3. ✅ BACKEND_URL вынесен в константу для удобства

## 🐛 Решение проблем

### Ошибка: "Network Error"

**Причины:**
1. ❌ Неправильный IP/домен в BACKEND_URL
2. ❌ Сервер не запущен
3. ❌ Порт 5000 недоступен
4. ❌ Firewall блокирует соединение

**Решение:**
```bash
# 1. Проверьте, что сервер отвечает
curl http://YOUR_IP:5000/api/test

# 2. Проверьте логи Dokploy
# Перейдите в Dokploy → Logs → backend

# 3. Убедитесь, что порт открыт
# В Dokploy проверьте, что порт 5000 пробрасывается
```

### Ошибка: "Timeout"

**Решение:**
- Увеличен timeout до 15 секунд (уже сделано)
- Проверьте скорость интернета
- Проверьте, что сервер не перегружен

### Ошибка: "CORS"

**Решение:**
- На бекенде уже настроено `CORS_ORIGIN=*`
- Если ошибка осталась, проверьте логи сервера

## 📱 Для разных окружений

Если нужны разные URL для dev и prod:

```typescript
const getBaseURL = () => {
  if (__DEV__) {
    // Development
    return 'http://localhost:5000/api';
  }
  // Production
  return 'http://YOUR_PRODUCTION_IP:5000/api';
};
```

## ✅ Checklist подключения

- [ ] Сервер задеплоен на Dokploy
- [ ] Сервер отвечает на `/api/test`
- [ ] BACKEND_URL обновлен с правильным IP
- [ ] Приложение перезапущено
- [ ] Логин работает

## 🎉 Готово!

После этих шагов приложение должно подключиться к серверу!

---

**Нужна помощь?** Проверьте:
1. Логи Dokploy (backend)
2. Консоль React Native
3. Network tab в Expo DevTools

