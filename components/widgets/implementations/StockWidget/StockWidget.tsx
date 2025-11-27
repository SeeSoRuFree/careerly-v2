'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { WidgetProps } from '../../core/types';
import { WidgetContainer } from '../../core/WidgetContainer';
import { useStockData } from './useStockData';
import { StockData, StockWidgetConfig } from './types';

export function StockWidget({
  config,
  onRemove,
}: WidgetProps<StockData[], StockWidgetConfig>) {
  const { data, isLoading, isError, error, refetch } = useStockData(config.config);

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
        <div className="space-y-3">
          {data.map((stock) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stock.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {stock.price.toLocaleString()}
                </p>
                <div
                  className={`flex items-center justify-end gap-1 text-sm ${
                    stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {stock.change >= 0 ? '+' : ''}
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetContainer>
  );
}
