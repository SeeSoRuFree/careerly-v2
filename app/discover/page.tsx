'use client';

import * as React from 'react';
import { DiscoverContentCard, DiscoverContentCardProps } from '@/components/ui/discover-content-card';
import { DiscoverFeedSection } from '@/components/ui/discover-feed-section';
import { DiscoverCategoryTabs } from '@/components/ui/discover-category-tabs';
import { Chip } from '@/components/ui/chip';
import { cn } from '@/lib/utils';
import { JobMarketTrendCard } from '@/components/ui/job-market-trend-card';
import { Button } from '@/components/ui/button';
import { Grid3x3, List, Sparkles, X, ExternalLink } from 'lucide-react';
import { useInfiniteDailyContents, useInfiniteDailyJobs, type SomoonDailyContent, type SomoonJobItem, type SomoonPaginatedResponse } from '@/lib/api';
import { mockJobMarketTrends } from '@/lib/data/discover-mock';
import { LoadMore } from '@/components/ui/load-more';

// 위젯 imports
import { registerAllWidgets } from '@/components/widgets';
import { GeekNewsWidget } from '@/components/widgets/implementations/GeekNewsWidget/GeekNewsWidget';
import { TechStackWidget } from '@/components/widgets/implementations/TechStackWidget/TechStackWidget';
import { BigTechBlogWidget } from '@/components/widgets/implementations/BigTechBlogWidget/BigTechBlogWidget';
import { GitHubTrendingWidget } from '@/components/widgets/implementations/GitHubTrendingWidget/GitHubTrendingWidget';
import { ITNewsWidget } from '@/components/widgets/implementations/ITNewsWidget/ITNewsWidget';
import { WeatherWidget } from '@/components/widgets/implementations/WeatherWidget/WeatherWidget';
import { MarketWidget } from '@/components/widgets/implementations/StockWidget/MarketWidget';
import { AITrendWidget } from '@/components/widgets/implementations/AITrendWidget/AITrendWidget';

type ContentType = 'jobs' | 'blogs' | 'books' | 'courses';
type CategoryType = 'recommended' | 'trending' | 'latest' | 'following';
type LayoutType = 'grid' | 'list';

// 위젯 설정
const widgetConfigs = {
  weather: {
    id: 'weather-1',
    type: 'weather',
    title: '날씨',
    size: 'small' as const,
    order: 0,
    enabled: true,
    config: { location: '서울', units: 'metric' as const },
  },
  market: {
    id: 'market-1',
    type: 'market',
    title: '시장 전망',
    size: 'medium' as const,
    order: 1,
    enabled: true,
    config: { market: 'all' as const, showTrending: true },
  },
  aitrend: {
    id: 'aitrend-1',
    type: 'ai-trend',
    title: 'AI 트렌드',
    size: 'large' as const,
    order: 2,
    enabled: true,
    config: { sources: ['huggingface', 'github', 'news'] as const, limit: 5, showTabs: true },
  },
  geeknews: {
    id: 'geeknews-1',
    type: 'geeknews',
    title: 'GeekNews 트렌드',
    size: 'medium' as const,
    order: 3,
    enabled: true,
    config: { limit: 5 },
  },
  techstack: {
    id: 'techstack-1',
    type: 'techstack',
    title: '기술 스택 트렌드',
    size: 'medium' as const,
    order: 4,
    enabled: true,
    config: { category: 'frontend' as const, period: 'week' as const },
  },
  bigtech: {
    id: 'bigtech-1',
    type: 'bigtech-blog',
    title: '빅테크 기술 블로그',
    size: 'medium' as const,
    order: 5,
    enabled: true,
    config: { companies: ['kakao', 'naver', 'toss'] as const, limit: 4 },
  },
  github: {
    id: 'github-1',
    type: 'github-trending',
    title: 'GitHub 트렌딩',
    size: 'medium' as const,
    order: 6,
    enabled: true,
    config: { since: 'daily' as const, limit: 5 },
  },
  itnews: {
    id: 'itnews-1',
    type: 'itnews',
    title: 'IT 뉴스',
    size: 'medium' as const,
    order: 7,
    enabled: true,
    config: { sources: ['bloter', 'zdnet', 'itchosun'] as const, limit: 4 },
  },
};

