import { notFound } from 'next/navigation';
import { getDiscoverFeed } from '@/lib/api';
import type { DiscoverFeed } from '@/lib/api';
import type { DiscoverContentDetail } from '@/lib/data/discover-mock';
import { DiscoverDetailPage } from '@/components/ui/discover-detail-page';

interface DiscoverDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * DiscoverFeed API 응답을 DiscoverContentDetail 타입으로 변환
 */
function transformToContentDetail(feedData: DiscoverFeed): DiscoverContentDetail {
  return {
    contentId: feedData.id,
    title: feedData.title,
    summary: feedData.description,
    thumbnailUrl: feedData.imageUrl,
    sources: [
      {
        name: feedData.author.name,
        href: '#',
      },
    ],
    postedAt: new Date(feedData.createdAt).toLocaleDateString('ko-KR'),
    stats: {
      likes: feedData.stats.likes,
      views: feedData.stats.views,
    },
    href: `/discover/${feedData.id}`,
    badge: feedData.category,
    badgeTone: 'default' as const,
    liked: false,
    bookmarked: false,
    tags: feedData.tags,
    difficulty: 'intermediate' as const,
    readTime: '5분',
    fullContent: feedData.description,
    relatedContent: [],
  };
}

export default async function Page({ params }: DiscoverDetailPageProps) {
  const { id } = await params;

  try {
    const feedData = await getDiscoverFeed(id);

    if (!feedData) {
      notFound();
    }

    const content = transformToContentDetail(feedData);
    return <DiscoverDetailPage content={content} />;
  } catch (error) {
    console.error('Error fetching discover feed:', error);
    notFound();
  }
}
