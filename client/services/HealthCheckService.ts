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
      
      if (!apiUrl || apiUrl.includes('undefined') || apiUrl === 'http://localhost:5000/api') {
        console.warn('⚠️ API URL еще не готов, пропускаем проверку');
        this.isHealthy = false;
        return false;
      }
      
      console.log('🔍 Проверяем здоровье бекенда на:', `${apiUrl}/test`);
      
      const response = await axios.get(`${apiUrl}/test`, {
        timeout: 5000,
        validateStatus: (status) => status === 200
      });
      
      this.isHealthy = response.data?.message === 'Backend is working!';
      console.log('✅ Health check successful:', response.data);
      return this.isHealthy;
    } catch (error: any) {
      console.error('❌ Backend health check failed:', error.message || error);
      this.isHealthy = false;
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
        console.warn('⚠️ API URL еще не готов для быстрой проверки');
        this.isHealthy = false;
        return false;
      }
      
      console.log('🔍 Быстрая проверка здоровья бекенда на:', `${apiUrl}/test`);
      
      const response = await axios.get(`${apiUrl}/test`, {
        timeout: 3000
      });
      this.isHealthy = response.data?.message === 'Backend is working!';
      console.log('✅ Quick health check successful:', response.data);
      return this.isHealthy;
    } catch (error: any) {
      console.error('❌ Quick health check failed:', error.message || error);
      this.isHealthy = false;
      return false;
    }
  }
}