export default function DiscoverPage() {
  const [contentType, setContentType] = React.useState<ContentType>('jobs');
  const [category, setCategory] = React.useState<CategoryType>('recommended');
  const [layout, setLayout] = React.useState<LayoutType>('grid');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<any>(null);

  // 위젯 등록
  React.useEffect(() => {
    registerAllWidgets();
  }, []);

  // Contents infinite query
  const {
    data: contentsData,
    isLoading,
    error,
    fetchNextPage: fetchNextContents,
    hasNextPage: hasNextContents,
    isFetchingNextPage: isFetchingNextContents
  } = useInfiniteDailyContents({
    page_size: 9, // 채용 3개 + 콘텐츠 9개 패턴에 맞춰 9개씩 로드
  });

  // Jobs infinite query
  const {
    data: jobsData,
    isLoading: jobsLoading,
    fetchNextPage: fetchNextJobs,
    hasNextPage: hasNextJobs,
    isFetchingNextPage: isFetchingNextJobs
  } = useInfiniteDailyJobs({
    page_size: 3, // 채용 3개 + 콘텐츠 9개 패턴에 맞춰 3개씩 로드
  });

  // Somoon Daily Content to DiscoverContentCardProps transformation
  const transformSomoonToCard = React.useCallback((content: SomoonDailyContent): DiscoverContentCardProps => {
    // Determine badge tone based on content_type
    const getBadgeTone = (type: string): 'default' | 'slate' | 'coral' | 'success' | 'warning' => {
      switch (type) {
        case 'blog':
          return 'coral';
        case 'book':
          return 'success';
        case 'course':
          return 'warning';
        case 'job':
          return 'slate';
        default:
          return 'default';
      }
    };

    // Safely extract summary with fallback
    const summary = content.analysis?.analysis_json?.긴글요약
      || content.analysis?.analysis_json?.요약
      || '상세 정보가 제공되지 않습니다.';

    return {
      contentId: content.id.toString(),
      title: content.title,
      summary: summary,
      thumbnailUrl: content.additional_info?.image_url || undefined,
      usePlainImg: true,
      sources: [{
        name: content.additional_info?.author || content.company_info?.name || '출처 정보 없음',
        href: content.url,
      }],
      postedAt: content.created_at,
      stats: {
        views: 0,
        likes: 0,
        bookmarks: 0,
      },
      badge: content.content_type_display,
      badgeTone: getBadgeTone(content.content_type),
      tags: content.tags || [],
      liked: false,
      bookmarked: false,
      href: content.url,
    };
  }, []);

  // Job to DiscoverContentCardProps transformation
  const transformJobToCard = React.useCallback((job: SomoonJobItem): DiscoverContentCardProps => {
    // Safely extract summary with fallback
    const summary = job.analysis?.analysis_json?.긴글요약
      || job.analysis?.analysis_json?.요약
      || '상세 정보가 제공되지 않습니다.';

    return {
      contentId: job.id.toString(),
      title: job.title,
      summary: summary,
      thumbnailUrl: job.company_info?.logo_url || undefined,
      usePlainImg: true,
      sources: [{
        name: job.company_info?.name || job.company || '회사 정보 없음',
        href: job.url,
      }],
      postedAt: job.created_at,
      stats: {
        views: 0,
        likes: 0,
        bookmarks: 0,
      },
      badge: '채용공고',
      badgeTone: 'slate',
      tags: job.tags || [],
      liked: false,
      bookmarked: false,
      href: job.url,
    };
  }, []);

  // Transform and filter content cards
  const baseContentCards = React.useMemo(() => {
    const allContents = (contentsData?.pages as SomoonPaginatedResponse<SomoonDailyContent>[] | undefined)?.flatMap(page => page.results) || [];
    if (allContents.length === 0) return [];

    let cards = allContents.map(transformSomoonToCard);

    // Apply contentType filter
    cards = cards.filter(card => {
      const category = card.badge?.toLowerCase() || '';
      switch (contentType) {
        case 'jobs':
          return category.includes('job') || category.includes('채용');
        case 'blogs':
          return category.includes('blog') || category.includes('블로그');
        case 'books':
          return category.includes('book') || category.includes('도서');
        case 'courses':
          return category.includes('course') || category.includes('강의');
        default:
          return true;
      }
    });

    // Sort by timestamp (newest first)
    return cards.sort((a, b) => {
      const dateA = new Date(a.postedAt || 0).getTime();
      const dateB = new Date(b.postedAt || 0).getTime();
      return dateB - dateA;
    });
  }, [contentsData, contentType, transformSomoonToCard]);

  // Merge jobs and contents: 5 jobs + 10 contents pattern
  const mergedContentCards = React.useMemo(() => {
    const allJobs = (jobsData?.pages as SomoonPaginatedResponse<SomoonJobItem>[] | undefined)?.flatMap(page => page.results) || [];
    if (baseContentCards.length === 0 && allJobs.length === 0) return [];

    let contents = baseContentCards; // Already filtered by contentType
    let jobs = allJobs.map(transformJobToCard);

    // Apply category filtering
    const applyFilter = (items: DiscoverContentCardProps[]) => {
      switch (category) {
        case 'recommended':
          // For recommended, show all items (no filter)
          return items;
        case 'trending':
          // For trending, sort by views (though we don't have real view data, we'll sort by date as fallback)
          return [...items].sort((a, b) => {
            const viewsA = a.stats?.views || 0;
            const viewsB = b.stats?.views || 0;
            return viewsB - viewsA;
          });
        case 'latest':
          // For latest, sort by date (newest first)
          return [...items].sort((a, b) => {
            const dateA = new Date(a.postedAt || 0).getTime();
            const dateB = new Date(b.postedAt || 0).getTime();
            return dateB - dateA;
          });
        case 'following':
          // For following, filter items from followed sources (we don't have this data, so show empty for now)
          // In a real scenario, you would check if the source/author is followed
          return [];
        default:
          return items;
      }
    };

    contents = applyFilter(contents);
    jobs = applyFilter(jobs);

    const merged: DiscoverContentCardProps[] = [];
    let contentIndex = 0;
    let jobIndex = 0;

    // Repeat pattern: 3 jobs + 9 contents
    while (contentIndex < contents.length || jobIndex < jobs.length) {
      // Add 3 jobs
      for (let i = 0; i < 3 && jobIndex < jobs.length; i++) {
        merged.push(jobs[jobIndex++]);
      }

      // Add 9 contents
      for (let i = 0; i < 9 && contentIndex < contents.length; i++) {
        merged.push(contents[contentIndex++]);
      }
    }

    return merged;
  }, [baseContentCards, jobsData, transformJobToCard, category]);

  // Handle card click to open drawer
  const handleCardClick = (card: any) => {
    setSelectedContent({
      id: card.contentId || 'unknown',
      title: card.title,
      summary: card.summary || '',
      imageUrl: card.thumbnailUrl,
      externalUrl: card.href || '#',
    });
    setDrawerOpen(true);
  };

  // Add onClick handler to all cards
  const contentCardsWithHandler = React.useMemo(() => {
    return mergedContentCards.map((card) => ({
      ...card,
      onCardClick: () => handleCardClick(card),
    }));
  }, [mergedContentCards]);

  // LoadMore handler
  const handleLoadMore = () => {
    // Fetch both APIs in parallel
    if (hasNextContents && !isFetchingNextContents) {
      fetchNextContents();
    }
    if (hasNextJobs && !isFetchingNextJobs) {
      fetchNextJobs();
    }
  };

  const hasMoreData = hasNextContents || hasNextJobs;
  const isLoadingMore = isFetchingNextContents || isFetchingNextJobs;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Content */}
      <main className="lg:col-span-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="pt-2 md:pt-16 pb-4 md:pb-8">
            <div className="flex items-center justify-between">
              {/* 타이틀 - PC에서만 표시 (모바일은 AppLayout 헤더에 표시) */}
              <div className="hidden md:flex items-center gap-3">
                <Sparkles className="h-10 w-10 text-slate-700" />
                <h1 className="text-3xl font-bold text-slate-900">Discover</h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                  <Button
                    variant={layout === 'grid' ? 'solid' : 'ghost'}
                    size="sm"
                    onClick={() => setLayout('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={layout === 'list' ? 'solid' : 'ghost'}
                    size="sm"
                    onClick={() => setLayout('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <DiscoverCategoryTabs
            activeId={category}
            onChange={(id) => setCategory(id as CategoryType)}
            showCounts={false}
          />

          {/* Content Type Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">콘텐츠 타입</h3>
            <div className="flex gap-2">
              <Chip
                variant={contentType === 'jobs' ? 'selected' : 'default'}
                onClick={() => setContentType('jobs')}
              >
                채용공고
              </Chip>
              <Chip
                variant={contentType === 'blogs' ? 'selected' : 'default'}
                onClick={() => setContentType('blogs')}
              >
                블로그
              </Chip>
              <Chip
                variant={contentType === 'books' ? 'selected' : 'default'}
                onClick={() => setContentType('books')}
              >
                도서
              </Chip>
              <Chip
                variant={contentType === 'courses' ? 'selected' : 'default'}
                onClick={() => setContentType('courses')}
              >
                강의
              </Chip>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                콘텐츠를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </p>
            </div>
          )}

          {/* Loading State */}
          {(isLoading || jobsLoading) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-600">콘텐츠 로딩 중...</div>
            </div>
          )}

          {/* Empty State */}
          {!(isLoading || jobsLoading) && contentCardsWithHandler.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
              <p className="text-slate-600">
                {category === 'following'
                  ? '팔로우한 사용자의 콘텐츠가 없습니다. 관심있는 사용자를 팔로우해보세요.'
                  : '표시할 콘텐츠가 없습니다.'}
              </p>
            </div>
          )}

          {/* Content Feed */}
          {!(isLoading || jobsLoading) && contentCardsWithHandler.length > 0 && (
            <>
              <DiscoverFeedSection
                items={contentCardsWithHandler}
                layout={layout}
              />

              {/* Load More */}
              <LoadMore
                hasMore={hasMoreData}
                loading={isLoadingMore}
                onLoadMore={handleLoadMore}
              />
            </>
          )}
        </div>
      </main>

      {/* Right Sidebar - Widgets */}
      <aside className="lg:col-span-4">
        <div className="space-y-4 pt-16">
          {/* 날씨 */}
          <WeatherWidget config={widgetConfigs.weather} />

          {/* 시장 전망 (Perplexity 스타일) */}
          <MarketWidget config={widgetConfigs.market.config} />

          {/* AI 트렌드 */}
          <AITrendWidget config={widgetConfigs.aitrend} />

          {/* GeekNews 트렌드 */}
          <GeekNewsWidget config={widgetConfigs.geeknews} />

          {/* 기술 스택 트렌드 */}
          <TechStackWidget config={widgetConfigs.techstack} />

          {/* 빅테크 기술 블로그 */}
          <BigTechBlogWidget config={widgetConfigs.bigtech} />

          {/* GitHub 트렌딩 */}
          <GitHubTrendingWidget config={widgetConfigs.github} />

          {/* IT 뉴스 */}
          <ITNewsWidget config={widgetConfigs.itnews} />
        </div>
      </aside>

      {/* Detail Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selectedContent && (
          <div className="h-full flex flex-col">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedContent.title}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="닫기"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Image */}
              {selectedContent.imageUrl && (
                <div className="mb-6">
                  <img
                    src={selectedContent.imageUrl}
                    alt={selectedContent.title}
                    className="w-full rounded-lg object-cover max-h-[400px]"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl font-bold text-slate-900 mb-4">
                {selectedContent.title}
              </h1>

              {/* Summary */}
              <div className="prose prose-slate max-w-none mb-6">
                <p className="text-slate-700 leading-relaxed">
                  {selectedContent.summary}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3 pt-6 border-t border-slate-200">
                <Button
                  variant="solid"
                  onClick={() => window.open(selectedContent.externalUrl, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  외부 사이트에서 보기
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
