require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const router = require('./routes/index')
const errorMiddleware = require('./middlewares/error-middleware')

const PORT = process.env.PORT || 5000;
const app = express();

// В режиме разработки разрешаем все источники
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: true, // Разрешаем все источники в режиме разработки
    credentials: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  }));
} else {
  app.use(cors({
    origin: [
      'http://localhost:5175', 
      'http://localhost:8081', 
      'http://localhost:19006',
      'http://10.0.2.2:19006', // Android эмулятор
      'http://localhost:3000',
      'exp://localhost:19000', // Expo dev
      'http://192.168.31.250:19006', // Физическое устройство
      'exp://192.168.31.250:19000', // Expo dev на физическом устройстве
    ], 
    credentials: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  }));
}

app.use(express.json());
app.use(cookieParser());

// Добавляем логирование всех запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use('/api', router)
app.use(errorMiddleware)

const start = async () => {
  try {
    const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/rostov-ai-travel';
    console.log('Connecting to database:', dbUrl);
    await mongoose.connect(dbUrl);
    

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Сервер запущен на порте ${PORT} на всех интерфейсах`);
      console.log(`Доступен по адресам:`);
      console.log(`- http://localhost:${PORT}`);
      console.log(`- http://127.0.0.1:${PORT}`);
      console.log(`- http://192.168.31.250:${PORT}`);
    });
  } catch(e) {
    console.log(e)
  }
}

start()