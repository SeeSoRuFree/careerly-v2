export interface StockData {
  symbol: string;
  name: string;
  ticker?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  currency?: 'KRW' | 'USD';
  type?: 'index' | 'stock' | 'forex' | 'crypto';
  sparkline?: number[];
}

export interface MarketOverviewData {
  indices: StockData[];
  forex: StockData[];
  crypto: StockData[];
  lastUpdated: string;
}

export interface TrendingStocksData {
  stocks: StockData[];
  market: 'us' | 'kr';
  lastUpdated: string;
}

export interface StockWidgetConfig {
  symbols?: readonly string[] | string[];
  market?: 'KOSPI' | 'KOSDAQ' | 'US';
}

export interface MarketWidgetConfig {
  market?: 'us' | 'kr' | 'all';
  showTrending?: boolean;
}
