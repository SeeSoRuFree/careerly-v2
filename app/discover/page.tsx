'use client';

import * as React from 'react';
import { DiscoverHeroCard } from '@/components/ui/discover-hero-card';
import { DiscoverContentCard } from '@/components/ui/discover-content-card';
import { DiscoverFeedSection } from '@/components/ui/discover-feed-section';
import { Chip } from '@/components/ui/chip';
import { InterestSelectorPanel } from '@/components/ui/interest-selector-panel';
import { PersonaViewCard } from '@/components/ui/persona-view-card';
import { MarketAssetMiniCard } from '@/components/ui/market-asset-mini-card';
import { TodayJobsPanel } from '@/components/ui/today-jobs-panel';
import { JobMarketTrendCard } from '@/components/ui/job-market-trend-card';
import { FilterGroup, FilterSection } from '@/components/ui/filter-group';
import { SortControl, SortValue } from '@/components/ui/sort-control';
import { Button } from '@/components/ui/button';
import { Settings2, Grid3x3, List, TrendingUp, Flame, Clock, Users, Sparkles } from 'lucide-react';
import {
  mockDiscoverResponse,
  transformJobsToContentCards,
  transformBlogsToContentCards,
  transformBooksToContentCards,
  transformCoursesToContentCards,
  mockJobMarketTrends,
  mockTodayJobs,
} from '@/lib/data/discover-mock';

type ContentType = 'all' | 'jobs' | 'blogs' | 'books' | 'courses';
type LayoutType = 'grid' | 'list';

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = React.useState('recommended');
  const [selectedInterests, setSelectedInterests] = React.useState<string[]>([]);
  const [contentType, setContentType] = React.useState<ContentType>('all');
  const [layout, setLayout] = React.useState<LayoutType>('grid');
  const [sortBy, setSortBy] = React.useState<SortValue>('trending');
  const [showFilters, setShowFilters] = React.useState(false);
  const [filterValues, setFilterValues] = React.useState<Record<string, string | string[] | boolean>>({
    contentType: [],
    difficulty: '',
    hasBookmark: false,
  });

  // Transform mock data to content cards
  const allContentCards = React.useMemo(() => {
    const jobs = transformJobsToContentCards(mockDiscoverResponse.jobs);
    const blogs = transformBlogsToContentCards(mockDiscoverResponse.blogs);
    const books = transformBooksToContentCards(mockDiscoverResponse.books);
    const courses = transformCoursesToContentCards(mockDiscoverResponse.courses);

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
  }, [contentType]);

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

                    {/* Category Chips */}
                    <div className="flex items-center gap-2">
                      <Chip
                        variant={activeTab === 'recommended' ? 'selected' : 'default'}
                        onClick={() => setActiveTab('recommended')}
                      >
                        <TrendingUp className="h-4 w-4" />
                        추천
                      </Chip>
                      <Chip
                        variant={activeTab === 'trending' ? 'selected' : 'default'}
                        onClick={() => setActiveTab('trending')}
                      >
                        <Flame className="h-4 w-4" />
                        인기
                      </Chip>
                      <Chip
                        variant={activeTab === 'latest' ? 'selected' : 'default'}
                        onClick={() => setActiveTab('latest')}
                      >
                        <Clock className="h-4 w-4" />
                        최신
                      </Chip>
                      <Chip
                        variant={activeTab === 'following' ? 'selected' : 'default'}
                        onClick={() => setActiveTab('following')}
                      >
                        <Users className="h-4 w-4" />
                        팔로잉
                      </Chip>
                    </div>
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
              {heroContent && activeTab === 'recommended' && (
                <DiscoverHeroCard {...heroContent} />
              )}

              {/* Divider */}
              <div className="border-t border-slate-200" />

              {/* Content Feed */}
              <DiscoverFeedSection
                items={allContentCards}
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
              {/* Persona View */}
              <PersonaViewCard
                persona={mockPersona}
                onViewDetail={() => {
                  console.log('View persona detail');
                }}
                onEdit={() => {
                  console.log('Edit persona');
                }}
              />

              {/* Today's Jobs */}
              <TodayJobsPanel
                companies={mockTodayJobs}
                maxItems={5}
              />

              {/* Job Market Trends */}
              <JobMarketTrendCard trends={mockJobMarketTrends} />
            </div>
          </aside>
    </div>
  );
}
