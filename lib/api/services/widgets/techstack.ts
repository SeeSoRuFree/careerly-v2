import type { TechStackItem } from '@/components/widgets/implementations/TechStackWidget/types';
import { API_CONFIG } from '../../config';

interface TechStackAPIResponse {
  stacks: TechStackItem[];
  rising: string[];
}

/**
 * Fetch TechStack data from Django backend
 */
export async function fetchTechStackData(config?: {
  category?: 'frontend' | 'backend' | 'all';
  period?: 'week' | 'month';
}): Promise<{
  stacks: TechStackItem[];
  hot: string[];
}> {
  const category = config?.category || 'frontend';
  const period = config?.period || 'week';

  const params = new URLSearchParams({
    category,
    period,
  });

  const response = await fetch(`${API_CONFIG.WIDGET_API_URL}/techstack/?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`TechStack API failed: ${response.statusText}`);
  }

  const data: TechStackAPIResponse = await response.json();

  // Transform backend response (rising) to frontend expected format (hot)
  return {
    stacks: data.stacks,
    hot: data.rising,
  };
}
