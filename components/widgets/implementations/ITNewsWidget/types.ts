export interface ITNewsItem {
  id: string;
  title: string;
  url: string;
  source: 'bloter' | 'zdnet' | 'itchosun' | 'etnews';
  sourceName: string;
  postedAt: string;
}

export interface ITNewsWidgetConfig {
  sources?: readonly ('bloter' | 'zdnet' | 'itchosun' | 'etnews')[] | ('bloter' | 'zdnet' | 'itchosun' | 'etnews')[];
  limit?: number;
}
