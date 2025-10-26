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
      const response = await AuthService.login({ username, password });
      await AsyncStorage.setItem("token", response.data.accessToken);
      await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
      
      // Получаем полную информацию о пользователе
      const userResponse = await AuthService.getMe();
      
      runInAction(() => {
        this.setAuth(true);
        this.setUser({
          id: userResponse.data.userId || '',
          username: response.data.username,
          email: userResponse.data.email,
          fullName: userResponse.data.fullName
        });
        this.setMessage("Вы успешно вошли");
      });
    } catch (e) {
      console.error("Ошибка входа:", e);
      this.setMessage("Ошибка входа. Попробуйте еще раз.");
    } finally {
      this.setLoading(false);
    }
  }

  async registration(username: string, email: string, password: string) {
    this.setLoading(true);
    try {
      const response = await AuthService.registrationLegacy(username, email, password);
      await AsyncStorage.setItem("token", response.data.accessToken);
      await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
      
      // Получаем полную информацию о пользователе
      const userResponse = await AuthService.getMe();
      
      runInAction(() => {
        this.setAuth(true);
        this.setUser({
          id: userResponse.data.userId || '',
          username: response.data.username,
          email: userResponse.data.email,
          fullName: userResponse.data.fullName
        });
        this.setMessage("Успешная регистрация");
      });
    } catch (e) {
      console.error("Ошибка регистрации:", e);
      this.setMessage("Ошибка регистрации. Попробуйте еще раз.");
    } finally {
      this.setLoading(false);
    }
  }

  async logout() {
    try {
      await AuthService.logout();
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("refreshToken");
      runInAction(() => {
        this.setAuth(false);
        this.setUser({} as IUser);
        this.setMessage("Выход из аккаунта");
      });
    } catch (e) {
      console.error("Ошибка выхода:", e);
      this.setMessage("Ошибка выхода. Попробуйте еще раз.");
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
    } catch (e) {
      console.error("Ошибка проверки аутентификации:", e);
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
