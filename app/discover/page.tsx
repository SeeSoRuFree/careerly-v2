'use client';

import * as React from 'react';
import { DiscoverMinimalCard, DiscoverMinimalCardProps } from '@/components/ui/discover-minimal-card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Heart, X, ExternalLink, Bookmark, Search, TrendingUp, Eye, MessageCircle, Send, BadgeCheck, Plus, Lock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

// Mock 데이터 import (로컬 프로토타이핑용)
import {
  mockDiscoverResponse,
  mockSourceStats,
  mockSourcesByCategory,
  mockDailyJobData,
  mockWeeklyStats,
  mockRecentlyUpdatedCompanies,
  mockAllCompanies,
  COMPANY_REGISTRATION_FORM_URL,
} from '@/lib/data/discover-mock';
import { JobRowItemProps } from '@/components/ui/job-row-item';
import { DailySummaryCard } from '@/components/ui/daily-summary-card';

type ContentType = 'jobs' | 'blogs' | 'books' | 'courses';

// 날짜 탭 포맷팅 함수
function formatDateTab(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) return '오늘';
  if (isSameDay(date, yesterday)) return '어제';
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 최근 7일 날짜 목록 생성 (최신순)
const generateLast7Days = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const availableDates = generateLast7Days();

// 블로그 AI 카테고리 타입 (5개 카테고리)
type BlogAICategory = 'ai-dev' | 'ai-design' | 'ai-biz' | 'ai-general' | 'other';

// 도서/강의용 AI 카테고리 타입 (전체 포함)
type ContentAICategory = 'all' | 'ai-dev' | 'ai-design' | 'ai-biz' | 'ai-general' | 'other';

// 블로그 카테고리 설정
const blogCategoryConfig: Record<BlogAICategory, { label: string; icon: string; bgClass: string; textClass: string; borderClass: string }> = {
  'ai-dev': { label: 'AI & Dev', icon: '🤖', bgClass: 'bg-purple-100', textClass: 'text-purple-700', borderClass: 'border-purple-300' },
  'ai-design': { label: 'AI & Design', icon: '🎨', bgClass: 'bg-pink-100', textClass: 'text-pink-700', borderClass: 'border-pink-300' },
  'ai-biz': { label: 'AI & Biz', icon: '💼', bgClass: 'bg-amber-100', textClass: 'text-amber-700', borderClass: 'border-amber-300' },
  'ai-general': { label: 'AI 일반', icon: '✨', bgClass: 'bg-teal-100', textClass: 'text-teal-700', borderClass: 'border-teal-300' },
  'other': { label: '기타', icon: '📝', bgClass: 'bg-slate-200', textClass: 'text-slate-700', borderClass: 'border-slate-300' },
};

// 도서/강의용 카테고리 설정 (전체 포함)
const contentCategoryConfig: Record<ContentAICategory, { label: string; icon: string; bgClass: string; textClass: string; borderClass: string }> = {
  'all': { label: '전체', icon: '📋', bgClass: 'bg-slate-100', textClass: 'text-slate-700', borderClass: 'border-slate-300' },
  'ai-dev': { label: 'AI & Dev', icon: '🤖', bgClass: 'bg-purple-100', textClass: 'text-purple-700', borderClass: 'border-purple-300' },
  'ai-design': { label: 'AI & Design', icon: '🎨', bgClass: 'bg-pink-100', textClass: 'text-pink-700', borderClass: 'border-pink-300' },
  'ai-biz': { label: 'AI & Biz', icon: '💼', bgClass: 'bg-amber-100', textClass: 'text-amber-700', borderClass: 'border-amber-300' },
  'ai-general': { label: 'AI 일반', icon: '✨', bgClass: 'bg-teal-100', textClass: 'text-teal-700', borderClass: 'border-teal-300' },
  'other': { label: '기타', icon: '📝', bgClass: 'bg-slate-200', textClass: 'text-slate-700', borderClass: 'border-slate-300' },
};

