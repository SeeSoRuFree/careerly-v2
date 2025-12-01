import type {
  AITrendData,
  AITrendWidgetConfig,
  HuggingFaceModel,
  AIGitHubRepo,
  AINewsItem,
} from '@/components/widgets/implementations/AITrendWidget/types';
import { API_CONFIG } from '../../config';

interface HuggingFaceAPIModel {
  id: string;
  name: string;
  author: string;
  description: string;
  url: string;
  downloads: number;
  likes: number;
  tags: string[];
}

interface AITrendAPIResponse {
  lastUpdated: string;
  huggingface?: HuggingFaceAPIModel[];
  github?: AIGitHubRepo[];
  news?: AINewsItem[];
}

/**
 * Fetch AI Trend data from Django backend
 */
export async function fetchAITrendData(config?: AITrendWidgetConfig): Promise<AITrendData> {
  const limit = config?.limit || 5;
  const sources = config?.sources || ['huggingface', 'github', 'news'];

  const params = new URLSearchParams({
    limit: limit.toString(),
    sources: sources.join(','),
  });

  const response = await fetch(`${API_CONFIG.WIDGET_API_URL}/ai-trend/?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`AI Trend API failed: ${response.statusText}`);
  }

  const data: AITrendAPIResponse = await response.json();

  // Transform backend response to frontend expected format
  const huggingface: HuggingFaceModel[] = (data.huggingface || []).map((model) => ({
    ...model,
    lastModified: data.lastUpdated, // Use lastUpdated as fallback
  }));

  return {
    huggingface,
    github: data.github || [],
    news: data.news || [],
    lastUpdated: data.lastUpdated,
  };
}
