import { $api } from "../constants/http";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

// src/models/IUser.ts
export interface IUser {
    id: string;
    username: string;
    email: string;
  }

export default class AuthService {
  static login(username: string, password: string) {
    return $api.post<AuthResponse>('/login', { username, password });
  }

  static registration(username: string, email: string, password: string) {
    return $api.post<AuthResponse>('/registration', {
      username,
      email,
      password,
    });
  }

  static logout() {
    return $api.get('/logout');
  }
}