export default function DiscoverPage() {
  const [contentType, setContentType] = React.useState<ContentType>('jobs');
  const [selectedDate, setSelectedDate] = React.useState<string>(availableDates[0] || '2025-12-07');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [companySearchQuery, setCompanySearchQuery] = React.useState('');

  // 블로그 탭용 상태 (AI & Dev가 기본 선택)
  const [selectedBlogCategory, setSelectedBlogCategory] = React.useState<BlogAICategory>('ai-dev');

  // 도서/강의 탭용 상태 (전체가 기본 선택)
  const [selectedBookCategory, setSelectedBookCategory] = React.useState<ContentAICategory>('all');
  const [selectedCourseCategory, setSelectedCourseCategory] = React.useState<ContentAICategory>('all');

  // 기업 검색 결과 필터링
  const filteredCompanies = React.useMemo(() => {
    if (!companySearchQuery.trim()) return [];
    const query = companySearchQuery.toLowerCase();
    return mockAllCompanies.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    ).slice(0, 8); // 최대 8개 결과
  }, [companySearchQuery]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<{
    id: string;
    title: string;
    summary: string;
    externalUrl?: string;
    imageUrl?: string;
    companyName?: string;
    companyLogo?: string;
    isLiked: boolean;
    isBookmarked: boolean;
    views: number;
    likes: number;
    comments: Array<{
      id: string;
      userName: string;
      userImage?: string;
      userHeadline?: string;
      content: string;
      createdAt: string;
      likeCount: number;
      liked: boolean;
    }>;
  } | null>(null);
  const [newComment, setNewComment] = React.useState('');

  // 로컬 Mock 데이터 사용
  const isLoading = false;
  const error = null;

  // Mock 데이터를 API 응답 형태로 변환
  const feedResponse = React.useMemo(() => {
    const allFeeds = [
      ...mockDiscoverResponse.jobs.map((job, index) => ({
        id: `job-${job.id}`,
        title: job.title,
        description: job.summary,
        imageUrl: job.company.image,
        author: { name: job.company.title },
        createdAt: job.createdAt,
        stats: { likes: index * 10, views: index * 100 },
        category: '채용공고',
        tags: ['채용', '커리어', 'IT', '개발자'],
      })),
      ...mockDiscoverResponse.blogs
        .slice() // 원본 보호
        .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime()) // 최신순 정렬
        .map((blog, index) => ({
        id: `blog-${blog.id}`,
        title: blog.title,
        description: blog.summary,
        imageUrl: blog.company.image, // 회사 로고 (thumbnailUrl로 사용)
        blogMetaImage: blog.imageUrl, // 블로그 메타 이미지 (실제 포스트 이미지)
        author: { name: blog.company.title },
        createdAt: blog.createdAt || new Date().toISOString(),
        publishedAt: blog.publishedAt || blog.createdAt || new Date().toISOString(),
        stats: { likes: 50 + index * 15, views: 500 + index * 250 },
        category: '블로그',
        tags: ['기술블로그', '개발', '인사이트', 'AI', '성장'],
        aiScore: blog.aiScore || 0,
        aiCategory: blog.aiCategory || 'other', // AI 카테고리 추가
      })),
      ...mockDiscoverResponse.books.map((book, index) => ({
        id: `book-${book.id}`,
        title: book.title,
        description: book.summary,
        imageUrl: book.imageUrl,
        author: { name: book.company.title, imageUrl: book.company.image },
        createdAt: book.createdAt || new Date().toISOString(),
        stats: { likes: 80 + index * 25, views: 800 + index * 350 },
        category: '도서',
        tags: ['도서', '학습', '리더십', '프로그래밍', 'React'],
      })),
      ...mockDiscoverResponse.courses.map((course, index) => ({
        id: `course-${course.id}`,
        title: course.title,
        description: course.summary,
        imageUrl: course.imageUrl,
        author: { name: course.company.title, imageUrl: course.company.image },
        createdAt: course.createdAt || new Date().toISOString(),
        stats: { likes: 60 + index * 20, views: 600 + index * 300 },
        category: '강의',
        tags: ['온라인강의', '리더십', '매니지먼트', '커리어', '성장'],
      })),
    ];

    return {
      feeds: allFeeds,
      hasNext: false,
      total: allFeeds.length,
    };
  }, []);

  // Like/Bookmark 동작을 로컬 상태로만 처리
  const [localLikes, setLocalLikes] = React.useState<Record<string, boolean>>({});
  const [localBookmarks, setLocalBookmarks] = React.useState<Record<string, boolean>>({});

  const likeMutation = {
    mutate: (id: string) => setLocalLikes(prev => ({ ...prev, [id]: true })),
    isPending: false,
  };

  const unlikeMutation = {
    mutate: (id: string) => setLocalLikes(prev => ({ ...prev, [id]: false })),
    isPending: false,
  };

  const bookmarkMutation = {
    mutate: (id: string) => setLocalBookmarks(prev => ({ ...prev, [id]: true })),
    isPending: false,
  };

  const unbookmarkMutation = {
    mutate: (id: string) => setLocalBookmarks(prev => ({ ...prev, [id]: false })),
    isPending: false,
  };

  // API 응답을 DiscoverMinimalCardProps 형식으로 변환 (블로그용 필드 포함)
  const transformFeedToCard = React.useCallback((feed: any): DiscoverMinimalCardProps & { aiScore?: number; aiCategory?: string; publishedAt?: string; blogMetaImage?: string } => {
    return {
      contentId: feed.id,
      title: feed.title,
      summary: feed.description,
      thumbnailUrl: feed.imageUrl, // 회사 로고
      blogMetaImage: feed.blogMetaImage, // 블로그 메타 이미지
      sources: feed.author ? [{
        name: feed.author.name,
        href: `#`,
        imageUrl: feed.author.imageUrl,
      }] : undefined,
      postedAt: feed.createdAt,
      stats: {
        likes: feed.stats.likes,
        views: feed.stats.views,
        bookmarks: 0,
      },
      badge: feed.category,
      tags: feed.tags,
      liked: localLikes[feed.id] || false,
      bookmarked: localBookmarks[feed.id] || false,
      aiScore: feed.aiScore,
      aiCategory: feed.aiCategory,
      publishedAt: feed.publishedAt,
    };
  }, [localLikes, localBookmarks]);

  // Filtered content cards
  const filteredContentCards = React.useMemo(() => {
    if (!feedResponse?.feeds) return [];

    let cards = feedResponse.feeds.map(transformFeedToCard);

    // Content Type Filter
    if (contentType !== 'all') {
      cards = cards.filter(card => {
        const category = card.badge?.toLowerCase() || '';
        switch (contentType) {
          case 'jobs': return category.includes('job') || category.includes('채용');
          case 'blogs': return category.includes('blog') || category.includes('블로그');
          case 'books': return category.includes('book') || category.includes('도서');
          case 'courses': return category.includes('course') || category.includes('강의');
          default: return true;
        }
      });
    }

    // Tag Filter
    if (selectedTags.length > 0) {
      cards = cards.filter(card =>
        card.tags && card.tags.some(tag => selectedTags.includes(tag))
      );
    }

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      cards = cards.filter(card =>
        card.title.toLowerCase().includes(query) ||
        card.summary.toLowerCase().includes(query)
      );
    }

    return cards;
  }, [feedResponse, contentType, selectedTags, searchQuery, transformFeedToCard]);

  // Extract all unique tags
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    feedResponse.feeds.forEach((feed) => {
      feed.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [feedResponse]);

  // 선택된 날짜의 데이터
  const dailyData = React.useMemo(() => {
    return mockDailyJobData[selectedDate];
  }, [selectedDate]);

  // AI 카테고리별로 채용공고 그룹화
  type JobWithMeta = JobRowItemProps & { companyName: string; companyLogo?: string; views: number; likes: number };

  const jobsByAICategory = React.useMemo(() => {
    if (!dailyData) return {
      aiCore: [] as JobWithMeta[],
      aiEnabled: [] as JobWithMeta[],
      traditional: [] as JobWithMeta[],
    };

    const aiCore: JobWithMeta[] = [];
    const aiEnabled: JobWithMeta[] = [];
    const traditional: JobWithMeta[] = [];

    dailyData.companies.forEach((group, groupIdx) => {
      group.jobs.forEach((job, jobIdx) => {
        // Generate consistent mock stats based on indices
        const seed = groupIdx * 10 + jobIdx;
        const views = 50 + (seed * 37) % 450;
        const likes = 2 + (seed * 13) % 28;

        const jobData: JobWithMeta = {
          id: job.id,
          title: job.title,
          summary: job.summary || '',
          createdAt: job.createdAt || new Date().toISOString(),
          url: job.url,
          companyName: group.company.name,
          companyLogo: group.company.symbolImageUrl,
          views,
          likes,
        };

        if (job.aiCategory === 'ai-core') aiCore.push(jobData);
        else if (job.aiCategory === 'ai-enabled') aiEnabled.push(jobData);
        else traditional.push(jobData);
      });
    });

    return { aiCore, aiEnabled, traditional };
  }, [dailyData]);

  // 총 채용공고 수 계산
  const totalJobCount = React.useMemo(() => {
    return jobsByAICategory.aiCore.length + jobsByAICategory.aiEnabled.length + jobsByAICategory.traditional.length;
  }, [jobsByAICategory]);

  // Handle card click (블로그용 확장 타입 지원)
  const handleCardClick = (card: DiscoverMinimalCardProps & { blogMetaImage?: string }) => {
    const companyName = card.sources?.[0]?.name || '기술 블로그';
    const companyLogo = card.thumbnailUrl;

    // 블로그용 Mock 댓글
    const blogComments = [
      { id: '1', userName: '개발자A', userImage: 'https://i.pravatar.cc/40?u=blog1', userHeadline: 'Frontend Developer @ 네이버', content: '정말 유용한 글이네요! 잘 읽었습니다.', createdAt: '2시간 전', likeCount: 12, liked: false },
      { id: '2', userName: '시니어B', userImage: 'https://i.pravatar.cc/40?u=blog2', userHeadline: 'Tech Lead @ 카카오', content: '우리 팀에서도 비슷한 고민을 했었는데, 좋은 인사이트 얻어갑니다.', createdAt: '5시간 전', likeCount: 8, liked: true },
      { id: '3', userName: '주니어C', userImage: 'https://i.pravatar.cc/40?u=blog3', userHeadline: 'Backend Developer', content: '혹시 관련 레포지토리 링크도 공유해주실 수 있나요?', createdAt: '1일 전', likeCount: 3, liked: false },
    ];

    setSelectedContent({
      id: card.contentId || 'unknown',
      title: card.title,
      summary: card.summary || '',
      imageUrl: card.blogMetaImage || card.thumbnailUrl, // 블로그 메타이미지 우선
      externalUrl: card.href || '#',
      companyName,
      companyLogo,
      likes: card.stats?.likes || 0,
      views: card.stats?.views || 0,
      isLiked: card.liked || false,
      isBookmarked: card.bookmarked || false,
      comments: blogComments,
    });
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-white" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-8">

          {/* Main Content - Centered and Wider */}
          <main className="lg:col-span-8 space-y-8">

            {/* Top Navigation & Search Area */}
            <div className="space-y-6">
              {/* Navigation & Filters Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                {/* Page Title */}
                <h1 className="text-2xl font-serif font-bold text-slate-900">Discover</h1>

                {/* Content Type Filters */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
                  {[
                    { id: 'jobs', label: '채용공고' },
                    { id: 'blogs', label: '블로그' },
                    { id: 'books', label: '도서' },
                    { id: 'courses', label: '강의' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id as ContentType)}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
                        contentType === type.id
                          ? "bg-teal-50 text-teal-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Tabs - 채용공고 탭일 때만 표시 */}
              {contentType === 'jobs' && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors",
                        selectedDate === date
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {formatDateTab(date)}
                    </button>
                  ))}
                </div>
              )}

              {/* Daily Summary Card - 채용공고 탭일 때만 표시 */}
              {contentType === 'jobs' && dailyData && (
                <DailySummaryCard
                  date={selectedDate}
                  summary={dailyData.summary}
                  totalJobs={totalJobCount}
                  totalCompanies={Object.keys(dailyData.companies).length}
                  weeklyStats={mockWeeklyStats}
                  selectedDate={selectedDate}
                  onDateClick={(date) => setSelectedDate(date)}
                />
              )}

              {/* Daily Summary Card - 블로그 탭 */}
              {contentType === 'blogs' && (
                <DailySummaryCard
                  date={selectedDate}
                  summary=""
                  totalJobs={filteredContentCards.length}
                  totalCompanies={mockSourcesByCategory.blogs.length}
                  title="최근 1주일간의 블로그 현황"
                  unitLabel="개 발행"
                  sourceLabel="개 블로그"
                  chartColor="purple"
                />
              )}

              {/* Daily Summary Card - 도서 탭 */}
              {contentType === 'books' && (
                <DailySummaryCard
                  date={selectedDate}
                  summary=""
                  totalJobs={filteredContentCards.length}
                  totalCompanies={mockSourcesByCategory.books.length}
                  title="최근 1주일간의 도서 현황"
                  unitLabel="권 등록"
                  sourceLabel="개 출판사"
                  chartColor="teal"
                />
              )}

              {/* Daily Summary Card - 강의 탭 */}
              {contentType === 'courses' && (
                <DailySummaryCard
                  date={selectedDate}
                  summary=""
                  totalJobs={filteredContentCards.length}
                  totalCompanies={mockSourcesByCategory.education.length}
                  title="최근 1주일간의 강의 현황"
                  unitLabel="개 등록"
                  sourceLabel="개 플랫폼"
                  chartColor="amber"
                />
              )}

            </div>

            {/* Content Feed */}
            {contentType === 'jobs' ? (
              // 채용공고 - AI 카테고리별 섹션
              // AI 직무: 제목에 "AI"가 명시적으로 포함된 포지션
              // AI 활용: 제목에는 AI가 없지만, 자격요건/업무내용에 AI 관련 요소가 높은 포지션
              // 기타: AI와 직접적 관련이 없는 전통적 포지션
              <div className="space-y-6">
                {/* AI Category Sections - 플랫 리스트 형태 */}
                {totalJobCount > 0 ? (
                  <>
                    {/* AI 직무 섹션 */}
                    {jobsByAICategory.aiCore.length > 0 && (
                      <div className="bg-purple-50/50 rounded-xl p-4">
                        {/* 섹션 헤더 */}
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-sm font-bold text-purple-900">AI 직무</h3>
                          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">{jobsByAICategory.aiCore.length}</span>
                        </div>
                        {/* 공고 리스트 */}
                        <div className="space-y-1">
                          {jobsByAICategory.aiCore.map((job) => (
                            <div
                              key={job.id}
                              onClick={() => {
                                setSelectedContent({
                                  id: job.id,
                                  title: job.title,
                                  summary: job.summary,
                                  externalUrl: job.url,
                                  companyName: job.companyName,
                                  companyLogo: job.companyLogo,
                                  isLiked: false,
                                  isBookmarked: false,
                                  views: job.views,
                                  likes: job.likes,
                                  comments: [
                                    { id: '1', userName: '개발자A', userImage: 'https://i.pravatar.cc/40?u=dev1', userHeadline: 'Frontend Developer @ 네이버', content: '좋은 기회네요! 지원해봐야겠어요.', createdAt: '2시간 전', likeCount: 3, liked: false },
                                    { id: '2', userName: '취준생B', userImage: 'https://i.pravatar.cc/40?u=job2', userHeadline: 'CS 전공 졸업생', content: '이 회사 복지가 좋다고 들었는데 맞나요?', createdAt: '5시간 전', likeCount: 7, liked: true },
                                  ],
                                });
                                setDrawerOpen(true);
                              }}
                              className="group flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-md bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                                {job.companyLogo ? (
                                  <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain p-0.5" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50">
                                    {job.companyName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-900 group-hover:text-purple-700 transition-colors truncate text-sm">
                                  {job.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <span className="flex items-center gap-0.5">
                                    <Eye className="h-3 w-3" />
                                    {job.views}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <Heart className="h-3 w-3" />
                                    {job.likes}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-500">{job.companyName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI 활용 섹션 */}
                    {jobsByAICategory.aiEnabled.length > 0 && (
                      <div className="bg-teal-50/50 rounded-xl p-4">
                        {/* 섹션 헤더 */}
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-sm font-bold text-teal-900">AI 활용</h3>
                          <span className="text-xs text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">{jobsByAICategory.aiEnabled.length}</span>
                        </div>
                        {/* 공고 리스트 */}
                        <div className="space-y-1">
                          {jobsByAICategory.aiEnabled.map((job) => (
                            <div
                              key={job.id}
                              onClick={() => {
                                setSelectedContent({
                                  id: job.id,
                                  title: job.title,
                                  summary: job.summary,
                                  externalUrl: job.url,
                                  companyName: job.companyName,
                                  companyLogo: job.companyLogo,
                                  isLiked: false,
                                  isBookmarked: false,
                                  views: job.views,
                                  likes: job.likes,
                                  comments: [
                                    { id: '1', userName: '마케터C', userImage: 'https://i.pravatar.cc/40?u=mark3', userHeadline: '브랜드 마케터 @ 토스', content: 'AI 툴 활용 경험이 있으면 유리할까요?', createdAt: '1시간 전', likeCount: 2, liked: false },
                                  ],
                                });
                                setDrawerOpen(true);
                              }}
                              className="group flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-md bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                                {job.companyLogo ? (
                                  <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain p-0.5" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50">
                                    {job.companyName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-900 group-hover:text-teal-700 transition-colors truncate text-sm">
                                  {job.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <span className="flex items-center gap-0.5">
                                    <Eye className="h-3 w-3" />
                                    {job.views}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <Heart className="h-3 w-3" />
                                    {job.likes}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-500">{job.companyName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 일반 섹션 */}
                    {jobsByAICategory.traditional.length > 0 && (
                      <div className="bg-slate-50/70 rounded-xl p-4">
                        {/* 섹션 헤더 */}
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-sm font-bold text-slate-700">일반</h3>
                          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{jobsByAICategory.traditional.length}</span>
                        </div>
                        {/* 공고 리스트 */}
                        <div className="space-y-1">
                          {jobsByAICategory.traditional.map((job) => (
                            <div
                              key={job.id}
                              onClick={() => {
                                setSelectedContent({
                                  id: job.id,
                                  title: job.title,
                                  summary: job.summary,
                                  externalUrl: job.url,
                                  companyName: job.companyName,
                                  companyLogo: job.companyLogo,
                                  isLiked: false,
                                  isBookmarked: false,
                                  views: job.views,
                                  likes: job.likes,
                                  comments: [],
                                });
                                setDrawerOpen(true);
                              }}
                              className="group flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-md bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                                {job.companyLogo ? (
                                  <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain p-0.5" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50">
                                    {job.companyName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-900 group-hover:text-slate-700 transition-colors truncate text-sm">
                                  {job.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <span className="flex items-center gap-0.5">
                                    <Eye className="h-3 w-3" />
                                    {job.views}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <Heart className="h-3 w-3" />
                                    {job.likes}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-500">{job.companyName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">채용공고가 없습니다</h3>
                    <p className="text-slate-500">이 날짜에 수집된 채용공고가 없습니다.</p>
                  </div>
                )}
              </div>
            ) : contentType === 'blogs' ? (
              // 블로그 - 카테고리별 필터 + 날짜별 그룹화 피드
              <div className="space-y-6">
                {/* AI 카테고리 필터 (5개) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(Object.keys(blogCategoryConfig) as BlogAICategory[]).map((catId) => {
                      const cat = blogCategoryConfig[catId];
                      return (
                        <button
                          key={catId}
                          onClick={() => setSelectedBlogCategory(catId)}
                          className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 border",
                            selectedBlogCategory === catId
                              ? `${cat.bgClass} ${cat.borderClass} ${cat.textClass}`
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* AI 분류 안내 텍스트 */}
                  <p className="text-xs text-slate-400">
                    AI가 콘텐츠를 분석하여 자동 분류합니다
                  </p>
                </div>

                {/* 날짜별 그룹화 블로그 피드 */}
                <div className="space-y-6">
                  {(() => {
                    // 카테고리 필터링
                    let blogCards = filteredContentCards.filter(card => (card as any).aiCategory === selectedBlogCategory);

                    if (blogCards.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <Search className="h-7 w-7 text-slate-300" />
                          </div>
                          <h3 className="text-base font-medium text-slate-900 mb-1">해당 카테고리의 블로그가 없습니다</h3>
                          <p className="text-sm text-slate-500">다른 카테고리를 선택해보세요.</p>
                        </div>
                      );
                    }

                    // 날짜별 그룹화
                    const groupedByDate: Record<string, typeof blogCards> = {};
                    blogCards.forEach(card => {
                      const publishedAt = (card as any).publishedAt;
                      const dateKey = publishedAt ? publishedAt.split(' ')[0] : 'unknown';
                      if (!groupedByDate[dateKey]) {
                        groupedByDate[dateKey] = [];
                      }
                      groupedByDate[dateKey].push(card);
                    });

                    // 날짜 키를 최신순으로 정렬
                    const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

                    // 날짜 포맷팅 함수
                    const formatDateHeader = (dateStr: string) => {
                      if (dateStr === 'unknown') return '날짜 미상';
                      const date = new Date(dateStr);
                      const month = date.getMonth() + 1;
                      const day = date.getDate();
                      const days = ['일', '월', '화', '수', '목', '금', '토'];
                      return `${month}월 ${day}일 (${days[date.getDay()]})`;
                    };

                    const formatShortDate = (dateStr: string) => {
                      if (dateStr === 'unknown') return '';
                      const date = new Date(dateStr);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    };

                    return sortedDates.map(dateKey => (
                      <div key={dateKey}>
                        {/* 날짜 그룹 헤더 */}
                        <div className="flex items-center gap-3 py-3 mb-3">
                          <div className="h-px flex-1 bg-slate-200" />
                          <span className="text-sm font-medium text-slate-500">{formatDateHeader(dateKey)}</span>
                          <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        {/* 해당 날짜의 블로그 카드들 */}
                        <div className="space-y-3">
                          {groupedByDate[dateKey].map((card) => {
                            const extendedCard = card as typeof card & { aiCategory?: BlogAICategory; blogMetaImage?: string };
                            const aiCategory = extendedCard.aiCategory || 'other';
                            const catConfig = blogCategoryConfig[aiCategory];
                            // 실제 블로그 메타이미지만 표시 (회사 로고는 제외)
                            const blogMetaImage = extendedCard.blogMetaImage;
                            const hasMetaImage = blogMetaImage && !blogMetaImage.includes('favicon') && !blogMetaImage.includes('logo');
                            const companyLogo = card.thumbnailUrl;
                            const companyName = card.sources?.[0]?.name || '기술 블로그';

                            return (
                              <div
                                key={card.contentId}
                                onClick={() => handleCardClick(extendedCard)}
                                className="group bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer"
                              >
                                <div className="flex gap-4 p-4">
                                  {/* 블로그 메타 이미지 (실제 있을 때만) */}
                                  {hasMetaImage && (
                                    <div className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                      <img src={blogMetaImage} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  )}

                                  {/* 콘텐츠 */}
                                  <div className="flex-1 min-w-0 flex flex-col">
                                    {/* 기업 정보 (로고 + 이름) */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-md bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {companyLogo ? (
                                          <img src={companyLogo} alt={companyName} className="w-full h-full object-contain p-0.5" />
                                        ) : (
                                          <span className="text-[10px] font-bold text-slate-400">{companyName.charAt(0)}</span>
                                        )}
                                      </div>
                                      <span className="text-sm font-medium text-slate-700 truncate">{companyName}</span>
                                      <span className="text-slate-300">·</span>
                                      <span className="text-xs text-slate-400">{formatShortDate(dateKey)}</span>
                                    </div>

                                    {/* 제목 */}
                                    <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 mb-1.5">
                                      {card.title}
                                    </h3>

                                    {/* 요약 */}
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-2 flex-1">
                                      {card.summary}
                                    </p>

                                    {/* 하단: Stats + 카테고리 라벨 */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                          <Eye className="h-3 w-3" />
                                          {card.stats?.views?.toLocaleString() || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Heart className="h-3 w-3" />
                                          {card.stats?.likes || 0}
                                        </span>
                                      </div>
                                      {/* 카테고리 라벨 */}
                                      <span className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border",
                                        catConfig.bgClass.replace('100', '50'),
                                        catConfig.textClass.replace('700', '600'),
                                        catConfig.borderClass.replace('300', '200')
                                      )}>
                                        {catConfig.icon} {catConfig.label}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ) : contentType === 'books' ? (
              // 도서 - 책 표지 스타일 카드 + 주간 구분선
              <div className="space-y-6">
                {/* AI 카테고리 필터 (전체 포함) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(Object.keys(contentCategoryConfig) as ContentAICategory[]).map((catId) => {
                      const cat = contentCategoryConfig[catId];
                      return (
                        <button
                          key={catId}
                          onClick={() => setSelectedBookCategory(catId)}
                          className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 border",
                            selectedBookCategory === catId
                              ? `${cat.bgClass} ${cat.borderClass} ${cat.textClass}`
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(() => {
                  // 카테고리 필터링
                  let bookCards = selectedBookCategory === 'all'
                    ? filteredContentCards
                    : filteredContentCards.filter(card => (card as any).aiCategory === selectedBookCategory);

                  if (bookCards.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Search className="h-7 w-7 text-slate-300" />
                        </div>
                        <h3 className="text-base font-medium text-slate-900 mb-1">해당 카테고리의 도서가 없습니다</h3>
                        <p className="text-sm text-slate-500">다른 카테고리를 선택해보세요.</p>
                      </div>
                    );
                  }

                  // 주간별 그룹화 함수
                  const getWeekKey = (dateStr: string) => {
                    const date = new Date(dateStr);
                    const startOfWeek = new Date(date);
                    startOfWeek.setDate(date.getDate() - date.getDay()); // 일요일 기준
                    return startOfWeek.toISOString().split('T')[0];
                  };

                  const groupedByWeek: Record<string, typeof bookCards> = {};
                  bookCards.forEach(card => {
                    const dateStr = card.postedAt ? card.postedAt.split('T')[0] : 'unknown';
                    const weekKey = dateStr !== 'unknown' ? getWeekKey(dateStr) : 'unknown';
                    if (!groupedByWeek[weekKey]) {
                      groupedByWeek[weekKey] = [];
                    }
                    groupedByWeek[weekKey].push(card);
                  });

                  const sortedWeeks = Object.keys(groupedByWeek).sort((a, b) => b.localeCompare(a));

                  const formatWeekHeader = (weekStartStr: string) => {
                    if (weekStartStr === 'unknown') return '날짜 미상';
                    const startDate = new Date(weekStartStr);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 6);

                    const today = new Date();
                    const thisWeekStart = new Date(today);
                    thisWeekStart.setDate(today.getDate() - today.getDay());
                    const lastWeekStart = new Date(thisWeekStart);
                    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

                    if (startDate.toDateString() === thisWeekStart.toDateString()) {
                      return '이번 주';
                    } else if (startDate.toDateString() === lastWeekStart.toDateString()) {
                      return '지난 주';
                    }

                    const startMonth = startDate.getMonth() + 1;
                    const startDay = startDate.getDate();
                    const endMonth = endDate.getMonth() + 1;
                    const endDay = endDate.getDate();

                    if (startMonth === endMonth) {
                      return `${startMonth}월 ${startDay}일 ~ ${endDay}일`;
                    }
                    return `${startMonth}/${startDay} ~ ${endMonth}/${endDay}`;
                  };

                  return sortedWeeks.map(weekKey => (
                    <div key={weekKey}>
                      {/* 주간 구분선 */}
                      <div className="flex items-center gap-3 py-3 mb-4">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-sm font-medium text-slate-500">{formatWeekHeader(weekKey)}</span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      {/* 책 그리드 - 작은 책 표지 스타일 */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {groupedByWeek[weekKey].map((card) => {
                          const bookImage = card.thumbnailUrl;
                          const publisherName = card.sources?.[0]?.name || '출판사';

                          return (
                            <div
                              key={card.contentId}
                              onClick={() => handleCardClick(card)}
                              className="group cursor-pointer"
                            >
                              {/* 책 표지 */}
                              <div className="aspect-[2/3] rounded-md overflow-hidden bg-slate-100 shadow-md group-hover:shadow-lg transition-shadow mb-2 relative">
                                {bookImage ? (
                                  <img src={bookImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
                                    <span className="text-3xl">📚</span>
                                  </div>
                                )}
                                {/* 호버 오버레이 */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              </div>
                              {/* 책 정보 */}
                              <h4 className="font-medium text-slate-900 text-xs line-clamp-2 group-hover:text-teal-700 transition-colors mb-1">
                                {card.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1.5">
                                {card.sources?.[0]?.imageUrl && (
                                  <img src={card.sources[0].imageUrl} alt="" className="w-5 h-5 rounded object-contain flex-shrink-0 border border-slate-100" />
                                )}
                                <p className="text-xs text-slate-600 truncate font-medium">{publisherName}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : contentType === 'courses' ? (
              // 강의 - 강의 플랫폼 스타일 카드 + 주간 구분선
              <div className="space-y-6">
                {/* AI 카테고리 필터 (전체 포함) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(Object.keys(contentCategoryConfig) as ContentAICategory[]).map((catId) => {
                      const cat = contentCategoryConfig[catId];
                      return (
                        <button
                          key={catId}
                          onClick={() => setSelectedCourseCategory(catId)}
                          className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 border",
                            selectedCourseCategory === catId
                              ? `${cat.bgClass} ${cat.borderClass} ${cat.textClass}`
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(() => {
                  // 카테고리 필터링
                  let courseCards = selectedCourseCategory === 'all'
                    ? filteredContentCards
                    : filteredContentCards.filter(card => (card as any).aiCategory === selectedCourseCategory);

                  if (courseCards.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Search className="h-7 w-7 text-slate-300" />
                        </div>
                        <h3 className="text-base font-medium text-slate-900 mb-1">해당 카테고리의 강의가 없습니다</h3>
                        <p className="text-sm text-slate-500">다른 카테고리를 선택해보세요.</p>
                      </div>
                    );
                  }

                  // 주간별 그룹화 함수
                  const getWeekKey = (dateStr: string) => {
                    const date = new Date(dateStr);
                    const startOfWeek = new Date(date);
                    startOfWeek.setDate(date.getDate() - date.getDay()); // 일요일 기준
                    return startOfWeek.toISOString().split('T')[0];
                  };

                  const groupedByWeek: Record<string, typeof courseCards> = {};
                  courseCards.forEach(card => {
                    const dateStr = card.postedAt ? card.postedAt.split('T')[0] : 'unknown';
                    const weekKey = dateStr !== 'unknown' ? getWeekKey(dateStr) : 'unknown';
                    if (!groupedByWeek[weekKey]) {
                      groupedByWeek[weekKey] = [];
                    }
                    groupedByWeek[weekKey].push(card);
                  });

                  const sortedWeeks = Object.keys(groupedByWeek).sort((a, b) => b.localeCompare(a));

                  const formatWeekHeader = (weekStartStr: string) => {
                    if (weekStartStr === 'unknown') return '날짜 미상';
                    const startDate = new Date(weekStartStr);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 6);

                    const today = new Date();
                    const thisWeekStart = new Date(today);
                    thisWeekStart.setDate(today.getDate() - today.getDay());
                    const lastWeekStart = new Date(thisWeekStart);
                    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

                    if (startDate.toDateString() === thisWeekStart.toDateString()) {
                      return '이번 주';
                    } else if (startDate.toDateString() === lastWeekStart.toDateString()) {
                      return '지난 주';
                    }

                    const startMonth = startDate.getMonth() + 1;
                    const startDay = startDate.getDate();
                    const endMonth = endDate.getMonth() + 1;
                    const endDay = endDate.getDate();

                    if (startMonth === endMonth) {
                      return `${startMonth}월 ${startDay}일 ~ ${endDay}일`;
                    }
                    return `${startMonth}/${startDay} ~ ${endMonth}/${endDay}`;
                  };

                  return sortedWeeks.map(weekKey => (
                    <div key={weekKey}>
                      {/* 주간 구분선 */}
                      <div className="flex items-center gap-3 py-3 mb-4">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-sm font-medium text-slate-500">{formatWeekHeader(weekKey)}</span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      {/* 강의 카드 그리드 - Udemy/인프런 스타일 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupedByWeek[weekKey].map((card) => {
                          const courseImage = card.thumbnailUrl;
                          const platformName = card.sources?.[0]?.name || '플랫폼';

                          return (
                            <div
                              key={card.contentId}
                              onClick={() => handleCardClick(card)}
                              className="group bg-white rounded-xl border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                            >
                              {/* 강의 썸네일 - 16:9 비율 */}
                              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                {courseImage ? (
                                  <img src={courseImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
                                    <span className="text-4xl">🎓</span>
                                  </div>
                                )}
                              </div>
                              {/* 강의 정보 */}
                              <div className="p-3">
                                {/* 플랫폼 정보 */}
                                <div className="flex items-center gap-2 mb-2">
                                  {card.sources?.[0]?.imageUrl && (
                                    <img src={card.sources[0].imageUrl} alt="" className="w-5 h-5 rounded object-contain flex-shrink-0 border border-slate-100" />
                                  )}
                                  <span className="text-xs text-slate-600 font-medium">{platformName}</span>
                                </div>
                                <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 group-hover:text-amber-700 transition-colors mb-2">
                                  {card.title}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                                  {card.summary}
                                </p>
                                {/* Stats */}
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {card.stats?.views?.toLocaleString() || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {card.stats?.likes || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              // 기타 - 기본 카드 그리드
              <div className="grid gap-x-6 gap-y-10 grid-cols-1">
                {filteredContentCards.length > 0 ? (
                  filteredContentCards.map((card) => (
                    <div key={card.contentId} className="col-span-1">
                      <DiscoverMinimalCard
                        {...card}
                        variant="default"
                        onCardClick={() => handleCardClick(card)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">검색 결과가 없습니다</h3>
                    <p className="text-slate-500">다른 키워드로 검색하거나 필터를 변경해보세요.</p>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar - Data Sources */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-24 h-fit pl-6 border-l border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                </div>
                수집 출처
              </h3>
              <span className="text-xs text-slate-400">
                {mockSourceStats.totalSources.toLocaleString()}개 소스
              </span>
            </div>

            {/* Today Update Stats */}
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-teal-600 mb-1 font-medium">오늘 업데이트</div>
                <div className="text-xl font-bold text-teal-700">
                  +{mockSourceStats.updatesToday.toLocaleString()}건
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-200" />
            </div>

            {/* 기업 검색 및 리스트 - jobs 탭에서만 표시 */}
            {contentType === 'jobs' && (
              <div className="space-y-4">
                {/* 기업 검색창 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="기업 검색..."
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-400"
                  />
                </div>

                {/* 검색 결과 */}
                {companySearchQuery.trim() && (
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                      <span className="text-xs font-medium text-slate-500">검색 결과 ({filteredCompanies.length})</span>
                    </div>
                    {filteredCompanies.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {filteredCompanies.map((company) => (
                          company.isPremium ? (
                            <Link
                              key={company.id}
                              href={`/company/${company.id}`}
                              className="group flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                            >
                              <div className="relative flex-shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                                  {company.logo ? (
                                    <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-0.5" />
                                  ) : (
                                    <span className="text-xs font-bold text-slate-400">{company.name[0]}</span>
                                  )}
                                </div>
                                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center">
                                  <BadgeCheck className="w-2.5 h-2.5 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-medium text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                                    {company.name}
                                  </span>
                                  <span className="text-[10px] text-teal-600 font-medium">인증</span>
                                </div>
                                <span className="text-xs text-slate-400">{company.category} · {company.totalJobs}건</span>
                              </div>
                            </Link>
                          ) : (
                            <div
                              key={company.id}
                              className="flex items-center gap-3 px-3 py-2.5 opacity-50 cursor-not-allowed"
                            >
                              <div className="relative flex-shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                  {company.logo ? (
                                    <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-0.5 grayscale" />
                                  ) : (
                                    <span className="text-xs font-bold text-slate-400">{company.name[0]}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-medium text-slate-500 truncate">
                                    {company.name}
                                  </span>
                                  <Lock className="w-3 h-3 text-slate-400" />
                                </div>
                                <span className="text-xs text-slate-400">{company.category} · {company.totalJobs}건</span>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-4 text-center text-sm text-slate-400">
                        검색 결과가 없습니다
                      </div>
                    )}
                  </div>
                )}

                {/* 최근 업데이트 기업 */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    최근 업데이트 기업
                  </h4>
                  <div className="space-y-2">
                    {mockRecentlyUpdatedCompanies.slice(0, 10).map((company) => (
                      <Link
                        key={company.id}
                        href={`/company/${company.id}`}
                        className="group block p-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                              {company.logo ? (
                                <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-0.5" />
                              ) : (
                                <span className="text-xs font-bold text-slate-400">{company.name[0]}</span>
                              )}
                            </div>
                            {company.isPremium && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                                <BadgeCheck className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                                {company.name}
                              </span>
                              {company.isPremium && (
                                <span className="text-[10px] text-teal-600 font-medium">인증</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <span className="text-teal-600 font-medium">+{company.updatedJobCount}건</span>
                              <span>·</span>
                              <span className="text-slate-400">전체 {company.totalJobs}건</span>
                              <span>·</span>
                              <span>{company.updatedAt}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* 기업 수집 신청 CTA */}
                  <a
                    href={COMPANY_REGISTRATION_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>우리 회사도 등록 신청하기</span>
                  </a>
                </div>
              </div>
            )}

            {/* Tech Blogs Section - blogs 탭에서만 표시 */}
            {contentType === 'blogs' && (
              <div className="space-y-6">
                {/* 블로그 검색 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="블로그 검색..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-400"
                  />
                </div>

                {/* 최근 업데이트된 블로그 (10개) */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    최근 업데이트 블로그
                  </h4>
                  <div className="space-y-1">
                    {mockSourcesByCategory.blogs.slice(0, 10).map((source, idx) => (
                      <div
                        key={source.id}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {source.logo ? (
                              <img src={source.logo} alt={source.name} className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">{source.name[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-slate-700 group-hover:text-purple-700 transition-colors truncate block">
                              {source.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {idx < 3 ? '오늘' : idx < 5 ? '어제' : `${idx - 2}일 전`} 업데이트
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-purple-600 font-medium flex-shrink-0">
                          <span>+{source.activeCount > 100 ? Math.floor(source.activeCount / 20) : Math.ceil(source.activeCount / 10)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 블로그 추가 접수 CTA */}
                  <a
                    href={COMPANY_REGISTRATION_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm text-purple-700 hover:text-purple-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>블로그 수집 요청하기</span>
                  </a>
                </div>
              </div>
            )}

            {/* Education Section - courses 탭에서만 표시 */}
            {contentType === 'courses' && (
              <div className="space-y-6">
                {/* 플랫폼 검색 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="플랫폼 검색..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-slate-400"
                  />
                </div>

                {/* 최근 업데이트된 교육 플랫폼 */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    최근 업데이트 플랫폼
                  </h4>
                  <div className="space-y-1">
                    {mockSourcesByCategory.education.slice(0, 10).map((source, idx) => (
                      <div
                        key={source.id}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {source.logo ? (
                              <img src={source.logo} alt={source.name} className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">{source.name[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-slate-700 group-hover:text-amber-700 transition-colors truncate block">
                              {source.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {idx < 3 ? '오늘' : idx < 5 ? '어제' : `${idx - 2}일 전`} 업데이트
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-600 font-medium flex-shrink-0">
                          <span>+{source.activeCount > 100 ? Math.floor(source.activeCount / 20) : Math.ceil(source.activeCount / 10)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 플랫폼 추가 접수 CTA */}
                  <a
                    href={COMPANY_REGISTRATION_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-sm text-amber-700 hover:text-amber-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>플랫폼 수집 요청하기</span>
                  </a>
                </div>
              </div>
            )}

            {/* Books/Publishers Section - books 탭에서만 표시 */}
            {contentType === 'books' && (
              <div className="space-y-6">
                {/* 출판사 검색 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="출판사 검색..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-400"
                  />
                </div>

                {/* 최근 업데이트된 출판사 */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    최근 업데이트 출판사
                  </h4>
                  <div className="space-y-1">
                    {mockSourcesByCategory.books.slice(0, 10).map((source, idx) => (
                      <div
                        key={source.id}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {source.logo ? (
                              <img src={source.logo} alt={source.name} className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">{source.name[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-slate-700 group-hover:text-teal-700 transition-colors truncate block">
                              {source.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {idx < 3 ? '오늘' : idx < 5 ? '어제' : `${idx - 2}일 전`} 업데이트
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-teal-600 font-medium flex-shrink-0">
                          <span>+{source.activeCount > 100 ? Math.floor(source.activeCount / 20) : Math.ceil(source.activeCount / 10)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 출판사 추가 접수 CTA */}
                  <a
                    href={COMPANY_REGISTRATION_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-sm text-teal-700 hover:text-teal-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>출판사 수집 요청하기</span>
                  </a>
                </div>
              </div>
            )}

            {/* Quick Links / Footer-like content */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
                <a href="#" className="hover:text-slate-600">About</a>
                <a href="#" className="hover:text-slate-600">Privacy</a>
                <a href="#" className="hover:text-slate-600">Terms</a>
                <a href="#" className="hover:text-slate-600">Help</a>
                <span>© 2025 Careerly AI</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Detail Drawer */}
      <div
        className={
          cn(
            "fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto border-l border-slate-100",
            drawerOpen ? "translate-x-0" : "translate-x-full"
          )
        }
      >
        {selectedContent && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedContent.companyLogo && (
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden">
                    <img src={selectedContent.companyLogo} alt={selectedContent.companyName} className="w-full h-full object-contain p-1" />
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-slate-900">{selectedContent.companyName}</span>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
                  {selectedContent.title}
                </h1>

                {/* Stats Bar */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{selectedContent.views}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{selectedContent.likes}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{selectedContent.comments.length}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="prose prose-slate max-w-none mb-6">
                  <p className="text-slate-700 leading-relaxed">
                    {selectedContent.summary}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-8">
                  <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    공고 보기
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "border-slate-200",
                      selectedContent.isLiked && "bg-red-50 border-red-200"
                    )}
                    onClick={() => {
                      setSelectedContent(prev => prev ? {...prev, isLiked: !prev.isLiked, likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1} : null);
                    }}
                  >
                    <Heart className={cn("h-4 w-4", selectedContent.isLiked && "fill-red-500 text-red-500")} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "border-slate-200",
                      selectedContent.isBookmarked && "bg-teal-50 border-teal-200"
                    )}
                    onClick={() => {
                      setSelectedContent(prev => prev ? {...prev, isBookmarked: !prev.isBookmarked} : null);
                    }}
                  >
                    <Bookmark className={cn("h-4 w-4", selectedContent.isBookmarked && "fill-teal-500 text-teal-500")} />
                  </Button>
                </div>

                {/* Comments Section */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    댓글 {selectedContent.comments.length}
                  </h3>

                  {/* Comment Input */}
                  <div className="flex gap-2 mb-6">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-slate-200 text-slate-600">U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newComment.trim()) {
                            setSelectedContent(prev => prev ? {
                              ...prev,
                              comments: [
                                { id: Date.now().toString(), userName: '나', userImage: undefined, userHeadline: undefined, content: newComment, createdAt: '방금 전', likeCount: 0, liked: false },
                                ...prev.comments
                              ]
                            } : null);
                            setNewComment('');
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        className="bg-teal-600 hover:bg-teal-700"
                        disabled={!newComment.trim()}
                        onClick={() => {
                          if (newComment.trim()) {
                            setSelectedContent(prev => prev ? {
                              ...prev,
                              comments: [
                                { id: Date.now().toString(), userName: '나', userImage: undefined, userHeadline: undefined, content: newComment, createdAt: '방금 전', likeCount: 0, liked: false },
                                ...prev.comments
                              ]
                            } : null);
                            setNewComment('');
                          }
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  {selectedContent.comments.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                      {selectedContent.comments.map((comment) => (
                        <div key={comment.id} className="py-4 first:pt-0">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={comment.userImage} alt={comment.userName} />
                              <AvatarFallback className="bg-slate-200 text-slate-600">{comment.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex-1">
                                  <span className="font-semibold text-slate-900 text-sm">
                                    {comment.userName}
                                  </span>
                                  {comment.userHeadline && (
                                    <p className="text-xs text-slate-500">{comment.userHeadline}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                                  <button
                                    onClick={() => {
                                      setSelectedContent(prev => {
                                        if (!prev) return null;
                                        return {
                                          ...prev,
                                          comments: prev.comments.map(c =>
                                            c.id === comment.id
                                              ? { ...c, liked: !c.liked, likeCount: c.liked ? c.likeCount - 1 : c.likeCount + 1 }
                                              : c
                                          )
                                        };
                                      });
                                    }}
                                    className={cn(
                                      'flex items-center gap-1 text-xs transition-colors',
                                      comment.liked
                                        ? 'text-red-500'
                                        : 'text-slate-400 hover:text-red-500'
                                    )}
                                  >
                                    <Heart
                                      className={cn(
                                        'h-3.5 w-3.5',
                                        comment.liked && 'fill-current'
                                      )}
                                    />
                                    {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                                  </button>
                                  <span className="text-xs text-slate-400">{comment.createdAt}</span>
                                </div>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">아직 댓글이 없습니다.</p>
                      <p className="text-xs">첫 번째 댓글을 남겨보세요!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div >

      {/* Backdrop */}
      {
        drawerOpen && (
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
          />
        )
      }
    </div >
  );
}
