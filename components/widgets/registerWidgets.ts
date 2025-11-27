/**
 * 위젯 등록 함수
 */

import { WidgetRegistry } from './core/WidgetRegistry';
import { WeatherWidget } from './implementations/WeatherWidget/WeatherWidget';
import { useWeatherData } from './implementations/WeatherWidget/useWeatherData';
import { StockWidget } from './implementations/StockWidget/StockWidget';
import { useStockData } from './implementations/StockWidget/useStockData';
import { JobWidget } from './implementations/JobWidget/JobWidget';
import { useJobData } from './implementations/JobWidget/useJobData';

let registered = false;

export function registerAllWidgets() {
  if (registered) return;
  registered = true;

  // 날씨 위젯
  WidgetRegistry.register({
    metadata: {
      type: 'weather',
      name: '날씨',
      description: '현재 날씨와 주간 예보',
      icon: '🌤️',
      defaultSize: 'medium',
      supportedSizes: ['small', 'medium', 'large'],
      dataSource: 'rest',
      refreshInterval: 10 * 60 * 1000,
      category: '생활',
    },
    component: WeatherWidget,
    useData: useWeatherData,
    defaultConfig: {
      location: '서울',
      units: 'metric',
    },
  });

  // 주식 위젯
  WidgetRegistry.register({
    metadata: {
      type: 'stock',
      name: '주식/지수',
      description: 'KOSPI, KOSDAQ, 미국 주식',
      icon: '📈',
      defaultSize: 'medium',
      supportedSizes: ['small', 'medium', 'large'],
      dataSource: 'rest',
      refreshInterval: 60 * 1000,
      category: '금융',
    },
    component: StockWidget,
    useData: useStockData,
    defaultConfig: {
      symbols: ['KOSPI', 'KOSDAQ'],
      market: 'KOSPI',
    },
  });

  // 채용 위젯
  WidgetRegistry.register({
    metadata: {
      type: 'job',
      name: '추천 채용',
      description: '오늘의 추천 채용공고',
      icon: '💼',
      defaultSize: 'large',
      supportedSizes: ['medium', 'large', 'full'],
      dataSource: 'internal',
      refreshInterval: 5 * 60 * 1000,
      category: '채용',
    },
    component: JobWidget,
    useData: useJobData,
    defaultConfig: {
      limit: 5,
      category: undefined,
    },
  });
}
