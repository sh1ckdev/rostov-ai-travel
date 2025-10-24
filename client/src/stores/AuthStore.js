import { makeAutoObservable } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.user = null;
    this.isAuthenticated = false;
    this.isLoading = false;
    this.error = null;
    
    makeAutoObservable(this);
    this.loadUserFromStorage();
  }

  async loadUserFromStorage() {
    try {
      this.isLoading = true;
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData);
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async login(email, password) {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Здесь будет API вызов для аутентификации
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        this.user = userData.user;
        this.isAuthenticated = true;
        await AsyncStorage.setItem('user', JSON.stringify(userData.user));
        await AsyncStorage.setItem('token', userData.token);
      } else {
        throw new Error('Неверные учетные данные');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async register(userData) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        this.user = result.user;
        this.isAuthenticated = true;
        await AsyncStorage.setItem('user', JSON.stringify(result.user));
        await AsyncStorage.setItem('token', result.token);
      } else {
        throw new Error('Ошибка регистрации');
      }
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  }

  updateUserProfile(updates) {
    if (this.user) {
      this.user = { ...this.user, ...updates };
      AsyncStorage.setItem('user', JSON.stringify(this.user));
    }
  }

  clearError() {
    this.error = null;
  }
}

export default AuthStore;
