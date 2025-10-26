# Web API с JWT Authentication

API с поддержкой JWT аутентификации, регистрации пользователей и внутренним HashService для безопасного хранения паролей.

## Технологии

- **.NET 8.0**
- **ASP.NET Core Web API**
- **JWT Bearer Authentication**
- **Swagger/OpenAPI**
- **SHA256 Hashing с Salt**

## Структура проекта

```
WebApplication1/
├── Controllers/
│   ├── AuthController.cs      # Контроллер аутентификации
│   └── WeatherForecastController.cs
├── Services/
│   ├── AuthService.cs         # Сервис аутентификации
│   ├── TokenService.cs        # Сервис генерации JWT токенов
│   ├── UserService.cs         # Сервис управления пользователями (in-memory)
│   └── IHashService.cs        # Сервис хеширования паролей
├── Models/
│   ├── User.cs                # Модель пользователя
│   └── AuthOptions.cs         # Настройки JWT
├── DTOs/
│   ├── LoginModel.cs          # DTO для логина
│   ├── RegisterModel.cs       # DTO для регистрации
│   ├── LoginResponseModel.cs  # DTO ответа после логина
│   ├── TokenModel.cs          # DTO для refresh токена
│   └── UserDto.cs             # DTO данных пользователя
├── Constants/
│   └── ApplicationConstants.cs # Константы приложения
└── Exceptions/
    └── UserExceptions.cs      # Пользовательские исключения
```

## Запуск приложения

### Через Visual Studio

1. Откройте решение `WebApplication1.sln` в Visual Studio
2. Нажмите F5 или кнопку "Start" для запуска
3. Приложение откроется в браузере с Swagger UI на `https://localhost:xxxx/`

### Через командную строку

```bash
cd WebApplication1
dotnet restore
dotnet build
dotnet run
```

## Использование API через Swagger

После запуска приложения, Swagger UI будет доступен по адресу: `https://localhost:xxxx/`

### 1. Регистрация нового пользователя

**Endpoint:** `POST /api/Auth/register`

**Тело запроса:**
```json
{
  "login": "testuser",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "email": "test@example.com",
  "fullName": "Test User"
}
```

**Ответ (201 Created):**
```json
{
  "message": "Пользователь успешно зарегистрирован",
  "userId": 1,
  "login": "testuser"
}
```

### 2. Вход в систему (Login)

**Endpoint:** `POST /api/Auth/login`

**Тело запроса:**
```json
{
  "username": "testuser",
  "password": "Password123!"
}
```

**Ответ (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "A1B2C3D4E5F6...",
  "refreshTokenExpires": "2024-11-01T12:00:00Z",
  "username": "testuser",
  "role": "User"
}
```

### 3. Использование JWT токена

После получения `accessToken`:

1. В Swagger UI нажмите кнопку **"Authorize"** (замок в правом верхнем углу)
2. Введите: `Bearer <ваш_accessToken>`
3. Нажмите "Authorize"

Теперь вы можете использовать защищенные endpoints.

### 4. Получение информации о текущем пользователе

**Endpoint:** `GET /api/Auth/me` (требует авторизации)

**Ответ (200 OK):**
```json
{
  "username": "testuser",
  "role": "User",
  "userId": "1",
  "isAuthenticated": true
}
```

### 5. Обновление токена (Refresh Token)

**Endpoint:** `POST /api/Auth/refresh`

**Тело запроса:**
```json
{
  "accessToken": "старый_accessToken",
  "refreshToken": "ваш_refreshToken"
}
```

**Ответ (200 OK):**
```json
{
  "accessToken": "новый_accessToken",
  "refreshToken": "новый_refreshToken",
  "refreshTokenExpires": "2024-11-01T12:00:00Z",
  "username": "testuser",
  "role": "User"
}
```

### 6. Выход из системы (Logout)

**Endpoint:** `POST /api/Auth/logout` (требует авторизации)

**Ответ (200 OK):**
```json
{
  "message": "Вы успешно вышли из системы"
}
```

## Конфигурация JWT

Настройки JWT можно изменить в файле `appsettings.json`:

```json
{
  "JwtSettings": {
    "SecretKey": "ваш_секретный_ключ_минимум_32_символа",
    "Issuer": "WebApi",
    "Audience": "WebApiUsers",
    "TokenLifetime": 60
  }
}
```

- **SecretKey** - секретный ключ для подписи JWT (минимум 32 символа)
- **Issuer** - издатель токена
- **Audience** - аудитория токена
- **TokenLifetime** - время жизни access токена в минутах

## Безопасность

- Пароли хешируются с использованием **SHA256** с уникальной **солью (64 байта)** для каждого пользователя
- **Refresh токены** действительны 7 дней
- **Access токены** действительны 60 минут (по умолчанию)
- JWT токены подписываются с использованием HMAC SHA256

## Примечание

⚠️ **Важно:** Текущая реализация использует **in-memory хранилище** для пользователей. Данные будут потеряны при перезапуске приложения. Для production-среды необходимо интегрировать базу данных (например, Entity Framework Core с SQL Server, PostgreSQL или MySQL).

## Возможные ошибки

### 400 Bad Request
- Некорректные данные в запросе
- Пароли не совпадают при регистрации
- Пользователь с таким логином уже существует

### 401 Unauthorized
- Неверные учетные данные
- Токен истёк
- Refresh token недействителен

### 500 Internal Server Error
- Внутренняя ошибка сервера
- Проверьте логи приложения

## Логирование

Приложение использует встроенное логирование ASP.NET Core. Логи можно увидеть в консоли при запуске приложения.

## Следующие шаги

1. **Интеграция базы данных** - добавить Entity Framework Core
2. **Email подтверждение** - добавить подтверждение email при регистрации
3. **Восстановление пароля** - добавить функционал восстановления пароля
4. **Роли и права доступа** - расширить систему ролей
5. **Rate Limiting** - добавить ограничение количества запросов
6. **Two-Factor Authentication** - добавить двухфакторную аутентификацию

## Контакты

Для вопросов и предложений создайте Issue в репозитории проекта.

