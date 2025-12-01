'use client';

import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchMarketOverview, fetchTrendingStocks } from '@/lib/api/services/widgets/stock';
import type { StockData, MarketWidgetConfig } from './types';

interface MarketWidgetProps {
  config?: MarketWidgetConfig;
}

/**
 * Format price based on currency and type
 */
function formatPrice(price: number, currency?: 'KRW' | 'USD', compact?: boolean): string {
  if (currency === 'USD') {
    if (compact && price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (compact && price >= 10000) {
    return price.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
  }
  return price.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

/**
 * Mini Sparkline Chart Component
 */
function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const height = 32;
  const width = 60;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const color = isPositive ? '#22c55e' : '#ef4444';

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

/**
 * Market Card Component (for indices/crypto/forex)
 */
function MarketCard({ stock }: { stock: StockData }) {
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

  // Get display ticker (abbreviated)
  const displayTicker = stock.ticker || stock.symbol;
  const shortTicker = displayTicker.length > 8 ? displayTicker.slice(0, 8) + '...' : displayTicker;

  return (
    <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white truncate" title={stock.symbol}>
            {stock.symbol.length > 10 ? stock.symbol.slice(0, 10) + '...' : stock.symbol}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{shortTicker}</p>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${changeColor}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <Sparkline data={stock.sparkline || []} isPositive={isPositive} />
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(stock.price, stock.currency, true)}
          </p>
          <p className={`text-xs ${changeColor}`}>
            {isPositive ? '+' : ''}{stock.change.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Trending Stock Row Component
 */
function TrendingStockRow({ stock, index }: { stock: StockData; index: number }) {
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

  // Company logo placeholder - using first letter
  const logoLetter = stock.name.charAt(0).toUpperCase();
  const logoColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const logoColor = logoColors[index % logoColors.length];

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${logoColor} flex items-center justify-center text-white text-sm font-bold`}>
          {logoLetter}
        </div>
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white truncate max-w-[140px]">
            {stock.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{stock.symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm text-gray-900 dark:text-white">
          {formatPrice(stock.price, stock.currency)}
        </p>
        <p className={`text-xs font-medium ${changeColor}`}>
          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

/**
 * Main Market Widget Component
 * Perplexity-style market overview with indices, crypto, and trending stocks
 */
export function MarketWidget({ config }: MarketWidgetProps) {
  const market = config?.market || 'all';

  const {
    data: marketData,
    isLoading: marketLoading,
    isError: marketError,
    refetch: refetchMarket
  } = useQuery({
    queryKey: ['market-overview', market],
    queryFn: () => fetchMarketOverview(config),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  const {
    data: trendingData,
    isLoading: trendingLoading,
    refetch: refetchTrending
  } = useQuery({
    queryKey: ['trending-stocks', 'us'],
    queryFn: () => fetchTrendingStocks('us', 6),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const isLoading = marketLoading || trendingLoading;

  const handleRefresh = () => {
    refetchMarket();
    refetchTrending();
  };

  // Combine all market items for display
  const marketItems: StockData[] = [];
  if (marketData) {
    marketItems.push(...marketData.indices);
    marketItems.push(...marketData.crypto);
    marketItems.push(...marketData.forex);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">시장 전망</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (marketError) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>시장 데이터를 불러올 수 없습니다.</p>
        <button
          onClick={handleRefresh}
          className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">시장 전망</h3>
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="새로고침"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Market Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {marketItems.slice(0, 4).map((stock) => (
          <MarketCard key={stock.symbol} stock={stock} />
        ))}
      </div>

      {/* Additional items if more than 4 */}
      {marketItems.length > 4 && (
        <div className="grid grid-cols-2 gap-3">
          {marketItems.slice(4, 6).map((stock) => (
            <MarketCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      )}

      {/* Trending Stocks Section */}
      {trendingData && trendingData.stocks.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">트렌드 기업</h3>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
            {trendingData.stocks.slice(0, 6).map((stock, index) => (
              <TrendingStockRow key={stock.symbol} stock={stock} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
