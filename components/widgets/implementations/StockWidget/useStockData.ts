'use client';

import { useQuery } from '@tanstack/react-query';
import { StockData, StockWidgetConfig } from './types';
import { WidgetDataHook } from '../../core/types';

// Mock 데이터 (실제 API 연동 전)
const mockStockData: StockData[] = [
  {
    symbol: 'KOSPI',
    name: '코스피',
    price: 2547.32,
    change: 15.67,
    changePercent: 0.62,
    volume: 423567890,
    high: 2555.10,
    low: 2532.45,
  },
  {
    symbol: 'KOSDAQ',
    name: '코스닥',
    price: 845.21,
    change: -3.45,
    changePercent: -0.41,
    volume: 678234567,
    high: 850.23,
    low: 842.10,
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 178.56,
    change: 2.34,
    changePercent: 1.33,
    volume: 45678901,
    high: 179.80,
    low: 176.23,
  },
];

async function fetchStockData(config?: StockWidgetConfig): Promise<StockData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // TODO: 실제 API 연동
  // const symbols = config?.symbols || ['KOSPI', 'KOSDAQ'];
  // return await stockService.getQuotes(symbols);

  return mockStockData;
}

export function useStockData(config?: StockWidgetConfig): WidgetDataHook<StockData[]> {
  const query = useQuery({
    queryKey: ['widget', 'stock', config],
    queryFn: () => fetchStockData(config),
    staleTime: 60 * 1000, // 1분
    refetchInterval: 60 * 1000, // 1분마다 갱신
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
