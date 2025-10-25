const axios = require('axios');

async function testOpenRouter() {
  const apiKey = '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';
  
  console.log('🧪 Тестирование OpenRouter API...\n');

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'microsoft/phi-3-mini-128k-instruct:free',
      messages: [
        {
          role: 'user',
          content: 'Привет! Как дела?'
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rostov-ai-travel.com',
        'X-Title': 'Rostov AI Travel'
      }
    });

    console.log('✅ OpenRouter работает!');
    console.log('Ответ:', response.data.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Ошибка OpenRouter:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testOpenRouter();
