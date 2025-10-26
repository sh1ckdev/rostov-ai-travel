# 🏨 Rostov AI Travel - Клиентское приложение

Мобильное приложение для туристического сервиса Ростова-на-Дону с AI-ассистентом, управлением отелями, событиями и прогнозом погоды.

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск приложения

```bash
npx expo start
```

## 📱 Возможности приложения

- 🔐 **Аутентификация** - Регистрация, вход, управление профилем
- 🎉 **События** - Просмотр, поиск и бронирование событий
- 🏨 **Отели** - Поиск, бронирование и отзывы об отелях
- 🤖 **AI-ассистент** - Чат с AI для получения рекомендаций
- 🌤️ **Погода** - Прогноз погоды и рекомендации по одежде
- 🗺️ **Карты** - Интерактивные карты с POI

## 🛠️ API Интеграция

Приложение полностью интегрировано с REST API и включает:

### Сервисы
- `AuthService` - Аутентификация и авторизация
- `EventService` - Управление событиями
- `HotelService` - Управление отелями
- `AIHotelService` - AI чат и рекомендации
- `WeatherService` - Прогноз погоды

### Утилиты
- `ApiUtils` - Утилиты для работы с API
- Автоматическое обновление токенов
- Обработка ошибок
- Форматирование данных

## 📚 Документация

- [🚀 Быстрый старт](QUICK_START.md) - Основы использования API
- [📖 Полная документация](API_DOCUMENTATION.md) - Подробное описание всех сервисов
- [💡 Примеры использования](examples/apiUsage.ts) - Практические примеры

## 🏗️ Структура проекта

```
client/
├── app/                    # Экранные компоненты (Expo Router)
├── components/             # Переиспользуемые компоненты
├── services/              # API сервисы
│   ├── AuthService.ts     # Аутентификация
│   ├── EventService.ts    # События
│   ├── HotelService.ts    # Отели
│   ├── AIHotelService.ts  # AI чат
│   ├── WeatherService.ts  # Погода
│   └── index.ts          # Экспорт всех сервисов
├── types/                 # TypeScript типы
│   ├── api.ts            # API типы
│   └── poi.ts            # POI типы
├── utils/                 # Утилиты
│   └── apiUtils.ts       # API утилиты
├── constants/             # Константы
│   └── http.ts           # HTTP конфигурация
├── examples/              # Примеры использования
│   └── apiUsage.ts       # Примеры API
└── stores/               # MobX стейт менеджмент
    └── authStore.ts      # Стейт аутентификации
```

## 🔧 Настройка

### Конфигурация API

Настройте URL бекенда в `constants/http.ts`:

```typescript
const DEV_BACKEND_URLS = [
  'http://192.168.31.250:5000',    // Ваш IP адрес
  'http://localhost:5000',          
  // ... другие URL
];
```

### Инициализация

```typescript
import { initializeAPI } from './constants/http';

// В App.tsx
useEffect(() => {
  initializeAPI();
}, []);
```

## 📱 Использование

### Импорт сервисов

```typescript
import { 
  AuthService, 
  EventService, 
  HotelService, 
  AIHotelService, 
  WeatherService,
  ApiUtils 
} from './services';
```

### Пример аутентификации

```typescript
// Вход в систему
const response = await AuthService.login({
  username: 'user',
  password: 'password'
});

// Сохранение токенов
await ApiUtils.saveTokens(response.data);
```

### Пример работы с событиями

```typescript
// Получение событий
const events = await EventService.getEvents({
  Page: 1,
  PageSize: 10,
  Filters: 'isAvalible:true'
});

// Бронирование
const booking = await EventService.bookEvent(1, {
  eventId: 1,
  ticketsCount: 2,
  bookingDate: new Date().toISOString()
});
```

## 🎨 UI/UX

Приложение использует:
- **NativeWind** - Tailwind CSS для React Native
- **Expo Router** - Файловая маршрутизация
- **MobX** - Управление состоянием
- **Expo Maps** - Интерактивные карты
- **Glass morphism** - Современный дизайн

## 🔐 Безопасность

- JWT токены с автоматическим обновлением
- Bearer авторизация
- Валидация данных на клиенте
- Обработка ошибок сети

## 🌐 Поддерживаемые платформы

- ✅ iOS
- ✅ Android  
- ✅ Web

## 🚀 Развертывание

### Development

```bash
npx expo start
```

### Production

```bash
npx expo build
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте подключение к интернету
2. Убедитесь, что бекенд запущен на `http://138.124.14.197:8080`
3. Посмотрите логи в консоли разработчика

## 📄 Лицензия

Этот проект является частью туристического сервиса Ростова-на-Дону.

---

**Создано с ❤️ для туристов Ростова-на-Дону**
