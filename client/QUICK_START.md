# 🚀 Быстрый старт с API

## Установка и настройка

1. **Импортируйте нужные сервисы:**
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

2. **Инициализируйте API:**
```typescript
import { initializeAPI } from './constants/http';

// В App.tsx или в начале приложения
useEffect(() => {
  initializeAPI();
}, []);
```

## 🔐 Аутентификация

```typescript
// Регистрация
const registerData = {
  login: 'username',
  password: 'password123',
  confirmPassword: 'password123',
  email: 'user@example.com'
};
await AuthService.register(registerData);

// Вход
const loginData = {
  username: 'username',
  password: 'password123'
};
const response = await AuthService.login(loginData);
await ApiUtils.saveTokens(response.data);

// Проверка авторизации
const isAuth = await ApiUtils.isAuthenticated();
```

## 🎉 Работа с событиями

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

// Поиск
const searchResults = await EventService.searchEvents({
  query: 'концерт'
});
```

## 🏨 Работа с отелями

```typescript
// Получение отелей
const hotels = await HotelService.getHotels({
  Page: 1,
  PageSize: 10
});

// Бронирование
const booking = await HotelService.bookHotel(1, {
  hotelId: 1,
  checkInDate: new Date().toISOString(),
  checkOutDate: new Date(Date.now() + 86400000).toISOString()
});

// Проверка доступности
const availability = await HotelService.checkAvailability({
  hotelId: 1,
  checkIn: new Date().toISOString(),
  checkOut: new Date(Date.now() + 86400000).toISOString()
});
```

## 🤖 AI чат

```typescript
// Начало чата
const chatResponse = await AIHotelService.startChat({
  location: 'Ростов-на-Дону'
});

// Отправка сообщения
const response = await AIHotelService.sendMessage({
  sessionId: chatResponse.data.sessionId,
  message: 'Покажи лучшие отели'
});

// Получение рекомендаций
const recommendations = await AIHotelService.getRecommendations({
  location: 'Ростов-на-Дону'
});
```

## 🌤️ Погода

```typescript
// Прогноз погоды
const forecast = await WeatherService.getPublicWeatherForecast();

// Погода на сегодня
const todayWeather = await WeatherService.getTodayWeather();

// Рекомендации по одежде
const clothingTips = await WeatherService.getClothingRecommendations();
```

## 🛠️ Утилиты

```typescript
// Обработка ошибок
try {
  await SomeService.someMethod();
} catch (error) {
  const errorMessage = ApiUtils.handleApiError(error);
  console.error(errorMessage);
}

// Форматирование
const formattedDate = ApiUtils.formatDate(new Date());
const formattedPrice = ApiUtils.formatPrice(1500);
const formattedTime = ApiUtils.formatTime(18, 30);

// Валидация
const isValidEmail = ApiUtils.isValidEmail('user@example.com');
const isValidPassword = ApiUtils.isValidPassword('password123');
```

## 📱 Пример компонента

```typescript
import React, { useEffect, useState } from 'react';
import { EventService, EventDto } from './services';

export const EventsList: React.FC = () => {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await EventService.getEvents();
        setEvents(response.data.data);
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) return <Text>Загрузка...</Text>;

  return (
    <FlatList
      data={events}
      renderItem={({ item }) => <EventItem event={item} />}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};
```

## 🔧 Настройка

### Переменные окружения

URL бекенда настроен в `constants/http.ts`:

```typescript
const BACKEND_URL = 'http://138.124.14.197:8080';
```

### Обработка ошибок

Всегда оборачивайте API вызовы в try/catch:

```typescript
try {
  const result = await SomeService.someMethod();
  // Успех
} catch (error) {
  const message = ApiUtils.handleApiError(error);
  // Показать ошибку пользователю
}
```

## 📚 Дополнительная документация

- Полная документация: `API_DOCUMENTATION.md`
- Примеры использования: `examples/apiUsage.ts`
- Типы данных: `types/api.ts`

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте подключение к интернету
2. Убедитесь, что бекенд запущен на `http://138.124.14.197:8080`
3. Посмотрите логи в консоли разработчика
