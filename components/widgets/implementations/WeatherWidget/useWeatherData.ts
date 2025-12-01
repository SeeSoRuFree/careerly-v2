'use client';

/**
 * 날씨 데이터 훅 (React Query 기반)
 */

import { useQuery } from '@tanstack/react-query';
import { WidgetDataHook } from '../../core/types';
import { WeatherData, WeatherWidgetConfig } from './types';
import { fetchWeatherData } from '@/lib/api/services/widgets';

/**
 * 날씨 데이터 훅
 */
export function useWeatherData(
  config?: WeatherWidgetConfig
): WidgetDataHook<WeatherData> {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['widget', 'weather', config?.location],
    queryFn: () => fetchWeatherData(config),
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
