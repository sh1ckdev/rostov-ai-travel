@echo off
echo 🚀 Starting deployment...

REM Останавливаем существующие контейнеры
echo 🛑 Stopping existing containers...
docker-compose down

REM Удаляем старые образы (опционально)
echo 🗑️ Removing old images...
docker-compose down --rmi all

REM Собираем и запускаем контейнеры
echo 🔨 Building and starting containers...
docker-compose up --build -d

REM Показываем статус
echo 📊 Container status:
docker-compose ps

REM Показываем логи
echo 📝 Recent logs:
docker-compose logs --tail=20

echo ✅ Deployment completed!
echo 🌐 Backend is available at: http://localhost:5000
echo 🗄️ MongoDB is available at: localhost:27017
echo 🔧 MongoDB Admin UI is available at: http://localhost:8081
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
pause
