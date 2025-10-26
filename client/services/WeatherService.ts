import { $api } from "../constants/http";
import { WeatherForecast } from "../types/api";

export default class WeatherService {
  /**
   * Получение публичного прогноза погоды
   */
  static getPublicWeatherForecast() {
    return $api.get<WeatherForecast[]>('/WeatherForecast/public');
  }

  /**
   * Получение детального прогноза погоды
   */
  static getDetailedWeatherForecast() {
    return $api.get('/WeatherForecast/detailed');
  }

  /**
   * Получение административного прогноза погоды
   */
  static getAdminWeatherForecast() {
    return $api.get('/WeatherForecast/admin');
  }

  // Вспомогательные методы для работы с погодой

  /**
   * Получение прогноза погоды на сегодня
   */
  static async getTodayWeather() {
    const forecasts = await this.getPublicWeatherForecast();
    const today = new Date();
    const todayForecast = forecasts.data.find(forecast => {
      const forecastDate = new Date(forecast.date.year, forecast.date.month - 1, forecast.date.day);
      return forecastDate.toDateString() === today.toDateString();
    });
    return todayForecast;
  }

  /**
   * Получение прогноза погоды на завтра
   */
  static async getTomorrowWeather() {
    const forecasts = await this.getPublicWeatherForecast();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowForecast = forecasts.data.find(forecast => {
      const forecastDate = new Date(forecast.date.year, forecast.date.month - 1, forecast.date.day);
      return forecastDate.toDateString() === tomorrow.toDateString();
    });
    return tomorrowForecast;
  }

  /**
   * Получение прогноза погоды на неделю
   */
  static async getWeeklyWeather() {
    const forecasts = await this.getPublicWeatherForecast();
    return forecasts.data.slice(0, 7); // Первые 7 дней
  }

  /**
   * Получение прогноза погоды на 3 дня
   */
  static async getThreeDayWeather() {
    const forecasts = await this.getPublicWeatherForecast();
    return forecasts.data.slice(0, 3); // Первые 3 дня
  }

  /**
   * Получение прогноза погоды на 5 дней
   */
  static async getFiveDayWeather() {
    const forecasts = await this.getPublicWeatherForecast();
    return forecasts.data.slice(0, 5); // Первые 5 дней
  }

  /**
   * Получение средней температуры за период
   */
  static async getAverageTemperature(days: number = 7) {
    const forecasts = await this.getPublicWeatherForecast();
    const periodForecasts = forecasts.data.slice(0, days);
    
    if (periodForecasts.length === 0) {
      return null;
    }

    const totalTemperature = periodForecasts.reduce((sum, forecast) => sum + forecast.temperatureC, 0);
    return Math.round(totalTemperature / periodForecasts.length);
  }

  /**
   * Получение максимальной температуры за период
   */
  static async getMaxTemperature(days: number = 7) {
    const forecasts = await this.getPublicWeatherForecast();
    const periodForecasts = forecasts.data.slice(0, days);
    
    if (periodForecasts.length === 0) {
      return null;
    }

    return Math.max(...periodForecasts.map(forecast => forecast.temperatureC));
  }

  /**
   * Получение минимальной температуры за период
   */
  static async getMinTemperature(days: number = 7) {
    const forecasts = await this.getPublicWeatherForecast();
    const periodForecasts = forecasts.data.slice(0, days);
    
    if (periodForecasts.length === 0) {
      return null;
    }

    return Math.min(...periodForecasts.map(forecast => forecast.temperatureC));
  }

  /**
   * Получение прогноза погоды с описанием
   */
  static async getWeatherWithDescription() {
    const forecasts = await this.getPublicWeatherForecast();
    return forecasts.data.map(forecast => ({
      ...forecast,
      description: forecast.summary || 'Нет описания',
      temperatureF: forecast.temperatureF || Math.round(forecast.temperatureC * 9/5 + 32)
    }));
  }

  /**
   * Получение прогноза погоды для конкретной даты
   */
  static async getWeatherForDate(targetDate: Date) {
    const forecasts = await this.getPublicWeatherForecast();
    const targetForecast = forecasts.data.find(forecast => {
      const forecastDate = new Date(forecast.date.year, forecast.date.month - 1, forecast.date.day);
      return forecastDate.toDateString() === targetDate.toDateString();
    });
    return targetForecast;
  }

  /**
   * Получение прогноза погоды для выходных
   */
  static async getWeekendWeather() {
    const forecasts = await this.getPublicWeatherForecast();
    const weekendForecasts = forecasts.data.filter(forecast => {
      const forecastDate = new Date(forecast.date.year, forecast.date.month - 1, forecast.date.day);
      const dayOfWeek = forecastDate.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Воскресенье или суббота
    });
    return weekendForecasts.slice(0, 2); // Ближайшие выходные
  }

  /**
   * Получение прогноза погоды для рабочих дней
   */
  static async getWeekdayWeather() {
    const forecasts = await this.getPublicWeatherForecast();
    const weekdayForecasts = forecasts.data.filter(forecast => {
      const forecastDate = new Date(forecast.date.year, forecast.date.month - 1, forecast.date.day);
      const dayOfWeek = forecastDate.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Понедельник - пятница
    });
    return weekdayForecasts.slice(0, 5); // Ближайшие рабочие дни
  }

  /**
   * Проверка, будет ли дождь
   */
  static async willItRain(days: number = 3) {
    const forecasts = await this.getPublicWeatherForecast();
    const periodForecasts = forecasts.data.slice(0, days);
    
    return periodForecasts.some(forecast => 
      forecast.summary?.toLowerCase().includes('дождь') ||
      forecast.summary?.toLowerCase().includes('rain') ||
      forecast.summary?.toLowerCase().includes('осадки')
    );
  }

  /**
   * Получение рекомендаций по одежде на основе погоды
   */
  static async getClothingRecommendations() {
    const todayWeather = await this.getTodayWeather();
    
    if (!todayWeather) {
      return 'Не удалось получить прогноз погоды';
    }

    const temp = todayWeather.temperatureC;
    let recommendation = '';

    if (temp < 0) {
      recommendation = 'Очень холодно! Наденьте теплую зимнюю одежду, шапку, перчатки и теплую обувь.';
    } else if (temp < 10) {
      recommendation = 'Холодно. Рекомендуется теплая одежда, куртка и закрытая обувь.';
    } else if (temp < 20) {
      recommendation = 'Прохладно. Подойдет легкая куртка или свитер.';
    } else if (temp < 30) {
      recommendation = 'Комфортная температура. Легкая одежда будет идеальной.';
    } else {
      recommendation = 'Жарко! Легкая, дышащая одежда и головной убор обязательны.';
    }

    return recommendation;
  }
}
