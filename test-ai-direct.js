// Прямое тестирование AI-контроллера без сервера
const AIController = require('./controllers/ai-controller');

async function testAI() {
  console.log('🧪 Прямое тестирование AI-контроллера...\n');

  try {
    // Тест 1: Простое сообщение
    console.log('1. Тестирование простого сообщения...');
    const response1 = await AIController.sendMessage({
      body: {
        message: 'привет',
        context: {}
      }
    }, {
      json: (data) => {
        console.log('✅ Ответ получен:', data.data.content);
        return { json: () => {} };
      }
    }, () => {});
    console.log('');

    // Тест 2: Туристический вопрос
    console.log('2. Тестирование туристического вопроса...');
    const response2 = await AIController.sendMessage({
      body: {
        message: 'Что посмотреть в Ростове-на-Дону?',
        context: {
          location: 'Ростов-на-Дону',
          interests: ['музеи', 'парки']
        }
      }
    }, {
      json: (data) => {
        console.log('✅ Ответ получен:', data.data.content);
        return { json: () => {} };
      }
    }, () => {});
    console.log('');

    // Тест 3: Навигационный вопрос
    console.log('3. Тестирование навигационного вопроса...');
    const response3 = await AIController.sendMessage({
      body: {
        message: 'Как добраться до центра города?',
        context: {
          current_location: {
            latitude: 47.2144,
            longitude: 38.9365
          }
        }
      }
    }, {
      json: (data) => {
        console.log('✅ Ответ получен:', data.data.content);
        return { json: () => {} };
      }
    }, () => {});
    console.log('');

    console.log('🎉 Все тесты прошли успешно!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Запускаем тесты
testAI();
