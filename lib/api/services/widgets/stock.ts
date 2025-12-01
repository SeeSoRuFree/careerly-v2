import type {
  StockData,
  StockWidgetConfig,
  MarketOverviewData,
  TrendingStocksData,
  MarketWidgetConfig
} from '@/components/widgets/implementations/StockWidget/types';
import { API_CONFIG } from '../../config';

interface StockAPIItem {
  name: string;
  nameKr: string;
  ticker?: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  currency: 'KRW' | 'USD';
  type?: 'index' | 'stock' | 'forex' | 'crypto';
  sparkline?: number[];
}

interface StockAPIResponse {
  stocks: StockAPIItem[];
  lastUpdated: string;
}

interface MarketOverviewAPIResponse {
  indices: StockAPIItem[];
  forex: StockAPIItem[];
  crypto: StockAPIItem[];
  lastUpdated: string;
}

interface TrendingStocksAPIResponse {
  stocks: StockAPIItem[];
  market: 'us' | 'kr';
  lastUpdated: string;
}

/**
 * Transform backend stock item to frontend format
 */
function transformStockItem(item: StockAPIItem): StockData {
  return {
    symbol: item.name,
    name: item.nameKr,
    ticker: item.ticker,
    price: item.price,
    change: item.change,
    changePercent: item.changePercent,
    volume: item.volume,
    high: item.high,
    low: item.low,
    currency: item.currency,
    type: item.type,
    sparkline: item.sparkline,
  };
}

/**
 * Fetch Stock/Index data from Django backend (FinanceDataReader)
 * Supports: KOSPI, KOSDAQ, S&P500, NASDAQ, DOW, individual stocks
 */
export async function fetchStockData(
  config?: StockWidgetConfig
): Promise<StockData[]> {
  const symbols = config?.symbols || ['KOSPI', 'KOSDAQ', 'S&P500'];

  const params = new URLSearchParams({
    symbols: symbols.join(','),
  });

  const response = await fetch(`${API_CONFIG.WIDGET_API_URL}/stock/?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Stock API failed: ${response.statusText}`);
  }

  const data: StockAPIResponse = await response.json();

  return data.stocks.map(transformStockItem);
}

/**
 * Fetch Market Overview (indices, forex, crypto)
 * Similar to Perplexity's market overview widget
 */
export async function fetchMarketOverview(
  config?: MarketWidgetConfig
): Promise<MarketOverviewData> {
  const market = config?.market || 'all';

  const params = new URLSearchParams({ market });

  const response = await fetch(`${API_CONFIG.WIDGET_API_URL}/market-overview/?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Market Overview API failed: ${response.statusText}`);
  }

  const data: MarketOverviewAPIResponse = await response.json();

  return {
    indices: data.indices.map(transformStockItem),
    forex: data.forex.map(transformStockItem),
    crypto: data.crypto.map(transformStockItem),
    lastUpdated: data.lastUpdated,
  };
}

/**
 * Fetch Trending Stocks
 */
export async function fetchTrendingStocks(
  market: 'us' | 'kr' = 'us',
  limit: number = 8
): Promise<TrendingStocksData> {
  const params = new URLSearchParams({
    market,
    limit: limit.toString(),
  });

  const response = await fetch(`${API_CONFIG.WIDGET_API_URL}/trending-stocks/?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Trending Stocks API failed: ${response.statusText}`);
  }

  const data: TrendingStocksAPIResponse = await response.json();

  return {
    stocks: data.stocks.map(transformStockItem),
    market: data.market,
    lastUpdated: data.lastUpdated,
  };
}
