'use client';

import * as React from 'react';
import { DiscoverHeroCard } from '@/components/ui/discover-hero-card';
import { DiscoverContentCard } from '@/components/ui/discover-content-card';
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
import {
  mockDiscoverResponse,
  transformJobsToContentCards,
  transformBlogsToContentCards,
  transformBooksToContentCards,
  transformCoursesToContentCards,
  mockJobMarketTrends,
} from '@/lib/data/discover-mock';

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

  // Transform mock data to content cards (base data without tag filtering)
  const baseContentCards = React.useMemo(() => {
    // ForYou가 꺼져있을 때: 최근 3일간의 크롤링 데이터만 표시
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // 원본 데이터 필터링 (ForYou가 아닐 때만 3일 필터 적용)
    const filteredJobs = isForYou
      ? mockDiscoverResponse.jobs
      : mockDiscoverResponse.jobs.filter(job => {
          const jobDate = new Date(job.createdAt);
          return jobDate >= threeDaysAgo;
        });

    const filteredBlogs = isForYou
      ? mockDiscoverResponse.blogs
      : mockDiscoverResponse.blogs.filter(blog => {
          if (!blog.createdAt) return false;
          const blogDate = new Date(blog.createdAt);
          return blogDate >= threeDaysAgo;
        });

    const filteredBooks = isForYou
      ? mockDiscoverResponse.books
      : mockDiscoverResponse.books.filter(book => {
          if (!book.createdAt) return false;
          const bookDate = new Date(book.createdAt);
          return bookDate >= threeDaysAgo;
        });

    const filteredCourses = isForYou
      ? mockDiscoverResponse.courses
      : mockDiscoverResponse.courses.filter(course => {
          if (!course.createdAt) return false;
          const courseDate = new Date(course.createdAt);
          return courseDate >= threeDaysAgo;
        });

    // Transform to content cards
    const jobs = transformJobsToContentCards(filteredJobs);
    const blogs = transformBlogsToContentCards(filteredBlogs);
    const books = transformBooksToContentCards(filteredBooks);
    const courses = transformCoursesToContentCards(filteredCourses);

    switch (contentType) {
      case 'jobs':
        return jobs;
      case 'blogs':
        return blogs;
      case 'books':
        return books;
      case 'courses':
        return courses;
      default:
        return [...jobs, ...blogs, ...books, ...courses];
    }
  }, [contentType, isForYou]);

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

  // Get hero content (first blog with high score)
  const heroContent = React.useMemo(() => {
    const topBlog = mockDiscoverResponse.blogs[0];
    if (topBlog) {
      return {
        title: topBlog.title,
        summary: topBlog.summary.split('\n\n')[0],
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
        href: topBlog.url,
      };
    }
    return null;
  }, []);

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

              {/* Content Feed */}
              <DiscoverFeedSection
                items={allContentCardsWithHandler}
                layout={layout}
                pagination={{
                  hasMore: true,
                  loading: false,
                  onLoadMore: () => {
                    console.log('Load more...');
                  },
                }}
              />
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
                        console.log('Like:', selectedContent.id);
                      }}
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
                        console.log('Bookmark:', selectedContent.id);
                      }}
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
