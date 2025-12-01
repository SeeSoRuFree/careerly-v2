'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { WidgetProps } from '../../core/types';
import { WidgetContainer } from '../../core/WidgetContainer';
import { useStockData } from './useStockData';
import { StockData, StockWidgetConfig } from './types';

/**
 * Format price based on currency
 */
function formatPrice(price: number, currency?: 'KRW' | 'USD'): string {
  if (currency === 'USD') {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  // KRW or index (no currency symbol for indices)
  return price.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

/**
 * Format volume with K, M, B suffixes
 */
function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(1)}B`;
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return volume.toString();
}

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
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                  {stock.currency && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                      {stock.currency}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stock.name}</p>
                {/* 거래량 표시 (0이 아닐 때만) */}
                {stock.volume > 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    거래량 {formatVolume(stock.volume)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(stock.price, stock.currency)}
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
                {/* 고가/저가 (0이 아니고 가격과 다를 때만) */}
                {stock.high > 0 && stock.low > 0 && (stock.high !== stock.price || stock.low !== stock.price) && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    H {formatPrice(stock.high, stock.currency)} · L {formatPrice(stock.low, stock.currency)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetContainer>
  );
}
