export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike?: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast?: {
    day: string;
    high: number;
    low: number;
    condition: string;
    icon?: string;
  }[];
}

export interface WeatherWidgetConfig {
  location?: string;
  units?: 'metric' | 'imperial';
}
