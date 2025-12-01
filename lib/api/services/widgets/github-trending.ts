import type { GitHubTrendingRepo, GitHubTrendingWidgetConfig } from '@/components/widgets/implementations/GitHubTrendingWidget/types';
import { API_CONFIG } from '../../config';

interface GitHubTrendingAPIRepo {
  id: string;
  name: string;
  owner: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  todayStars: number;
}

interface GitHubTrendingAPIResponse {
  repos: GitHubTrendingAPIRepo[];
  lastUpdated?: string;
}

/**
 * Map language names to colors
 */
const languageColors: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};

/**
 * Fetch GitHub Trending repositories from Django backend
 */
export async function fetchGitHubTrendingData(
  config?: GitHubTrendingWidgetConfig
): Promise<GitHubTrendingRepo[]> {
  const language = config?.language || '';
  const since = config?.since || 'daily';
  const limit = config?.limit || 10;

  const params = new URLSearchParams({
    since,
    limit: limit.toString(),
  });

  if (language) {
    params.append('language', language);
  }

  const response = await fetch(`${API_CONFIG.WIDGET_API_URL}/github-trending/?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub Trending API failed: ${response.statusText}`);
  }

  const data: GitHubTrendingAPIResponse = await response.json();

  // Transform backend response to frontend expected format
  return (data.repos || []).map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: `${repo.owner}/${repo.name}`,
    description: repo.description || '',
    url: repo.url,
    stars: repo.stars,
    starsToday: repo.todayStars,
    language: repo.language || '',
    languageColor: languageColors[repo.language] || '#858585',
  }));
}
