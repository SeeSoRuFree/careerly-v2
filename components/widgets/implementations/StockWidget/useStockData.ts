'use client';

import { useQuery } from '@tanstack/react-query';
import { StockData, StockWidgetConfig } from './types';
import { WidgetDataHook } from '../../core/types';
import { fetchStockData } from '@/lib/api/services/widgets';

export function useStockData(config?: StockWidgetConfig): WidgetDataHook<StockData[]> {
  const query = useQuery({
    queryKey: ['widget', 'stock', config?.symbols],
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
