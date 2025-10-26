import axios from 'axios';
import { API_URL } from '@/constants/http';

export class HealthCheckService {
  private static checkInterval: ReturnType<typeof setInterval> | null = null;
  private static isHealthy: boolean = false;
  private static listeners: ((healthy: boolean) => void)[] = [];

  // Проверка здоровья бекенда
  static async checkHealth(): Promise<boolean> {
    try {
      const apiUrl = API_URL.value;
      
      if (!apiUrl || apiUrl.includes('undefined')) {
        this.isHealthy = false;
        return false;
      }
      
      // Используем эндпоинт Health для проверки здоровья
      const response = await axios.get(`${apiUrl}/Health`, {
        timeout: 5000,
        validateStatus: (status) => status === 200
      });
      
      // Проверяем, что получили объект с status: "healthy"
      const wasHealthy = this.isHealthy;
      this.isHealthy = response.data && response.data.status === 'healthy';
      
      // Логируем только при изменении статуса
      if (wasHealthy !== this.isHealthy) {
        console.log(this.isHealthy ? '✅ Backend подключен' : '⚠️ Backend недоступен');
      }
      
      return this.isHealthy;
    } catch {
      const wasHealthy = this.isHealthy;
      this.isHealthy = false;
      
      // Логируем только при изменении статуса
      if (wasHealthy !== this.isHealthy) {
        console.log('⚠️ Backend недоступен');
      }
      
      return false;
    }
  }

  // Альтернативная проверка через эндпоинт Auth (если нужна авторизация)
  static async checkHealthWithAuth(): Promise<boolean> {
    try {
      const apiUrl = API_URL.value;
      
      if (!apiUrl || apiUrl.includes('undefined')) {
        return false;
      }
      
      await axios.get(`${apiUrl}/Auth/check`, {
        timeout: 5000
      });
      
      return true;
    } catch (error: any) {
      // Даже если 401/403, сервер работает
      if (error.response && [401, 403].includes(error.response.status)) {
        return true;
      }
      return false;
    }
  }

  // Получить текущий статус
  static getStatus(): boolean {
    return this.isHealthy;
  }

  // Подписаться на изменения статуса
  static subscribe(callback: (healthy: boolean) => void): () => void {
    this.listeners.push(callback);
    
    // Возвращаем функцию отписки
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Уведомить всех подписчиков
  private static notify() {
    this.listeners.forEach(listener => listener(this.isHealthy));
  }

  // Запустить периодическую проверку
  static startMonitoring(interval: number = 30000) {
    // Сначала проверяем сразу
    this.checkHealth().then(() => this.notify());

    // Затем запускаем периодическую проверку
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      const wasHealthy = this.isHealthy;
      await this.checkHealth();
      
      // Уведомляем только если статус изменился
      if (wasHealthy !== this.isHealthy) {
        this.notify();
      }
    }, interval);
  }

  // Остановить мониторинг
  static stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Быстрая проверка (для инициализации)
  static async quickCheck(): Promise<boolean> {
    try {
      const apiUrl = API_URL.value;
      
      if (!apiUrl || apiUrl.includes('undefined')) {
        this.isHealthy = false;
        return false;
      }
      
      // Используем эндпоинт Health для быстрой проверки
      const response = await axios.get(`${apiUrl}/Health`, {
        timeout: 3000,
        validateStatus: (status) => status === 200
      });
      
      // Проверяем, что получили объект с status: "healthy"
      this.isHealthy = response.data && response.data.status === 'healthy';
      
      if (this.isHealthy) {
        console.log('✅ Backend подключен');
      }
      
      return this.isHealthy;
    } catch {
      this.isHealthy = false;
      return false;
    }
  }
}