'use client';

import * as React from 'react';
import { DiscoverHeroCard } from '@/components/ui/discover-hero-card';
import { DiscoverContentCard, DiscoverContentCardProps } from '@/components/ui/discover-content-card';
import { DiscoverFeedSection } from '@/components/ui/discover-feed-section';
import { Chip } from '@/components/ui/chip';
import { cn } from '@/lib/utils';
import { TagBar } from '@/components/ui/tag-bar';
import { InterestSelectorPanel } from '@/components/ui/interest-selector-panel';
import { JobMarketTrendCard } from '@/components/ui/job-market-trend-card';
import { FilterGroup, FilterSection } from '@/components/ui/filter-group';
import { SortControl, SortValue } from '@/components/ui/sort-control';
import { Button } from '@/components/ui/button';
import { Settings2, Grid3x3, List, TrendingUp, Flame, Clock, Users, Sparkles, Heart, X, ExternalLink, Bookmark } from 'lucide-react';
import { useDiscoverFeeds, useRecommendedFeeds, useLikeFeed, useUnlikeFeed, useBookmarkFeed, useUnbookmarkFeed, type DiscoverFeed } from '@/lib/api';
import { mockJobMarketTrends } from '@/lib/data/discover-mock';

type ContentType = 'all' | 'jobs' | 'blogs' | 'books' | 'courses';
type LayoutType = 'grid' | 'list';

