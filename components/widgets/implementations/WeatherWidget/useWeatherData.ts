/**
 * 날씨 데이터 훅 (React Query 기반)
 */

import { useQuery } from '@tanstack/react-query';
import { WidgetDataHook } from '../../core/types';
import { WeatherData, WeatherWidgetConfig } from './types';

/**
 * 날씨 API 호출 (예시 - 실제로는 MCP 또는 외부 API 사용)
 */
async function fetchWeatherData(location?: string): Promise<WeatherData> {
  // TODO: 실제 날씨 API 연동 (예: OpenWeatherMap, MCP 등)
  // 여기서는 모의 데이터 반환
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    location: location || '서울',
    temperature: 23,
    feelsLike: 21,
    condition: '맑음',
    humidity: 65,
    windSpeed: 3.5,
    icon: '☀️',
    forecast: [
      { day: '월', high: 25, low: 18, condition: '맑음', icon: '☀️' },
      { day: '화', high: 24, low: 17, condition: '구름', icon: '☁️' },
      { day: '수', high: 22, low: 16, condition: '비', icon: '🌧️' },
    ],
  };
}

/**
 * 날씨 데이터 훅
 */
export function useWeatherData(
  config: WeatherWidgetConfig
): WidgetDataHook<WeatherData> {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['weather', config.location],
    queryFn: () => fetchWeatherData(config.location),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    refetchInterval: 10 * 60 * 1000, // 10분마다 자동 갱신
  });

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch: () => {
      refetch();
    },
  };
}
