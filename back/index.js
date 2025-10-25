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

// Улучшенная обработка JSON с лучшими сообщениями об ошибках
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON received:', buf.toString());
      throw new Error('Invalid JSON format');
    }
  }
}));
app.use(cookieParser());

// Middleware для обработки ошибок JSON
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON Parse Error:', error.message);
    return res.status(400).json({
      error: 'Invalid JSON format',
      message: 'Please check your JSON syntax. Make sure all strings are properly quoted and all colons are present.',
      details: error.message
    });
  }
  next();
});

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
    // Выводим все переменные окружения при запуске
    console.log('🔧 Переменные окружения:');
    console.log('=====================================');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'не установлено');
    console.log('PORT:', process.env.PORT || 'не установлено');
    console.log('DB_URL:', process.env.DB_URL || 'не установлено');
    console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? '***установлено***' : 'не установлено');
    console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '***установлено***' : 'не установлено');
    console.log('TWOGIS_API_KEY:', process.env.TWOGIS_API_KEY ? '***установлено***' : 'не установлено');
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '***установлено***' : 'не установлено');
    console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '***установлено***' : 'не установлено');
    console.log('ROSREESTR_API_KEY:', process.env.ROSREESTR_API_KEY ? '***установлено***' : 'не установлено');
    console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || 'не установлено');
    console.log('USE_EXPO_LOCATION:', process.env.USE_EXPO_LOCATION || 'не установлено');
    console.log('USE_EXPO_MAPS:', process.env.USE_EXPO_MAPS || 'не установлено');
    console.log('LOG_LEVEL:', process.env.LOG_LEVEL || 'не установлено');
    console.log('BOOKING_API_KEY:', process.env.BOOKING_API_KEY ? '***установлено***' : 'не установлено');
    console.log('TRIPADVISOR_API_KEY:', process.env.TRIPADVISOR_API_KEY ? '***установлено***' : 'не установлено');
    console.log('=====================================');
    
    const dbUrl = process.env.DB_URL || 'mongodb://mongo:27017/rostov-ai-travel';
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