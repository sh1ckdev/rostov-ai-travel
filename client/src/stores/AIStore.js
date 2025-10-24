import { makeAutoObservable } from 'mobx';

class AIStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.chatHistory = [];
    this.isTyping = false;
    this.isLoading = false;
    this.error = null;
    this.aiPersonality = 'friendly'; // friendly, professional, casual
    this.language = 'ru'; // ru, en
    
    makeAutoObservable(this);
  }

  async sendMessage(message, context = {}) {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Добавляем сообщение пользователя в историю
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      this.chatHistory.push(userMessage);
      
      // Показываем индикатор печати
      this.isTyping = true;
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify({
          message,
          context: {
            ...context,
            userPreferences: this.rootStore.authStore.user?.preferences,
            currentLocation: context.currentLocation,
            language: this.language,
            personality: this.aiPersonality
          },
          chatHistory: this.chatHistory.slice(-10) // Последние 10 сообщений для контекста
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Добавляем ответ ИИ в историю
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.response,
          suggestions: data.suggestions || [],
          actions: data.actions || [],
          timestamp: new Date().toISOString()
        };
        this.chatHistory.push(aiMessage);
        
        return aiMessage;
      } else {
        throw new Error('Ошибка получения ответа от ИИ');
      }
    } catch (error) {
      this.error = error.message;
      
      // Добавляем сообщение об ошибке
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date().toISOString()
      };
      this.chatHistory.push(errorMessage);
      
      throw error;
    } finally {
      this.isLoading = false;
      this.isTyping = false;
    }
  }

  async getRecommendations(userPreferences, location, context = {}) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify({
          userPreferences,
          location,
          context,
          language: this.language
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.recommendations;
      } else {
        throw new Error('Ошибка получения рекомендаций');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async analyzeRoute(route) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch('/api/ai/analyze-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify({
          route,
          language: this.language
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.analysis;
      } else {
        throw new Error('Ошибка анализа маршрута');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async translateText(text, targetLanguage) {
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
          sourceLanguage: this.language
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.translatedText;
      } else {
        throw new Error('Ошибка перевода');
      }
    } catch (error) {
      console.error('Ошибка перевода:', error);
      return text; // Возвращаем оригинальный текст в случае ошибки
    }
  }

  async getWeatherAdvice(location, date) {
    try {
      const response = await fetch('/api/ai/weather-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location,
          date,
          language: this.language
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.advice;
      } else {
        throw new Error('Ошибка получения совета по погоде');
      }
    } catch (error) {
      console.error('Ошибка получения совета по погоде:', error);
      return null;
    }
  }

  setLanguage(language) {
    this.language = language;
  }

  setPersonality(personality) {
    this.aiPersonality = personality;
  }

  clearChatHistory() {
    this.chatHistory = [];
  }

  async getToken() {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('token');
  }

  clearError() {
    this.error = null;
  }
}

export default AIStore;
