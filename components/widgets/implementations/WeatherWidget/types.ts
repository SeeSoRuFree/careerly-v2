export interface AirQuality {
  level: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy';
  label: string;
  color: string;
  pm25: number;
  pm10: number;
}

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon?: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  todayHigh?: number;
  todayLow?: number;
  feelsLike?: number;
  condition: string;
  conditionKr?: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  airQuality?: AirQuality;
  forecast?: WeatherForecast[];
}

export interface WeatherWidgetConfig {
  location?: string;
  units?: 'metric' | 'imperial';
}
