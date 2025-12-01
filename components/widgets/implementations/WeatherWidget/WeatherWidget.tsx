'use client';

import { useState } from 'react';
import { Cloud, Droplets, Wind, Sun, CloudRain, CloudSnow, ChevronDown, ChevronUp } from 'lucide-react';
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

const smallWeatherIcons: Record<string, React.ReactNode> = {
  sunny: <Sun className="w-4 h-4 text-yellow-500" />,
  cloudy: <Cloud className="w-4 h-4 text-gray-500" />,
  rainy: <CloudRain className="w-4 h-4 text-blue-500" />,
  snowy: <CloudSnow className="w-4 h-4 text-blue-300" />,
};

export function WeatherWidget({
  config,
  onRemove,
}: WidgetProps<WeatherData, WeatherWidgetConfig>) {
  const { data, isLoading, isError, error, refetch } = useWeatherData(config.config ?? {});
  const [showForecast, setShowForecast] = useState(false);

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
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{data.location}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {data.temperature}°
                </p>
                {data.todayHigh !== undefined && data.todayLow !== undefined && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {data.todayHigh}° / {data.todayLow}°
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {data.conditionKr || data.condition}
              </p>
            </div>
            {weatherIcons[data.icon] || weatherIcons.cloudy}
          </div>

          {/* 추가 정보 */}
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              <span>{data.humidity}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-4 h-4" />
              <span>{data.windSpeed} km/h</span>
            </div>
          </div>

          {/* 미세먼지 */}
          {data.airQuality && (
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.airQuality.color }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                미세먼지 {data.airQuality.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                PM2.5 {data.airQuality.pm25} · PM10 {data.airQuality.pm10}
              </span>
            </div>
          )}

          {/* 주간 예보 토글 */}
          {data.forecast && data.forecast.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <button
                onClick={() => setShowForecast(!showForecast)}
                className="flex items-center justify-between w-full py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <span>주간 예보</span>
                {showForecast ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showForecast && (
                <div className="grid grid-cols-7 gap-1 mt-2">
                  {data.forecast.slice(0, 7).map((day, idx) => (
                    <div key={idx} className="text-center py-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {day.day}
                      </p>
                      <div className="flex justify-center mb-1">
                        {smallWeatherIcons[day.icon || 'cloudy'] || smallWeatherIcons.cloudy}
                      </div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {day.high}°
                      </p>
                      <p className="text-xs text-gray-400">{day.low}°</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </WidgetContainer>
  );
}
