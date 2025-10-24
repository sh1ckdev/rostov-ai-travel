# Используем официальный Node.js образ
FROM node:22-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json
COPY package.json ./

# Устанавливаем зависимости
RUN npm install --omit=dev

# Копируем исходный код приложения
COPY . .

# Устанавливаем Expo CLI глобально
RUN npm install -g @expo/cli

# Открываем порт для Expo
EXPOSE 8081

# Устанавливаем переменные окружения
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Команда для запуска приложения
CMD ["npx", "expo", "start", "--web", "--host", "0.0.0.0"]
