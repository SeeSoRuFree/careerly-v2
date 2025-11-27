'use client';

import { Cloud, Droplets, Wind, Sun, CloudRain, CloudSnow } from 'lucide-react';
import { WidgetProps } from '../../core/types';
import { WidgetContainer } from '../../core/WidgetContainer';
import { useWeatherData } from './useWeatherData';
import { WeatherData, WeatherWidgetConfig } from './types';

const weatherIcons: Record<string, React.ReactNode> = {
  sunny: <Sun className="w-12 h-12 text-yellow-500" />,
  cloudy: <Cloud className="w-12 h-12 text-gray-500" />,
  rainy: <CloudRain className="w-12 h-12 text-blue-500" />,
  snowy: <CloudSnow className="w-12 h-12 text-blue-300" />,
};

export function WeatherWidget({
  config,
  onRemove,
  onRefresh,
}: WidgetProps<WeatherData, WeatherWidgetConfig>) {
  const { data, isLoading, isError, error, refetch } = useWeatherData(config.config ?? {});

  return (
    <WidgetContainer
      config={config}
      onRemove={onRemove}
      onRefresh={() => refetch()}
      isLoading={isLoading}
      isError={isError}
      error={error ?? undefined}
    >
      {data && (
        <div className="flex flex-col h-full">
          {/* 현재 날씨 */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{data.location}</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {data.temperature}°
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{data.condition}</p>
            </div>
            {weatherIcons[data.icon] || weatherIcons.cloudy}
          </div>

          {/* 추가 정보 */}
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              <span>{data.humidity}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-4 h-4" />
              <span>{data.windSpeed} km/h</span>
            </div>
          </div>

          {/* 주간 예보 (large 사이즈일 때만) */}
          {config.size !== 'small' && data.forecast && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-5 gap-2">
                {data.forecast.slice(0, 5).map((day, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-xs text-gray-500">{day.day}</p>
                    <p className="text-sm font-medium">{day.high}°</p>
                    <p className="text-xs text-gray-400">{day.low}°</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </WidgetContainer>
  );
}