export default function DiscoverPage() {
  const [isForYou, setIsForYou] = React.useState(false);
  const [selectedInterests, setSelectedInterests] = React.useState<string[]>([]);
  const [contentType, setContentType] = React.useState<ContentType>('all');
  const [layout, setLayout] = React.useState<LayoutType>('grid');
  const [sortBy, setSortBy] = React.useState<SortValue>('trending');
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [filterValues, setFilterValues] = React.useState<Record<string, string | string[] | boolean>>({
    contentType: [],
    difficulty: '',
    hasBookmark: false,
  });

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<any>(null);

  // API 훅 사용
  const discoverQuery = useDiscoverFeeds(
    { page: 1, pageSize: 20 },
    false,
    { enabled: !isForYou }
  );

  const recommendedQuery = useRecommendedFeeds(
    { page: 1, pageSize: 20 },
    { enabled: isForYou }
  );

  // 현재 활성화된 쿼리 선택
  const activeQuery = isForYou ? recommendedQuery : discoverQuery;
  const { data: feedResponse, isLoading, error } = activeQuery;

  // Mutation 훅 초기화
  const likeMutation = useLikeFeed();
  const unlikeMutation = useUnlikeFeed();
  const bookmarkMutation = useBookmarkFeed();
  const unbookmarkMutation = useUnbookmarkFeed();

  // API 응답을 DiscoverContentCardProps 형식으로 변환
  const transformFeedToCard = React.useCallback((feed: DiscoverFeed): DiscoverContentCardProps => {
    return {
      contentId: feed.id,
      title: feed.title,
      summary: feed.description,
      thumbnailUrl: feed.imageUrl,
      sources: feed.author ? [{
        name: feed.author.name,
        href: `#`,
      }] : undefined,
      postedAt: feed.createdAt,
      stats: {
        likes: feed.stats.likes,
        views: feed.stats.views,
        bookmarks: 0, // API 응답에 없으면 기본값
      },
      badge: feed.category,
      badgeTone: 'coral',
      tags: feed.tags,
      liked: false,
      bookmarked: false,
    };
  }, []);

  // Transform API data to content cards (base data without tag filtering)
  const baseContentCards = React.useMemo(() => {
    if (!feedResponse?.feeds) return [];

    // API 응답을 카드 형식으로 변환
    const allCards = feedResponse.feeds.map(transformFeedToCard);

    // contentType 필터링 적용
    if (contentType === 'all') {
      return allCards;
    }

    // 카테고리별 필터링
    return allCards.filter(card => {
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
  }, [feedResponse, contentType, transformFeedToCard]);

  // Extract all unique tags from base content
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    baseContentCards.forEach((card) => {
      card.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [baseContentCards]);

  // Filtered content cards based on selected tags
  const allContentCards = React.useMemo(() => {
    if (selectedTags.length > 0) {
      return baseContentCards.filter((card) =>
        card.tags && card.tags.some((tag) => selectedTags.includes(tag))
      );
    }
    return baseContentCards;
  }, [baseContentCards, selectedTags]);

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Get hero content (첫 번째 피드를 히어로로 사용)
  const heroContent = React.useMemo(() => {
    if (!feedResponse?.feeds || feedResponse.feeds.length === 0) return null;

    const topFeed = feedResponse.feeds[0];
    return {
      title: topFeed.title,
      summary: topFeed.description.split('\n\n')[0] || topFeed.description.substring(0, 200),
      imageUrl: topFeed.imageUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      href: '#', // 추후 실제 링크로 변경
    };
  }, [feedResponse]);

  // Interest categories
  const interestCategories = [
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'ai-ml', label: 'AI/ML' },
    { id: 'design', label: 'Design' },
    { id: 'management', label: 'Management' },
    { id: 'career', label: 'Career' },
  ];

  // Mock persona data
  const mockPersona = {
    id: 523,
    name: '김현우',
    role: '프론트엔드 개발팀 리더로서 팀을 이끌고 프로젝트의 전반적인 기술 방향성을 설정하며, 팀원들의 기술 성장을 지원합니다.',
    salary: '연봉 6,000만 원에서 8,000만 원',
    skills: [
      { skillName: 'JavaScript', proficiency: '고급' },
      { skillName: 'React', proficiency: '고급' },
      { skillName: 'TypeScript', proficiency: '중급' },
      { skillName: 'Next.js', proficiency: '중급' },
      { skillName: '프로젝트 매니징', proficiency: '중급' },
    ],
    location: '서울, 판교',
    position: '시니어 레벨',
    jobTitle: '프론트엔드 개발팀 리더',
    companyType: '중견 IT 기업 또는 스타트업',
    matchReason: '고알레에서 프론트엔드 개발자로서의 경험을 바탕으로, 팀 리더로서의 역할을 맡아 프로젝트 매니징 능력을 발휘할 수 있습니다.',
    currentProject1: '대규모 웹 애플리케이션의 프론트엔드 아키텍처 설계 및 구현',
    currentProject2: '팀원들의 코드 리뷰 및 기술 교육 세션 주도',
    yearsOfExperience: 5,
  };

  // Filter sections
  const filterSections: FilterSection[] = [
    {
      id: 'contentType',
      title: '콘텐츠 타입',
      type: 'checkbox',
      options: [
        { id: 'jobs', label: '채용공고' },
        { id: 'blogs', label: '블로그' },
        { id: 'books', label: '도서' },
        { id: 'courses', label: '강의' },
      ],
    },
    {
      id: 'difficulty',
      title: '난이도',
      type: 'select',
      options: [
        { id: 'beginner', label: '초급' },
        { id: 'intermediate', label: '중급' },
        { id: 'advanced', label: '고급' },
      ],
    },
    {
      id: 'preferences',
      title: '기본 설정',
      type: 'switch',
      options: [
        { id: 'hasBookmark', label: '북마크한 항목만' },
      ],
    },
  ];

  const handleFilterChange = (sectionId: string, value: string | string[] | boolean) => {
    setFilterValues((prev) => ({
      ...prev,
      [sectionId]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilterValues({
      contentType: [],
      difficulty: '',
      hasBookmark: false,
    });
  };

  // Handle card click to open drawer
  const handleCardClick = (card: any) => {
    setSelectedContent({
      id: card.contentId || 'unknown',
      title: card.title,
      summary: card.summary || '',
      imageUrl: card.thumbnailUrl,
      externalUrl: card.href || '#',
      likes: card.stats?.likes || 0,
      isLiked: card.liked || false,
      isBookmarked: card.bookmarked || false,
    });
    setDrawerOpen(true);
  };

  // Add onClick handler to all cards
  const allContentCardsWithHandler = React.useMemo(() => {
    return allContentCards.map((card) => ({
      ...card,
      onCardClick: () => handleCardClick(card),
    }));
  }, [allContentCards]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="pt-16 pb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-10 w-10 text-slate-700" />
                      <h1 className="text-3xl font-bold text-slate-900">Discover</h1>
                    </div>

                    {/* For You Button */}
                    <Chip
                      variant={isForYou ? 'selected' : 'default'}
                      onClick={() => setIsForYou(!isForYou)}
                    >
                      <Heart className="h-4 w-4" />
                      For You
                    </Chip>
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

              {/* Hero Card */}
              {heroContent && isForYou && (
                <DiscoverHeroCard {...heroContent} />
              )}

              {/* For You Section */}
              {isForYou && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">당신을 위한 추천</h2>
                    <p className="text-sm text-slate-600">
                      {mockPersona.name}님의 페르소나 기반 추천
                    </p>
                  </div>

                  {/* Persona View Card - Horizontal */}
                  <div className="bg-gradient-to-br from-coral-50 to-orange-50 rounded-xl p-6 border border-coral-200">
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Heart className="h-5 w-5 text-coral-500" />
                          <h3 className="text-lg font-semibold text-slate-900">
                            {mockPersona.jobTitle}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">
                          {mockPersona.role}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {mockPersona.skills.slice(0, 3).map((skill) => (
                            <Chip key={skill.skillName} variant="coral" className="text-xs">
                              {skill.skillName}
                            </Chip>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">매칭률</p>
                        <p className="text-2xl font-bold text-coral-500">87%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">태그로 필터링</h3>
                  <TagBar
                    tags={allTags}
                    activeTags={selectedTags}
                    onToggle={handleTagToggle}
                    scrollable
                  />
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-200" />

              {/* 에러 상태 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                  </p>
                </div>
              )}

              {/* 로딩 상태 */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-slate-600">로딩 중...</div>
                </div>
              )}

              {/* 데이터가 없을 때 */}
              {!isLoading && !error && allContentCardsWithHandler.length === 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                  <p className="text-slate-600">표시할 콘텐츠가 없습니다.</p>
                </div>
              )}

              {/* Content Feed */}
              {!isLoading && !error && allContentCardsWithHandler.length > 0 && (
                <DiscoverFeedSection
                  items={allContentCardsWithHandler}
                  layout={layout}
                  pagination={{
                    hasMore: feedResponse?.hasNext || false,
                    loading: isLoading,
                    onLoadMore: () => {
                      // TODO: 페이지네이션 구현 필요
                      console.log('Load more...');
                    },
                  }}
                />
              )}
            </div>
          </main>

          {/* Right Sidebar - Trends */}
          <aside className="lg:col-span-3">
            <div className="space-y-6 pt-16">
              {/* Job Market Trends */}
              <JobMarketTrendCard trends={mockJobMarketTrends} />
            </div>
          </aside>

          {/* Detail Drawer - Community Style */}
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
                  {/* 이미지 */}
                  {selectedContent.imageUrl && (
                    <div className="mb-6">
                      <img
                        src={selectedContent.imageUrl}
                        alt={selectedContent.title}
                        className="w-full rounded-lg object-cover max-h-[400px]"
                      />
                    </div>
                  )}

                  {/* 제목 */}
                  <h1 className="text-2xl font-bold text-slate-900 mb-4">
                    {selectedContent.title}
                  </h1>

                  {/* 요약 정보 */}
                  <div className="prose prose-slate max-w-none mb-6">
                    <p className="text-slate-700 leading-relaxed">
                      {selectedContent.summary}
                    </p>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-200">
                    {/* 외부 링크 버튼 */}
                    <Button
                      variant="solid"
                      onClick={() => window.open(selectedContent.externalUrl, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      외부 사이트에서 보기
                    </Button>

                    {/* 좋아요 버튼 */}
                    <Button
                      variant={selectedContent.isLiked ? 'solid' : 'outline'}
                      onClick={() => {
                        if (selectedContent.isLiked) {
                          unlikeMutation.mutate(selectedContent.id);
                        } else {
                          likeMutation.mutate(selectedContent.id);
                        }
                        // Optimistic update: 로컬 상태 즉시 업데이트
                        setSelectedContent((prev: any) => ({
                          ...prev,
                          isLiked: !prev.isLiked,
                          likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
                        }));
                      }}
                      disabled={likeMutation.isPending || unlikeMutation.isPending}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          selectedContent.isLiked && "fill-current"
                        )}
                      />
                    </Button>

                    {/* 북마크 버튼 */}
                    <Button
                      variant={selectedContent.isBookmarked ? 'solid' : 'outline'}
                      onClick={() => {
                        if (selectedContent.isBookmarked) {
                          unbookmarkMutation.mutate(selectedContent.id);
                        } else {
                          bookmarkMutation.mutate(selectedContent.id);
                        }
                        // Optimistic update: 로컬 상태 즉시 업데이트
                        setSelectedContent((prev: any) => ({
                          ...prev,
                          isBookmarked: !prev.isBookmarked,
                        }));
                      }}
                      disabled={bookmarkMutation.isPending || unbookmarkMutation.isPending}
                    >
                      <Bookmark
                        className={cn(
                          "h-4 w-4",
                          selectedContent.isBookmarked && "fill-current"
                        )}
                      />
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
