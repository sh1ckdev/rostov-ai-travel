# 📱 Инструкция по сборке Development Build

## 🎯 Что будет собрано
Development Build для iOS с поддержкой всех нативных модулей (геолокация, карты и т.д.)

## 📋 Предварительные требования

1. **Установите EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Войдите в аккаунт Expo**:
   ```bash
   eas login
   ```

3. **Настройте проект** (в папке `client`):
   ```bash
   cd client
   eas build:configure
   ```

## 🚀 Быстрый старт

### Вариант 1: Локальная сборка (для симулятора)

```bash
cd client
npx expo run:ios
```

### Вариант 2: Cloud Build для устройства

```bash
cd client

# Соберите development build
eas build --profile development --platform ios

# Установите на ваше устройство
eas build:run -p ios
```

### Вариант 3: Simulator Build

```bash
cd client
eas build --profile development --platform ios --local
```

## 📱 После сборки

1. **Установите приложение на iPhone** (через QR-код или TestFlight)
2. **Откройте приложение**
3. **Разрешите доступ к геолокации** (в появившемся запросе)
4. **Готово!** Геолокация будет работать

## 🔧 Настройка app.json

Проверьте, что в `app.json` настроены разрешения:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Это приложение использует ваше местоположение"
      }
    },
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Это приложение использует ваше местоположение"
        }
      ]
    ]
  }
}
```

## 🐛 Решение проблем

**Если сборка не удается:**
```bash
# Очистите кеш
eas build:configure --clear-cache

# Попробуйте снова
eas build --profile development --platform ios --clear-cache
```

**Если геолокация все еще не работает:**
1. Проверьте настройки iPhone: Настройки → Конфиденциальность → Геолокация → Rostov AI Travel
2. Переустановите приложение
3. Проверьте логи в Xcode

## 📝 Альтернатива: Fast Refresh

Если не хотите ждать полной сборки, можете использовать Expo Go с ограничениями:

```bash
cd client
npx expo start --dev-client
```

Но лучше собрать development build для полной функциональности!
