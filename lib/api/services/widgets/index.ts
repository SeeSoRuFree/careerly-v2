/**
 * Widget API Services
 *
 * Central export point for all widget-related API services.
 * These services interact with Django backend for server-side data fetching.
 */

export { fetchWeatherData } from './weather';
export { fetchStockData } from './stock';
export { fetchGeekNewsData } from './geeknews';
export { fetchTechStackData } from './techstack';
export { fetchBigTechBlogData } from './bigtech-blog';
export { fetchGitHubTrendingData } from './github-trending';
export { fetchITNewsData } from './it-news';
export { fetchAITrendData } from './ai-trend';

export type { WidgetAPIResponse, WidgetAPIError, CacheConfig, APIServiceConfig } from './types';
