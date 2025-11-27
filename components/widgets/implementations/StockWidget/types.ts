export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
}

export interface StockWidgetConfig {
  symbols?: string[];
  market?: 'KOSPI' | 'KOSDAQ' | 'US';
}
