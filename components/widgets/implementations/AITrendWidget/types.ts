/**
 * AI Trend Widget Types
 *
 * Aggregates trending AI content from multiple sources:
 * - Hugging Face trending models
 * - AI-related GitHub trending repos
 * - AI-tagged articles from GeekNews
 */

export type AITrendSource = 'huggingface' | 'github' | 'news';
export type AITrendPeriod = 'daily' | 'weekly' | 'monthly';

export interface HuggingFaceModel {
  id: string;
  name: string;
  author: string;
  downloads: number;
  likes: number;
  tags: string[];
  description?: string;
  url: string;
  lastModified: string;
}

export interface AIGitHubRepo {
  id: string;
  name: string;
  owner: string;
  description: string;
  stars: number;
  language: string;
  url: string;
  todayStars: number;
}

export interface AINewsItem {
  id: string;
  title: string;
  url: string;
  points: number;
  comments: number;
  postedAt: string;
  tags: string[];
}

export interface AITrendData {
  huggingface: HuggingFaceModel[];
  github: AIGitHubRepo[];
  news: AINewsItem[];
  lastUpdated: string;
}

export interface AITrendWidgetConfig {
  sources?: readonly AITrendSource[] | AITrendSource[];
  limit?: number;
  period?: AITrendPeriod;
  githubLanguage?: string;
  showTabs?: boolean;
}
