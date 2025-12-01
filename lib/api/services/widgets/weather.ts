import type { WeatherData, WeatherWidgetConfig } from '@/components/widgets/implementations/WeatherWidget/types';
import { API_CONFIG } from '../../config';

/**
 * Fetch Weather data from Django backend (Open-Meteo)
 * Includes: current weather, 7-day forecast, air quality
 */
export async function fetchWeatherData(
  config?: WeatherWidgetConfig
): Promise<WeatherData> {
  const location = config?.location || 'Seoul';
  const units = config?.units || 'metric';

  const params = new URLSearchParams({
    location,
    units,
  });

  const response = await fetch(`${API_CONFIG.WIDGET_API_URL}/weather/?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Weather API failed: ${response.statusText}`);
  }

  const data = await response.json();

  // Backend now returns icon directly as 'sunny', 'cloudy', 'rainy', 'snowy'
  return {
    location: data.location,
    temperature: data.temperature,
    todayHigh: data.todayHigh,
    todayLow: data.todayLow,
    condition: data.condition,
    conditionKr: data.conditionKr,
    humidity: data.humidity,
    windSpeed: data.windSpeed,
    icon: data.icon,
    airQuality: data.airQuality,
    forecast: data.forecast,
  };
}
