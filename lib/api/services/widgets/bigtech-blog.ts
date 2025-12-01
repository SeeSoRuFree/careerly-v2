import type { BigTechBlogPost, BigTechBlogWidgetConfig } from '@/components/widgets/implementations/BigTechBlogWidget/types';
import { API_CONFIG } from '../../config';

interface BigTechBlogAPIPost {
  id: string;
  title: string;
  url: string;
  company: string;
  companyName: string;
  color: string;
  publishedAt: string;
}

interface BigTechBlogAPIResponse {
  posts: BigTechBlogAPIPost[];
  lastUpdated?: string;
}

/**
 * Format date to relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  return `${Math.floor(diffDays / 30)}개월 전`;
}

/**
 * Fetch BigTech Blog posts from Django backend
 */
export async function fetchBigTechBlogData(
  config?: BigTechBlogWidgetConfig
): Promise<BigTechBlogPost[]> {
  const companies = config?.companies || ['kakao', 'naver', 'toss'];
  const limit = config?.limit || 10;

  const params = new URLSearchParams({
    companies: companies.join(','),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_CONFIG.WIDGET_API_URL}/bigtech-blog/?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`BigTechBlog API failed: ${response.statusText}`);
  }

  const data: BigTechBlogAPIResponse = await response.json();

  // Transform backend response to frontend expected format
  return (data.posts || []).map((post) => ({
    id: post.id,
    title: post.title,
    url: post.url,
    company: post.company as BigTechBlogPost['company'],
    companyName: post.companyName,
    companyColor: post.color,
    tags: [], // Backend doesn't provide tags
    postedAt: formatRelativeTime(post.publishedAt),
  }));
}
