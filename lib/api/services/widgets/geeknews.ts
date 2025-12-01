import type { GeekNewsItem, GeekNewsWidgetConfig } from '@/components/widgets/implementations/GeekNewsWidget/types';
import { API_CONFIG } from '../../config';

/**
 * Fetch GeekNews data from Django backend
 */
export async function fetchGeekNewsData(
  config?: GeekNewsWidgetConfig
): Promise<GeekNewsItem[]> {
  const limit = config?.limit || 5;

  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  const response = await fetch(`${API_CONFIG.WIDGET_API_URL}/geeknews/?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`GeekNews API failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items || [];
}
