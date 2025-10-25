const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY не найден в .env файле');
    console.log('Текущая директория:', __dirname);
    console.log('Переменные окружения:', Object.keys(process.env).filter(key => key.includes('OPEN')));
    return;
  }

  console.log('🧪 Тестирование OpenRouter API...\n');
  console.log('API Key найден, первые 10 символов:', apiKey.substring(0, 10) + '...');

  console.log('🧪 Тестирование OpenRouter API...\n');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'не найден');

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'tngtech/deepseek-r1t2-chimera:free', // Более надежная модель
      messages: [
        {
          role: 'user',
          content: 'Привет! Ответь коротко - как дела?'
        }
      ],
      max_tokens: 50,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rostov-ai-travel.com',
        'X-Title': 'Rostov AI Travel'
      },
      timeout: 10000 // 10 секунд таймаут
    });

    console.log('✅ OpenRouter работает!');
    console.log('Ответ:', response.data.choices[0].message.content);
    console.log('Использованная модель:', response.data.model);
    console.log('Использовано токенов:', response.data.usage?.total_tokens);
    
  } catch (error) {
    console.error('❌ Ошибка OpenRouter:');
    
    if (error.response) {
      // Сервер ответил с ошибкой
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // Запрос был сделан, но ответа нет
      console.error('No response received:', error.message);
    } else {
      // Что-то пошло не так при настройке запроса
      console.error('Error:', error.message);
    }
  }
}

testOpenRouter();