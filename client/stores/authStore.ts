import { makeAutoObservable, runInAction } from "mobx";
import AuthService from "../services/AuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { $api } from "../constants/http";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
}

// src/models/IUser.ts
export interface IUser {
    id: string;
    username: string;
    email?: string;
    fullName?: string;
  }

class AuthStore {
  isAuth = false;
  isAdmin = false;
  user = {} as IUser;
  isLoading = false;
  isCheckingAuth = false;
  isInitialized = false;
  message = "";

  constructor() {
    makeAutoObservable(this);
  }

  setAuth(bool: boolean) {
    this.isAuth = bool;
  }

  setAdmin(bool: boolean) {
    this.isAdmin = bool;
  }

  setUser(user: IUser) {
    this.user = user;
  }

  setMessage(message: string) {
    this.message = message;
  }

  setLoading(bool: boolean) {
    this.isLoading = bool;
  }

  setCheckingAuth(bool: boolean) {
    this.isCheckingAuth = bool;
  }

  setInitialized(bool: boolean) {
    this.isInitialized = bool;
  }

  async login(username: string, password: string) {
    this.setLoading(true);
    try {
      console.log('🔐 Попытка входа:', username);
      const response = await AuthService.login({ username, password });
      
      if (!response.data.accessToken || !response.data.refreshToken) {
        throw new Error('Не получены токены от сервера');
      }
      
      await AsyncStorage.setItem("token", response.data.accessToken);
      await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
      
      // Получаем полную информацию о пользователе
      const userResponse = await AuthService.getMe();
      
      runInAction(() => {
        this.setAuth(true);
        this.setUser({
          id: userResponse.data.userId || '',
          username: response.data.username || username,
          email: userResponse.data.email,
          fullName: userResponse.data.fullName
        });
        this.setMessage("Вы успешно вошли");
      });
      
      console.log('✅ Успешный вход:', username);
    } catch (e: any) {
      console.error("❌ Ошибка входа:", e);
      
      // Определяем тип ошибки и показываем понятное сообщение
      let errorMessage = "Ошибка входа. Попробуйте еще раз.";
      
      if (e.response?.status === 401) {
        errorMessage = "Неверный логин или пароль";
        console.warn('⚠️ Неверные учётные данные');
      } else if (e.response?.status === 500) {
        errorMessage = "Ошибка сервера. Попробуйте позже";
      } else if (e.message?.includes('Network Error') || e.code === 'ECONNREFUSED') {
        errorMessage = "Нет подключения к серверу";
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      this.setMessage(errorMessage);
      throw e;
    } finally {
      this.setLoading(false);
    }
  }

  async registration(username: string, email: string, password: string) {
    this.setLoading(true);
    try {
      // Регистрация пользователя (не возвращает токены)
      await AuthService.registrationLegacy(username, email, password);
      
      // После успешной регистрации автоматически логинимся
      await this.login(username, password);
      
      runInAction(() => {
        this.setMessage("Успешная регистрация");
      });
      
      console.log('✅ Успешная регистрация:', username);
    } catch (e) {
      console.error("Ошибка регистрации:", e);
      this.setMessage("Ошибка регистрации. Попробуйте еще раз.");
      throw e;
    } finally {
      this.setLoading(false);
    }
  }

  async logout() {
    try {
      // Пытаемся выйти через API, но не блокируем локальный выход при ошибке
      try {
        await AuthService.logout();
      } catch (apiError) {
        console.warn("⚠️ Не удалось уведомить сервер о выходе:", apiError);
        // Продолжаем локальный выход даже если API недоступен
      }
      
      // Очищаем локальные данные в любом случае
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("refreshToken");
      runInAction(() => {
        this.setAuth(false);
        this.setUser({} as IUser);
        this.setMessage("Выход из аккаунта");
      });
      console.log("✅ Успешный выход из системы");
    } catch (e) {
      console.error("❌ Критическая ошибка выхода:", e);
      // Всё равно пытаемся очистить данные
      try {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("refreshToken");
        runInAction(() => {
          this.setAuth(false);
          this.setUser({} as IUser);
          this.setMessage("Выход выполнен с ошибками");
        });
      } catch (cleanupError) {
        console.error("❌ Ошибка очистки данных:", cleanupError);
        this.setMessage("Ошибка выхода. Перезапустите приложение.");
      }
    }
  }

  async checkAuth() {
    this.setCheckingAuth(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        runInAction(() => {
          this.setAuth(false);
          this.setUser({} as IUser);
          this.setAdmin(false);
        });
        return;
      }

      // Получаем информацию о текущем пользователе
      const userResponse = await AuthService.getMe();
      
      runInAction(() => {
        this.setAuth(true);
        this.setUser({
          id: userResponse.data.userId || '',
          username: userResponse.data.username || '',
          email: userResponse.data.email,
          fullName: userResponse.data.fullName
        });
      });
      
      console.log('✅ Пользователь авторизован:', userResponse.data.username);
    } catch (e) {
      // Тихо обрабатываем ошибку - токен невалидный или истек
      runInAction(() => {
        this.setAuth(false);
        this.setUser({} as IUser);
        this.setAdmin(false);
      });
    } finally {
      runInAction(() => {
        this.setCheckingAuth(false);
        this.setInitialized(true);
      });
    }
  }
}

export const authStore = new AuthStore();
