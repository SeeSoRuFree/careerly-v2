import type { ITNewsItem, ITNewsWidgetConfig } from '@/components/widgets/implementations/ITNewsWidget/types';
import { API_CONFIG } from '../../config';

/**
 * Fetch IT News data from Django backend
 */
export async function fetchITNewsData(
  config?: ITNewsWidgetConfig
): Promise<ITNewsItem[]> {
  const sources = config?.sources || ['bloter', 'zdnet', 'itchosun'];
  const limit = config?.limit || 10;

  const params = new URLSearchParams({
    sources: sources.join(','),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_CONFIG.WIDGET_API_URL}/it-news/?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`IT News API failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.news || [];
}
