require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const router = require('./routes/index')
const errorMiddleware = require('./middlewares/error-middleware')

const PORT = process.env.PORT || 5000;
const app = express();

// Разрешаем CORS для всех источников
app.use(cors({
  origin: true, // Разрешаем все источники
  credentials: true, 
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 204,
}));

app.use(express.json());
app.use(cookieParser());

// Добавляем логирование всех запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Обработка OPTIONS запросов для CORS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
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