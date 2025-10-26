import { $api } from "../constants/http";
import { 
  RegisterModel, 
  LoginModel, 
  LoginResponseModel, 
  TokenModel
} from "../types/api";

export default class AuthService {
  /**
   * Регистрация нового пользователя
   */
  static register(data: RegisterModel) {
    return $api.post('/Auth/register', data);
  }

  /**
   * Вход в систему
   */
  static login(data: LoginModel) {
    return $api.post<LoginResponseModel>('/Auth/login', data);
  }

  /**
   * Обновление токена доступа
   */
  static refresh(data: TokenModel) {
    return $api.post<LoginResponseModel>('/Auth/refresh', data);
  }

  /**
   * Выход из системы
   */
  static logout() {
    return $api.post('/Auth/logout');
  }

  /**
   * Получение информации о текущем пользователе
   */
  static getMe() {
    return $api.get<{
      username: string;
      userId: string;
      email?: string;
      fullName?: string;
      isAuthenticated: boolean;
    }>('/Auth/me');
  }

  // Методы для обратной совместимости
  static loginLegacy(username: string, password: string) {
    return this.login({ username, password });
  }

  static registrationLegacy(username: string, email: string, password: string) {
    return this.register({
      login: username,
      password,
      confirmPassword: password,
      email
    });
  }
}
