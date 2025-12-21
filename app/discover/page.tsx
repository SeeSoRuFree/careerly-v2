'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, BadgeCheck, Plus, Lock, Sparkles, Briefcase, FileText, BookOpen, GraduationCap, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Chip } from '@/components/ui/chip';
import Link from 'next/link';
import { DailySummaryCard } from '@/components/ui/daily-summary-card';
import { SidebarFooter } from '@/components/layout/SidebarFooter';

// Discover 컴포넌트
import {
  JobListItem,
  BlogCard,
  BookCard,
  CourseCard,
  ContentDetailDrawer,
  SourceListItem,
  formatDateTab,
  generateLast7Days,
  formatDateHeader,
  formatShortDate,
  formatWeekHeader,
  groupByDate,
  groupByWeek,
} from '@/components/discover';
import type {
  JobItemData,
  ContentDetailData,
  SourceItemData,
  BlogCardData,
  BookCardData,
  CourseCardData,
} from '@/components/discover';

// API 훅
import { useV2MainData, useInfiniteV2JobsList, useRecruitsContents, useContentsRanking } from '@/lib/api/hooks/queries/useSomoonRecruits';
import type { RecruitsV2CompanyJobGroup, RecruitsContentType } from '@/lib/api/types/somoon-recruits.types';

// 상수
import { COMPANY_REGISTRATION_FORM_URL } from '@/lib/api/types/discover.types';

type ContentType = 'jobs' | 'blogs' | 'books' | 'courses';

/**
 * API 날짜(UTC)를 표시용 날짜(KST +1일)로 변환
 * API가 UTC 기준 어제 데이터를 반환하므로, 표시할 때는 하루 뒤로 보여줌
 */
function apiDateToDisplayDate(apiDate: string): string {
  const date = new Date(apiDate);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

export default function DiscoverPage() {
  const [contentType, setContentType] = React.useState<ContentType>('jobs');

  // 국내/글로벌 탭 상태
  type CompanyTypeTab = 'domestic' | 'global';
  const [companyTypeTab, setCompanyTypeTab] = React.useState<CompanyTypeTab>('domestic');

  // 회사 필터 상태 (all = 전체)
  const [selectedBlogCompany, setSelectedBlogCompany] = React.useState<string>('all');
  const [selectedBookCompany, setSelectedBookCompany] = React.useState<string>('all');
  const [selectedCourseCompany, setSelectedCourseCompany] = React.useState<string>('all');

  // 기업 필터 상태 (채용공고용)
  const [selectedCompanyFilter, setSelectedCompanyFilter] = React.useState<string | null>(null);

  // Drawer 상태
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<ContentDetailData | null>(null);

  // V2 메인 데이터 API 호출 (통계 전용)
  const { data: v2MainData } = useV2MainData({
    enabled: contentType === 'jobs',
  });

  // 선택된 날짜 상태 (API 날짜, YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = React.useState<string>('');

  // API에서 가져온 날짜 목록 (최신 날짜는 수집 중이므로 제외)
  const availableDates = React.useMemo(() => {
    if (!v2MainData?.daily_company_jobs) return generateLast7Days().slice(1);
    return v2MainData.daily_company_jobs
      .map((stat) => stat.date)
      .sort((a, b) => b.localeCompare(a)) // 최신 날짜 먼저
      .slice(1); // 첫 번째(최신) 제거 - 수집 중
  }, [v2MainData]);

  // 첫 데이터 로드 시 기본 날짜 선택
  React.useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      // 오늘(KST)을 표시하려면 API 날짜는 어제(UTC)여야 함
      const today = new Date();
      const yesterdayApiDate = new Date(today);
      yesterdayApiDate.setDate(today.getDate() - 1);
      const targetApiDate = yesterdayApiDate.toISOString().split('T')[0];

      const todayDate = availableDates.find(d => d === targetApiDate);
      setSelectedDate(todayDate || availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // V2 Jobs List API 호출 (무한스크롤) - 탭에 따라 target 변경
  const {
    data: jobsListData,
    isLoading: isJobsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteV2JobsList(
    {
      date: selectedDate,
      page_size: 50,
      target: companyTypeTab === 'domestic' ? 'local' : 'global',
      company: selectedCompanyFilter || undefined,
    },
    { enabled: contentType === 'jobs' && !!selectedDate }
  );

  // 회사 목록용 API 호출 (필터 없이 전체 목록) - 회사 필터 UI용
  const { data: companyListData } = useInfiniteV2JobsList(
    {
      date: selectedDate,
      page_size: 100, // 회사 목록만 필요하므로 큰 사이즈
      target: companyTypeTab === 'domestic' ? 'local' : 'global',
      // company 파라미터 없음 - 전체 회사 목록
    },
    { enabled: contentType === 'jobs' && !!selectedDate }
  );

  // 최근 한달 날짜 계산
  const contentDateRange = React.useMemo(() => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return {
      created_start: oneMonthAgo.toISOString().split('T')[0],
      created_end: today.toISOString().split('T')[0],
    };
  }, []);

  // 블로그 API 호출 (최근 한달)
  const { data: blogsData, isLoading: isBlogsLoading } = useRecruitsContents(
    { content_type: 'blog', ...contentDateRange, limit: 1000 },
    { enabled: contentType === 'blogs' }
  );

  // 도서 API 호출 (최근 한달)
  const { data: booksData, isLoading: isBooksLoading } = useRecruitsContents(
    { content_type: 'book', ...contentDateRange, limit: 1000 },
    { enabled: contentType === 'books' }
  );

  // 강의 API 호출 (최근 한달)
  const { data: lecturesData, isLoading: isLecturesLoading } = useRecruitsContents(
    { content_type: 'lecture', ...contentDateRange, limit: 1000 },
    { enabled: contentType === 'courses' }
  );

  // 콘텐츠 랭킹 API 호출
  const { data: blogRankingData } = useContentsRanking('blog', false, {
    enabled: contentType === 'blogs',
  });
  const { data: bookRankingData } = useContentsRanking('book', false, {
    enabled: contentType === 'books',
  });
  const { data: lectureRankingData } = useContentsRanking('lecture', false, {
    enabled: contentType === 'courses',
  });

  // apiDate는 selectedDate와 동일 (하위 호환을 위해 유지)
  const apiDate = selectedDate;

  // 통계용 데이터 (필터 없는 companyListData에서 가져옴)
  const statsPageData = companyListData?.pages?.[0];

  // 선택된 날짜의 회사 목록 (채용공고 수 기준 정렬) - 새 API에서 가져옴
  interface CompanyFilterItem {
    sign: string;
    name: string;
    logo: string;
    jobCount: number;
    type: 'domestic' | 'global';
    updatedAt: string;
  }

  // 회사 목록 (companyListData에서 추출 - 필터 없는 전체 목록)
  const companyFilterList = React.useMemo((): CompanyFilterItem[] => {
    if (!companyListData?.pages) return [];

    // 선택된 날짜 기준 상대 시간 계산
    const displayDate = apiDateToDisplayDate(apiDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(displayDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - selectedDateObj.getTime()) / (1000 * 60 * 60 * 24));

    let updatedAtLabel: string;
    if (diffDays === 0) {
      updatedAtLabel = '오늘';
    } else if (diffDays === 1) {
      updatedAtLabel = '어제';
    } else {
      updatedAtLabel = `${diffDays}일 전`;
    }

    // 모든 페이지의 회사 목록 합치기 (중복 제거)
    const companyMap = new Map<string, CompanyFilterItem>();

    companyListData.pages.forEach((page) => {
      page.jobs.forEach((company: RecruitsV2CompanyJobGroup) => {
        if (!companyMap.has(company.company_sign)) {
          companyMap.set(company.company_sign, {
            sign: company.company_sign,
            name: company.company_name,
            logo: company.company_image,
            jobCount: company.job_count,
            type: company.location === 'local' ? 'domestic' : 'global',
            updatedAt: updatedAtLabel,
          });
        }
      });
    });

    // 채용공고 수 기준 내림차순 정렬
    return Array.from(companyMap.values()).sort((a, b) => b.jobCount - a.jobCount);
  }, [companyListData, apiDate]);

  // 탭에 따라 필터링된 기업 목록 (이미 target으로 필터링되어 있음)
  const filteredByTabCompanyList = companyFilterList;

  // 날짜 변경 시 기업 필터 초기화
  React.useEffect(() => {
    setSelectedCompanyFilter(null);
  }, [apiDate]);

  // 선택된 날짜의 채용공고 데이터 - 회사별 그룹에서 추출
  const currentTabJobs = React.useMemo((): JobItemData[] => {
    if (!jobsListData?.pages) return [];

    const allJobs: JobItemData[] = [];

    // 모든 페이지의 회사별 채용공고를 flat하게 합침
    jobsListData.pages.forEach((page) => {
      page.jobs.forEach((company: RecruitsV2CompanyJobGroup) => {
        company.jobs.forEach((job) => {
          allJobs.push({
            id: String(job.id),
            title: job.title,
            summary: job.summary || '',
            url: job.url,
            companyName: company.company_name,
            companyLogo: company.company_image,
            createdAt: job.created_at,
          });
        });
      });
    });

    return allJobs;
  }, [jobsListData]);

  // 하위 호환을 위해 domesticJobs, globalJobs 유지
  const domesticJobs = companyTypeTab === 'domestic' ? currentTabJobs : [];
  const globalJobs = companyTypeTab === 'global' ? currentTabJobs : [];

  // 전체 채용공고 (국내 + 글로벌)
  const selectedDateJobs = React.useMemo(() => {
    return [...domesticJobs, ...globalJobs];
  }, [domesticJobs, globalJobs]);

  // 선택된 날짜의 채용공고 총 개수 - 국내 + 글로벌 합계 (v2MainData에서 가져옴)
  const totalJobCount = React.useMemo(() => {
    if (!v2MainData?.daily_company_jobs || !apiDate) return selectedDateJobs.length;
    const stat = v2MainData.daily_company_jobs.find(s => s.date === apiDate);
    // domestic + global_jobs 합계
    return stat ? (stat.domestic + stat.global_jobs) : selectedDateJobs.length;
  }, [v2MainData, apiDate, selectedDateJobs.length]);

  // 국내/글로벌 채용공고 수 - v2MainData에서 가져옴 (target 별로 API 호출하므로)
  const { domesticJobCount, globalJobCount } = React.useMemo(() => {
    if (!v2MainData?.daily_company_jobs || !apiDate) {
      return { domesticJobCount: 0, globalJobCount: 0 };
    }

    const stat = v2MainData.daily_company_jobs.find(s => s.date === apiDate);
    if (!stat) {
      return { domesticJobCount: 0, globalJobCount: 0 };
    }

    return {
      domesticJobCount: stat.domestic || 0,
      globalJobCount: stat.global_jobs || 0,
    };
  }, [v2MainData, apiDate]);

  // 날짜별 통계 (날짜 탭에 개수 표시용) - v2MainData의 daily_company_jobs 사용
  const dateStats = React.useMemo(() => {
    if (!v2MainData?.daily_company_jobs) return {};
    const stats: Record<string, number> = {};
    v2MainData.daily_company_jobs.forEach((stat) => {
      stats[stat.date] = stat.total;
    });
    return stats;
  }, [v2MainData]);

  // 주간 통계 (차트용) - daily_company_jobs를 WeeklyStat[] 형태로 변환
  // 최신 날짜는 항상 수집 중이므로 제외
  const weeklyStats = React.useMemo(() => {
    if (!v2MainData?.daily_company_jobs) return [];

    const sortedStats = [...v2MainData.daily_company_jobs]
      .sort((a, b) => b.date.localeCompare(a.date)) // 최신 먼저
      .slice(1); // 첫 번째(최신) 제거

    return sortedStats
      .map((stat) => {
        return {
          date: stat.date,
          count: stat.total,
          // 회사 수는 jobs_list API에서 가져와야 하지만, 차트에서는 개략적으로 표시
          // jobsListData가 현재 선택된 날짜만 있으므로 0으로 표시
          companies: 0,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date)); // 오래된 날짜 먼저 (차트용)
  }, [v2MainData]);

  // 블로그 데이터 변환 (API 데이터 사용)
  const blogCards = React.useMemo(() => {
    if (!blogsData?.contents) return [];
    return blogsData.contents
      .sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      )
      .map((blog) => ({
        id: `blog-${blog.id}`,
        title: blog.title,
        summary: blog.summary || '',
        companyName: blog.company_title,
        companyLogo: blog.company_image,
        companySign: blog.company_sign,
        blogMetaImage: blog.additional_info?.image_url || undefined,
        author: blog.additional_info?.author || undefined,
        publishedAt: blog.created_at,
        url: blog.url,
      }));
  }, [blogsData]);

  // 도서 데이터 변환 (API 데이터 사용)
  const bookCards = React.useMemo(() => {
    if (!booksData?.contents) return [];
    return booksData.contents.map((book) => ({
      id: `book-${book.id}`,
      title: book.title,
      summary: book.summary || '',
      imageUrl: book.additional_info?.image_url || undefined,
      author: book.additional_info?.author || undefined,
      publisherName: book.company_title,
      publisherLogo: book.company_image,
      companySign: book.company_sign,
      url: book.url,
      createdAt: book.created_at,
    }));
  }, [booksData]);

  // 강의 데이터 변환 (API 데이터 사용)
  const courseCards = React.useMemo(() => {
    if (!lecturesData?.contents) return [];
    return lecturesData.contents.map((course) => ({
      id: `course-${course.id}`,
      title: course.title,
      summary: course.summary || '',
      imageUrl: course.additional_info?.image_url || undefined,
      author: course.additional_info?.author || undefined,
      platformName: course.company_title,
      platformLogo: course.company_image,
      companySign: course.company_sign,
      url: course.url,
      createdAt: course.created_at,
    }));
  }, [lecturesData]);

  // 회사별 카테고리 목록 생성 (최근 업데이트순 정렬, 최신일자 콘텐츠 수 별도 계산)
  const blogCompanyCategories = React.useMemo(() => {
    if (!blogsData?.contents) return [];
    const companyMap = new Map<string, { sign: string; name: string; logo: string; count: number; latestDate: string; latestDateCount: number }>();
    blogsData.contents.forEach((item) => {
      const existing = companyMap.get(item.company_sign);
      const itemDate = item.created_at.split('T')[0]; // YYYY-MM-DD 형식으로 비교
      if (existing) {
        existing.count++;
        const existingDate = existing.latestDate.split('T')[0];
        if (itemDate > existingDate) {
          existing.latestDate = item.created_at;
          existing.latestDateCount = 1;
        } else if (itemDate === existingDate) {
          existing.latestDateCount++;
        }
      } else {
        companyMap.set(item.company_sign, {
          sign: item.company_sign,
          name: item.company_title,
          logo: item.company_image,
          count: 1,
          latestDate: item.created_at,
          latestDateCount: 1,
        });
      }
    });
    return Array.from(companyMap.values()).sort((a, b) => b.latestDate.localeCompare(a.latestDate));
  }, [blogsData]);

  const bookCompanyCategories = React.useMemo(() => {
    if (!booksData?.contents) return [];
    const companyMap = new Map<string, { sign: string; name: string; logo: string; count: number; latestDate: string; latestDateCount: number }>();
    booksData.contents.forEach((item) => {
      const existing = companyMap.get(item.company_sign);
      const itemDate = item.created_at.split('T')[0];
      if (existing) {
        existing.count++;
        const existingDate = existing.latestDate.split('T')[0];
        if (itemDate > existingDate) {
          existing.latestDate = item.created_at;
          existing.latestDateCount = 1;
        } else if (itemDate === existingDate) {
          existing.latestDateCount++;
        }
      } else {
        companyMap.set(item.company_sign, {
          sign: item.company_sign,
          name: item.company_title,
          logo: item.company_image,
          count: 1,
          latestDate: item.created_at,
          latestDateCount: 1,
        });
      }
    });
    return Array.from(companyMap.values()).sort((a, b) => b.latestDate.localeCompare(a.latestDate));
  }, [booksData]);

  const courseCompanyCategories = React.useMemo(() => {
    if (!lecturesData?.contents) return [];
    const companyMap = new Map<string, { sign: string; name: string; logo: string; count: number; latestDate: string; latestDateCount: number }>();
    lecturesData.contents.forEach((item) => {
      const existing = companyMap.get(item.company_sign);
      const itemDate = item.created_at.split('T')[0];
      if (existing) {
        existing.count++;
        const existingDate = existing.latestDate.split('T')[0];
        if (itemDate > existingDate) {
          existing.latestDate = item.created_at;
          existing.latestDateCount = 1;
        } else if (itemDate === existingDate) {
          existing.latestDateCount++;
        }
      } else {
        companyMap.set(item.company_sign, {
          sign: item.company_sign,
          name: item.company_title,
          logo: item.company_image,
          count: 1,
          latestDate: item.created_at,
          latestDateCount: 1,
        });
      }
    });
    return Array.from(companyMap.values()).sort((a, b) => b.latestDate.localeCompare(a.latestDate));
  }, [lecturesData]);

  // 회사별 필터링된 블로그
  const filteredBlogs = React.useMemo(() => {
    if (selectedBlogCompany === 'all') return blogCards;
    return blogCards.filter((blog) => blog.companySign === selectedBlogCompany);
  }, [blogCards, selectedBlogCompany]);

  // 날짜별 그룹화된 블로그
  const blogsByDate = React.useMemo(() => {
    return groupByDate(filteredBlogs, (blog) => blog.publishedAt?.split(' ')[0] || 'unknown');
  }, [filteredBlogs]);

  // 주간별 그룹화된 도서/강의
  const booksByWeek = React.useMemo(() => {
    const filtered =
      selectedBookCompany === 'all'
        ? bookCards
        : bookCards.filter((b) => b.companySign === selectedBookCompany);
    return groupByWeek(filtered, (book) => book.createdAt || 'unknown');
  }, [bookCards, selectedBookCompany]);

  const coursesByWeek = React.useMemo(() => {
    const filtered =
      selectedCourseCompany === 'all'
        ? courseCards
        : courseCards.filter((c) => c.companySign === selectedCourseCompany);
    return groupByWeek(filtered, (course) => course.createdAt || 'unknown');
  }, [courseCards, selectedCourseCompany]);

  // 채용공고 클릭 핸들러
  const handleJobClick = (job: JobItemData) => {
    setSelectedContent({
      id: job.id,
      title: job.title,
      summary: job.summary || '',
      externalUrl: job.url,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      isBookmarked: false,
    });
    setDrawerOpen(true);
  };

  // 블로그 클릭 핸들러
  const handleBlogClick = (blog: BlogCardData) => {
    setSelectedContent({
      id: blog.id,
      title: blog.title,
      summary: blog.summary,
      imageUrl: blog.blogMetaImage,
      externalUrl: blog.url,
      companyName: blog.companyName,
      companyLogo: blog.companyLogo,
      isBookmarked: false,
    });
    setDrawerOpen(true);
  };

  // 도서/강의 클릭 핸들러
  const handleContentClick = (item: BookCardData | CourseCardData, type: 'book' | 'course') => {
    const isBook = type === 'book';
    const bookItem = item as BookCardData;
    const courseItem = item as CourseCardData;

    setSelectedContent({
      id: item.id,
      title: item.title,
      summary: item.summary || '',
      imageUrl: item.imageUrl,
      externalUrl: (item as any).url,
      companyName: isBook ? bookItem.publisherName : courseItem.platformName,
      companyLogo: isBook ? bookItem.publisherLogo : courseItem.platformLogo,
      isBookmarked: false,
    });
    setDrawerOpen(true);
  };

  // 콘텐츠 데이터에서 회사별 로고 매핑 추출
  const blogLogoMap = React.useMemo(() => {
    if (!blogsData?.contents) return {};
    const map: Record<string, string> = {};
    blogsData.contents.forEach((item) => {
      if (item.company_sign && item.company_image) {
        map[item.company_sign] = item.company_image;
      }
    });
    return map;
  }, [blogsData]);

  const bookLogoMap = React.useMemo(() => {
    if (!booksData?.contents) return {};
    const map: Record<string, string> = {};
    booksData.contents.forEach((item) => {
      if (item.company_sign && item.company_image) {
        map[item.company_sign] = item.company_image;
      }
    });
    return map;
  }, [booksData]);

  const lectureLogoMap = React.useMemo(() => {
    if (!lecturesData?.contents) return {};
    const map: Record<string, string> = {};
    lecturesData.contents.forEach((item) => {
      if (item.company_sign && item.company_image) {
        map[item.company_sign] = item.company_image;
      }
    });
    return map;
  }, [lecturesData]);

  // 날짜 기반 업데이트 레이블 생성 함수
  const getUpdateLabel = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    return `${diffDays}일 전`;
  };

  // 최신 업데이트 여부 확인 함수 (어제 또는 오늘 - 전날 수집 데이터 표시 기준)
  const isRecentUpdate = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = date.toDateString();
    return dateStr === today.toDateString() || dateStr === yesterday.toDateString();
  };

  // 실제 콘텐츠 데이터 기반 SourceItemData 변환 (모든 회사 표시)
  const blogSourceItems: SourceItemData[] = React.useMemo(() => {
    return blogCompanyCategories.map((company) => ({
      id: company.sign,
      name: company.name,
      logo: company.logo || '',
      updateLabel: getUpdateLabel(company.latestDate),
      changeCount: company.latestDateCount,
      isUpdatedToday: isRecentUpdate(company.latestDate),
    }));
  }, [blogCompanyCategories]);

  const bookSourceItems: SourceItemData[] = React.useMemo(() => {
    return bookCompanyCategories.map((company) => ({
      id: company.sign,
      name: company.name,
      logo: company.logo || '',
      updateLabel: getUpdateLabel(company.latestDate),
      changeCount: company.latestDateCount,
      isUpdatedToday: isRecentUpdate(company.latestDate),
    }));
  }, [bookCompanyCategories]);

  const lectureSourceItems: SourceItemData[] = React.useMemo(() => {
    return courseCompanyCategories.map((company) => ({
      id: company.sign,
      name: company.name,
      logo: company.logo || '',
      updateLabel: getUpdateLabel(company.latestDate),
      changeCount: company.latestDateCount,
      isUpdatedToday: isRecentUpdate(company.latestDate),
    }));
  }, [courseCompanyCategories]);

  // 회사 필터 컴포넌트 (Embla Carousel 기반)
  const CompanyFilter = ({
    companies,
    selected,
    onChange,
    totalCount,
  }: {
    companies: { sign: string; name: string; logo: string; count: number }[];
    selected: string;
    onChange: (sign: string) => void;
    totalCount: number;
  }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: true,
    });

    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const onSelect = React.useCallback(() => {
      if (!emblaApi) return;
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    React.useEffect(() => {
      if (!emblaApi) return;
      onSelect();
      emblaApi.on('select', onSelect);
      emblaApi.on('reInit', onSelect);
      return () => {
        emblaApi.off('select', onSelect);
        emblaApi.off('reInit', onSelect);
      };
    }, [emblaApi, onSelect]);

    return (
      <div className="relative group">
        {/* 좌측 그라데이션 & 버튼 */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 z-10 flex items-center transition-opacity duration-200',
          canScrollPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
          <button
            onClick={scrollPrev}
            className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* 캐러셀 컨테이너 */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-2">
            {/* 전체 버튼 */}
            <button
              onClick={() => onChange('all')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 shrink-0 border',
                selected === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              전체
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-medium',
                selected === 'all'
                  ? 'bg-slate-700 text-slate-200'
                  : 'bg-slate-100 text-slate-500'
              )}>
                {totalCount}
              </span>
            </button>

            {/* 회사 버튼들 */}
            {companies.map((company) => (
              <button
                key={company.sign}
                onClick={() => onChange(company.sign)}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-200 shrink-0 border',
                  selected === company.sign
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}
              >
                {company.logo && (
                  <div className={cn(
                    'w-7 h-7 rounded-full border-2 transition-colors flex-shrink-0 bg-white flex items-center justify-center overflow-hidden',
                    selected === company.sign
                      ? 'border-slate-700'
                      : 'border-slate-200'
                  )}>
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                )}
                <span className="max-w-[100px] truncate font-medium">{company.name}</span>
                <span className={cn(
                  'flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium',
                  selected === company.sign
                    ? 'bg-slate-700 text-slate-200'
                    : 'bg-slate-100 text-slate-500'
                )}>
                  {company.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 우측 그라데이션 & 버튼 */}
        <div className={cn(
          'absolute right-0 top-0 bottom-0 z-10 flex items-center transition-opacity duration-200',
          canScrollNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
          <button
            onClick={scrollNext}
            className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    );
  };

  // 모바일용 수평 필터 칩 컴포넌트 (Embla Carousel)
  const MobileSourceFilter = ({
    sources,
    selected,
    onChange,
    variant = 'purple',
  }: {
    sources: SourceItemData[];
    selected: string;
    onChange: (id: string) => void;
    variant?: 'purple' | 'teal' | 'amber';
  }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: true,
    });

    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const onSelect = React.useCallback(() => {
      if (!emblaApi) return;
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    React.useEffect(() => {
      if (!emblaApi) return;
      onSelect();
      emblaApi.on('select', onSelect);
      emblaApi.on('reInit', onSelect);
      return () => {
        emblaApi.off('select', onSelect);
        emblaApi.off('reInit', onSelect);
      };
    }, [emblaApi, onSelect]);

    const variantStyles = {
      purple: {
        selected: 'bg-purple-600 text-white border-purple-600',
        default: 'bg-white text-slate-700 border-slate-200 hover:border-purple-300',
        badge: 'bg-purple-100 text-purple-700',
        newBadge: 'bg-green-100 text-green-700',
      },
      teal: {
        selected: 'bg-teal-600 text-white border-teal-600',
        default: 'bg-white text-slate-700 border-slate-200 hover:border-teal-300',
        badge: 'bg-teal-100 text-teal-700',
        newBadge: 'bg-green-100 text-green-700',
      },
      amber: {
        selected: 'bg-amber-600 text-white border-amber-600',
        default: 'bg-white text-slate-700 border-slate-200 hover:border-amber-300',
        badge: 'bg-amber-100 text-amber-700',
        newBadge: 'bg-green-100 text-green-700',
      },
    };
    const styles = variantStyles[variant];

    return (
      <div className="lg:hidden relative pb-2">
        {/* 좌측 그라데이션 & 버튼 */}
        <div className={cn(
          'absolute left-0 top-0 bottom-2 z-10 flex items-center transition-opacity duration-200',
          canScrollPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
          <button
            onClick={scrollPrev}
            className="relative z-10 w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-3 h-3 text-slate-600" />
          </button>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center gap-2">
            {/* 전체 버튼 */}
            <button
              onClick={() => onChange('all')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0',
                selected === 'all' ? styles.selected : styles.default
              )}
            >
              전체
            </button>
            {/* 소스 버튼들 */}
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => onChange(source.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full border text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0',
                  selected === source.id ? styles.selected : styles.default
                )}
              >
                {source.logo && (
                  <div className={cn(
                    'w-5 h-5 rounded-full border bg-white flex items-center justify-center overflow-hidden flex-shrink-0',
                    selected === source.id ? 'border-white/30' : 'border-slate-200'
                  )}>
                    <img
                      src={source.logo}
                      alt={source.name}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                )}
                <span className="max-w-[80px] truncate">{source.name}</span>
                {source.isUpdatedToday && selected !== source.id && (
                  <span className={cn('text-[10px] px-1 py-0.5 rounded font-medium', styles.newBadge)}>
                    NEW
                  </span>
                )}
                {source.changeCount !== undefined && source.changeCount > 0 && (
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full font-medium',
                    selected === source.id ? 'bg-white/20 text-white' : styles.badge
                  )}>
                    +{source.changeCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 우측 그라데이션 & 버튼 */}
        <div className={cn(
          'absolute right-0 top-0 bottom-2 z-10 flex items-center transition-opacity duration-200',
          canScrollNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
          <button
            onClick={scrollNext}
            className="relative z-10 w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-3 h-3 text-slate-600" />
          </button>
        </div>
      </div>
    );
  };

  // 날짜 탭 캐러셀 컴포넌트
  const DateTabsCarousel = ({
    dates,
    selected,
    onChange,
    dateStats,
  }: {
    dates: string[];
    selected: string;
    onChange: (date: string) => void;
    dateStats: Record<string, number>;
  }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: true,
    });

    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const onSelect = React.useCallback(() => {
      if (!emblaApi) return;
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    React.useEffect(() => {
      if (!emblaApi) return;
      onSelect();
      emblaApi.on('select', onSelect);
      emblaApi.on('reInit', onSelect);
      return () => {
        emblaApi.off('select', onSelect);
        emblaApi.off('reInit', onSelect);
      };
    }, [emblaApi, onSelect]);

    return (
      <div className="relative">
        {/* 좌측 그라데이션 & 버튼 */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 z-10 flex items-center transition-opacity duration-200',
          canScrollPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
          <button
            onClick={scrollPrev}
            className="relative z-10 w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-3 h-3 text-slate-600" />
          </button>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center gap-2">
            {dates.map((apiDate) => (
              <button
                key={apiDate}
                onClick={() => onChange(apiDate)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0',
                  selected === apiDate
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {formatDateTab(apiDateToDisplayDate(apiDate))}
                {dateStats[apiDate] && (
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    selected === apiDate
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-slate-200 text-slate-500'
                  )}>
                    {dateStats[apiDate].toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 우측 그라데이션 & 버튼 */}
        <div className={cn(
          'absolute right-0 top-0 bottom-0 z-10 flex items-center transition-opacity duration-200',
          canScrollNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
          <button
            onClick={scrollNext}
            className="relative z-10 w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-3 h-3 text-slate-600" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-x-hidden">
      {/* Main Content */}
      <main className="lg:col-span-9 min-w-0">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="pt-2 md:pt-16 pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="hidden md:flex items-center gap-3">
                <Sparkles className="h-10 w-10 text-slate-700" />
                <h1 className="text-3xl font-bold text-slate-900">Discover</h1>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 min-w-0">
                <div className="flex items-center gap-2 overflow-x-auto flex-nowrap scrollbar-hide min-w-0">
                  {[
                    { type: 'jobs' as const, icon: Briefcase, label: '채용공고' },
                    { type: 'blogs' as const, icon: FileText, label: '블로그' },
                    { type: 'books' as const, icon: BookOpen, label: '도서' },
                    { type: 'courses' as const, icon: GraduationCap, label: '강의' },
                  ].map(({ type, icon: Icon, label }) => (
                    <Chip
                      key={type}
                      variant={contentType === type ? 'selected' : 'default'}
                      onClick={() => setContentType(type)}
                      className="shrink-0"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Date Tabs - 채용공고 탭 (Embla Carousel) */}
          {contentType === 'jobs' && (
            <DateTabsCarousel
              dates={availableDates}
              selected={selectedDate}
              onChange={setSelectedDate}
              dateStats={dateStats}
            />
          )}

          {/* Daily Summary Cards */}
          {contentType === 'jobs' && (
            <DailySummaryCard
              date={selectedDate ? apiDateToDisplayDate(selectedDate) : ''}
              summary={`${totalJobCount.toLocaleString()}개의 새로운 채용공고가 등록되었습니다.`}
              totalJobs={totalJobCount}
              totalCompanies={v2MainData?.company_count || new Set(selectedDateJobs.map(j => j.companyName)).size}
              weeklyStats={weeklyStats.map(stat => ({
                ...stat,
                date: apiDateToDisplayDate(stat.date),
              }))}
              selectedDate={selectedDate ? apiDateToDisplayDate(selectedDate) : ''}
              onDateClick={(displayDate) => {
                // 표시 날짜를 API 날짜로 역변환
                const date = new Date(displayDate);
                date.setDate(date.getDate() - 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}
            />
          )}
          {contentType === 'blogs' && (
            <DailySummaryCard
              date={selectedDate}
              summary=""
              totalJobs={blogCards.length}
              totalCompanies={blogRankingData?.rankings?.length || 0}
              title="최근 1달간의 블로그 현황"
              unitLabel="개 발행"
              sourceLabel="개 블로그"
              chartColor="purple"
            />
          )}
          {contentType === 'books' && (
            <DailySummaryCard
              date={selectedDate}
              summary=""
              totalJobs={bookCards.length}
              totalCompanies={bookRankingData?.rankings?.length || 0}
              title="최근 1달간의 도서 현황"
              unitLabel="권 등록"
              sourceLabel="개 출판사"
              chartColor="teal"
            />
          )}
          {contentType === 'courses' && (
            <DailySummaryCard
              date={selectedDate}
              summary=""
              totalJobs={courseCards.length}
              totalCompanies={lectureRankingData?.rankings?.length || 0}
              title="최근 1달간의 강의 현황"
              unitLabel="개 등록"
              sourceLabel="개 플랫폼"
              chartColor="amber"
            />
          )}
        </div>

        {/* Content Feed */}
        {contentType === 'jobs' ? (
          <div className="space-y-4 mt-6">
            {/* 국내/글로벌 탭 - 기업 필터보다 상위 */}
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                onClick={() => {
                  setCompanyTypeTab('domestic');
                  setSelectedCompanyFilter(null);
                }}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                  companyTypeTab === 'domestic'
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                )}
              >
                국내 <span className="text-xs text-slate-400">({domesticJobCount})</span>
              </button>
              <button
                onClick={() => {
                  setCompanyTypeTab('global');
                  setSelectedCompanyFilter(null);
                }}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                  companyTypeTab === 'global'
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                )}
              >
                글로벌 <span className="text-xs text-slate-400">({globalJobCount})</span>
              </button>
            </div>

            {/* 기업 필터 - 탭에 따라 필터링된 기업만 표시 */}
            {filteredByTabCompanyList.length > 0 && (
              <CompanyFilterCarousel
                companies={filteredByTabCompanyList}
                selectedCompany={selectedCompanyFilter}
                onSelectCompany={setSelectedCompanyFilter}
              />
            )}

            {isJobsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* 탭에 따른 채용공고 표시 */}
                {companyTypeTab === 'domestic' && domesticJobs.length > 0 && (
                  <div className="space-y-2">
                    {domesticJobs.map((job) => (
                      <JobListItem
                        key={job.id}
                        job={job}
                        onClick={() => handleJobClick(job)}
                      />
                    ))}
                  </div>
                )}

                {companyTypeTab === 'global' && globalJobs.length > 0 && (
                  <div className="space-y-2">
                    {globalJobs.map((job) => (
                      <JobListItem
                        key={job.id}
                        job={job}
                        onClick={() => handleJobClick(job)}
                      />
                    ))}
                  </div>
                )}

                {/* 선택한 탭에 데이터가 없을 때 */}
                {companyTypeTab === 'domestic' && domesticJobs.length === 0 && (
                  <EmptyState message="국내 기업 채용공고가 없습니다" description="다른 날짜나 탭을 선택해보세요." />
                )}
                {companyTypeTab === 'global' && globalJobs.length === 0 && (
                  <EmptyState message="글로벌 기업 채용공고가 없습니다" description="다른 날짜나 탭을 선택해보세요." />
                )}

                {/* 더 불러오기 버튼 */}
                {hasNextPage && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          불러오는 중...
                        </>
                      ) : (
                        '더 보기'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : contentType === 'blogs' ? (
          <div className="space-y-6 mt-6">
            {/* 모바일 필터 칩 */}
            <MobileSourceFilter
              sources={blogSourceItems}
              selected={selectedBlogCompany}
              onChange={setSelectedBlogCompany}
              variant="purple"
            />
            {isBlogsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredBlogs.length > 0 ? (
              Object.keys(blogsByDate)
                .sort((a, b) => b.localeCompare(a))
                .map((dateKey) => (
                  <div key={dateKey}>
                    <DateDivider label={formatDateHeader(dateKey)} />
                    <div className="space-y-3">
                      {blogsByDate[dateKey].map((blog) => (
                        <BlogCard
                          key={blog.id}
                          blog={blog}
                          dateLabel={formatShortDate(dateKey)}
                          onClick={() => handleBlogClick(blog)}
                        />
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <EmptyState message="해당 회사의 블로그가 없습니다" description="다른 회사를 선택해보세요." />
            )}
          </div>
        ) : contentType === 'books' ? (
          <div className="space-y-6 mt-6">
            {/* 모바일 필터 칩 */}
            <MobileSourceFilter
              sources={bookSourceItems}
              selected={selectedBookCompany}
              onChange={setSelectedBookCompany}
              variant="teal"
            />
            {isBooksLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : Object.keys(booksByWeek).length > 0 ? (
              Object.keys(booksByWeek)
                .sort((a, b) => b.localeCompare(a))
                .map((weekKey) => (
                  <div key={weekKey}>
                    <DateDivider label={formatWeekHeader(weekKey)} />
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {booksByWeek[weekKey].map((book) => (
                        <BookCard
                          key={book.id}
                          book={book}
                          onClick={() => handleContentClick(book, 'book')}
                        />
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <EmptyState message="해당 출판사의 도서가 없습니다" description="다른 출판사를 선택해보세요." />
            )}
          </div>
        ) : contentType === 'courses' ? (
          <div className="space-y-6 mt-6">
            {/* 모바일 필터 칩 */}
            <MobileSourceFilter
              sources={lectureSourceItems}
              selected={selectedCourseCompany}
              onChange={setSelectedCourseCompany}
              variant="amber"
            />
            {isLecturesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : Object.keys(coursesByWeek).length > 0 ? (
              Object.keys(coursesByWeek)
                .sort((a, b) => b.localeCompare(a))
                .map((weekKey) => (
                  <div key={weekKey}>
                    <DateDivider label={formatWeekHeader(weekKey)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coursesByWeek[weekKey].map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onClick={() => handleContentClick(course, 'course')}
                        />
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <EmptyState message="해당 플랫폼의 강의가 없습니다" description="다른 플랫폼을 선택해보세요." />
            )}
          </div>
        ) : null}
      </main>

      {/* Right Sidebar */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="space-y-4 pt-16">
          {/* Header - 콘텐츠 타입별 */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <div className="relative flex h-2.5 w-2.5">
                <span className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  contentType === 'jobs' ? 'bg-teal-400' :
                  contentType === 'blogs' ? 'bg-purple-400' :
                  contentType === 'books' ? 'bg-emerald-400' : 'bg-amber-400'
                )}></span>
                <span className={cn(
                  'relative inline-flex rounded-full h-2.5 w-2.5',
                  contentType === 'jobs' ? 'bg-teal-500' :
                  contentType === 'blogs' ? 'bg-purple-500' :
                  contentType === 'books' ? 'bg-emerald-500' : 'bg-amber-500'
                )}></span>
              </div>
              {contentType === 'jobs' ? '수집 출처' :
               contentType === 'blogs' ? '블로그 출처' :
               contentType === 'books' ? '도서 출처' : '강의 출처'}
            </h3>
            <span className="text-xs text-slate-400">
              {contentType === 'jobs' ? `${companyFilterList.length}개 기업` :
               contentType === 'blogs' ? `${blogCompanyCategories.length}개 출처` :
               contentType === 'books' ? `${bookCompanyCategories.length}개 출처` :
               `${courseCompanyCategories.length}개 출처`}
            </span>
          </div>

          {/* Stats - 콘텐츠 타입별 */}
          {contentType === 'jobs' ? (
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-teal-600 mb-1 font-medium">
                    {selectedDate ? formatDateTab(apiDateToDisplayDate(selectedDate)) : '오늘'} 업데이트
                  </div>
                  <div className="text-xl font-bold text-teal-700">
                    +{totalJobCount.toLocaleString()}건
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-teal-200" />
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-teal-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-teal-600">국내</span>
                  <span className="text-sm font-semibold text-teal-700">+{domesticJobCount.toLocaleString()}</span>
                </div>
                <div className="w-px h-3 bg-teal-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-teal-600">글로벌</span>
                  <span className="text-sm font-semibold text-teal-700">+{globalJobCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : contentType === 'blogs' ? (
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-purple-600 mb-1 font-medium">최근 1개월 수집</div>
                  <div className="text-xl font-bold text-purple-700">
                    {blogCards.length.toLocaleString()}건
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-purple-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-purple-600">출처</span>
                  <span className="text-sm font-semibold text-purple-700">{blogCompanyCategories.length}개</span>
                </div>
              </div>
            </div>
          ) : contentType === 'books' ? (
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-600 mb-1 font-medium">최근 1개월 수집</div>
                  <div className="text-xl font-bold text-emerald-700">
                    {bookCards.length.toLocaleString()}건
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-200" />
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-emerald-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-emerald-600">출판사</span>
                  <span className="text-sm font-semibold text-emerald-700">{bookCompanyCategories.length}개</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-600 mb-1 font-medium">최근 1개월 수집</div>
                  <div className="text-xl font-bold text-amber-700">
                    {courseCards.length.toLocaleString()}건
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-200" />
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-amber-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-amber-600">플랫폼</span>
                  <span className="text-sm font-semibold text-amber-700">{courseCompanyCategories.length}개</span>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Sidebar */}
          {contentType === 'jobs' && (
            <JobsSidebar
              recentCompanies={filteredByTabCompanyList}
              selectedCompany={selectedCompanyFilter}
              onSelectCompany={setSelectedCompanyFilter}
              formUrl={COMPANY_REGISTRATION_FORM_URL}
            />
          )}

          {/* Blogs Sidebar */}
          {contentType === 'blogs' && (
            <SourceSidebar
              title="블로그"
              sources={blogSourceItems}
              variant="purple"
              selectedSource={selectedBlogCompany === 'all' ? null : selectedBlogCompany}
              onSelectSource={(id) => setSelectedBlogCompany(id || 'all')}
              ctaLabel="블로그 수집 요청하기"
              ctaUrl={COMPANY_REGISTRATION_FORM_URL}
            />
          )}

          {/* Books Sidebar */}
          {contentType === 'books' && (
            <SourceSidebar
              title="출판사"
              sources={bookSourceItems}
              variant="teal"
              selectedSource={selectedBookCompany === 'all' ? null : selectedBookCompany}
              onSelectSource={(id) => setSelectedBookCompany(id || 'all')}
              ctaLabel="출판사 수집 요청하기"
              ctaUrl={COMPANY_REGISTRATION_FORM_URL}
            />
          )}

          {/* Courses Sidebar */}
          {contentType === 'courses' && (
            <SourceSidebar
              title="플랫폼"
              sources={lectureSourceItems}
              variant="amber"
              selectedSource={selectedCourseCompany === 'all' ? null : selectedCourseCompany}
              onSelectSource={(id) => setSelectedCourseCompany(id || 'all')}
              ctaLabel="플랫폼 수집 요청하기"
              ctaUrl={COMPANY_REGISTRATION_FORM_URL}
            />
          )}

          {/* Footer */}
          <SidebarFooter />
        </div>
      </aside>

      {/* Detail Drawer */}
      <ContentDetailDrawer
        open={drawerOpen}
        content={selectedContent}
        contentType={contentType}
        onClose={() => setDrawerOpen(false)}
        onContentChange={setSelectedContent}
      />
    </div>
  );
}

// 하위 컴포넌트들

function EmptyState({ message, description }: { message: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
        <Search className="h-7 w-7 text-slate-300" />
      </div>
      <h3 className="text-base font-medium text-slate-900 mb-1">{message}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-3 mb-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  isLoading: boolean;
}

function InfiniteScrollTrigger({ onIntersect, isLoading }: InfiniteScrollTriggerProps) {
  const triggerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onIntersect();
        }
      },
      { threshold: 0.1 }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [onIntersect, isLoading]);

  return (
    <div ref={triggerRef} className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  );
}

interface RecentCompanyItem {
  sign: string;
  name: string;
  logo: string;
  jobCount: number;
  type: 'domestic' | 'global';
  updatedAt: string;
}

interface JobsSidebarProps {
  recentCompanies: RecentCompanyItem[];
  selectedCompany: string | null;
  onSelectCompany: (sign: string | null) => void;
  formUrl: string;
}

function JobsSidebar({
  recentCompanies,
  selectedCompany,
  onSelectCompany,
  formUrl,
}: JobsSidebarProps) {
  return (
    <div className="space-y-4">
      {/* 업데이트 기업 */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          업데이트 기업 ({recentCompanies.length}개)
        </h4>
        <div className="space-y-2">
          {/* 전체 옵션 */}
          <div
            onClick={() => onSelectCompany(null)}
            className={cn(
              'group block p-2.5 rounded-lg transition-colors border cursor-pointer',
              !selectedCompany
                ? 'bg-teal-50 border-teal-200'
                : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-500">All</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    'text-sm font-medium transition-colors truncate',
                    !selectedCompany ? 'text-teal-700' : 'text-slate-900 group-hover:text-teal-700'
                  )}>
                    전체
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  모든 기업 보기
                </div>
              </div>
            </div>
          </div>
          {recentCompanies.map((company) => {
            const isSelected = selectedCompany === company.sign;
            return (
              <div
                key={company.sign}
                onClick={() => onSelectCompany(isSelected ? null : company.sign)}
                className={cn(
                  'group block p-2.5 rounded-lg transition-colors border cursor-pointer',
                  isSelected
                    ? 'bg-teal-50 border-teal-200'
                    : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                )}
              >
                <div className="flex items-start gap-3">
                  <CompanyLogo company={{ name: company.name, logo: company.logo }} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        'text-sm font-medium transition-colors truncate',
                        isSelected ? 'text-teal-700' : 'text-slate-900 group-hover:text-teal-700'
                      )}>
                        {company.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="text-teal-600 font-medium">+{company.jobCount}건</span>
                      <span>·</span>
                      <span className="text-slate-400">{company.type === 'domestic' ? '국내' : '글로벌'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>우리 회사도 등록 신청하기</span>
        </a>
      </div>
    </div>
  );
}

interface SourceSidebarProps {
  title: string;
  sources: SourceItemData[];
  variant: 'purple' | 'teal' | 'amber';
  selectedSource: string | null;
  onSelectSource: (id: string | null) => void;
  ctaLabel: string;
  ctaUrl: string;
}

function SourceSidebar({
  title,
  sources,
  variant,
  selectedSource,
  onSelectSource,
  ctaLabel,
  ctaUrl,
}: SourceSidebarProps) {
  const colorConfig = {
    purple: {
      dot: 'bg-purple-500',
      ctaBg: 'bg-purple-50 hover:bg-purple-100',
      ctaBorder: 'border-purple-200',
      ctaText: 'text-purple-700 hover:text-purple-900',
    },
    teal: {
      dot: 'bg-teal-500',
      ctaBg: 'bg-teal-50 hover:bg-teal-100',
      ctaBorder: 'border-teal-200',
      ctaText: 'text-teal-700 hover:text-teal-900',
    },
    amber: {
      dot: 'bg-amber-500',
      ctaBg: 'bg-amber-50 hover:bg-amber-100',
      ctaBorder: 'border-amber-200',
      ctaText: 'text-amber-700 hover:text-amber-900',
    },
  };

  const config = colorConfig[variant];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)}></span>
          {title} ({sources.length}개)
        </h4>
        <div className="space-y-1">
          {/* 전체 옵션 */}
          <div
            onClick={() => onSelectSource(null)}
            className={cn(
              'group flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer border',
              !selectedSource
                ? variant === 'purple' ? 'bg-purple-50 border-purple-200'
                  : variant === 'teal' ? 'bg-teal-50 border-teal-200'
                  : 'bg-amber-50 border-amber-200'
                : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-500">All</span>
              </div>
              <span className={cn(
                'text-sm font-medium transition-colors',
                !selectedSource
                  ? variant === 'purple' ? 'text-purple-700'
                    : variant === 'teal' ? 'text-teal-700'
                    : 'text-amber-700'
                  : 'text-slate-700'
              )}>
                전체
              </span>
            </div>
          </div>
          {sources.map((source) => (
            <SourceListItem
              key={source.id}
              source={source}
              variant={variant}
              isSelected={selectedSource === source.id}
              onClick={() => onSelectSource(selectedSource === source.id ? null : source.id)}
            />
          ))}
        </div>

        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 border rounded-lg text-sm transition-colors',
            config.ctaBg,
            config.ctaBorder,
            config.ctaText
          )}
        >
          <Plus className="w-4 h-4" />
          <span>{ctaLabel}</span>
        </a>
      </div>
    </div>
  );
}

// 기업 필터 캐러셀 컴포넌트
interface CompanyFilterCarouselProps {
  companies: {
    sign: string;
    name: string;
    logo: string;
    jobCount: number;
    type: 'domestic' | 'global';
  }[];
  selectedCompany: string | null;
  onSelectCompany: (sign: string | null) => void;
}

function CompanyFilterCarousel({ companies, selectedCompany, onSelectCompany }: CompanyFilterCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const totalJobCount = companies.reduce((sum, c) => sum + c.jobCount, 0);

  return (
    <div className="relative group">
      {/* 좌측 그라데이션 & 버튼 */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 z-10 flex items-center transition-opacity duration-200',
        canScrollPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
        <button
          onClick={scrollPrev}
          className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* 캐러셀 컨테이너 */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2">
          {/* 전체 버튼 */}
          <button
            onClick={() => onSelectCompany(null)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 shrink-0',
              !selectedCompany
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            전체
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-medium',
              !selectedCompany
                ? 'bg-slate-700 text-slate-200'
                : 'bg-slate-200 text-slate-500'
            )}>
              {totalJobCount.toLocaleString()}
            </span>
          </button>

          {/* 기업 버튼들 */}
          {companies.map((company) => (
            <button
              key={company.sign}
              onClick={() => onSelectCompany(
                selectedCompany === company.sign ? null : company.sign
              )}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-200 shrink-0',
                selectedCompany === company.sign
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {company.logo && (
                <div className={cn(
                  'w-7 h-7 rounded-full border-2 transition-colors flex-shrink-0 bg-white flex items-center justify-center overflow-hidden',
                  selectedCompany === company.sign
                    ? 'border-slate-700'
                    : 'border-slate-200'
                )}>
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-5 h-5 object-contain"
                  />
                </div>
              )}
              <span className="max-w-[100px] truncate font-medium">{company.name}</span>
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-medium',
                selectedCompany === company.sign
                  ? 'bg-slate-700 text-slate-200'
                  : 'bg-slate-200 text-slate-500'
              )}>
                {company.jobCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 우측 그라데이션 & 버튼 */}
      <div className={cn(
        'absolute right-0 top-0 bottom-0 z-10 flex items-center transition-opacity duration-200',
        canScrollNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
        <button
          onClick={scrollNext}
          className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

interface CompanyLogoProps {
  company: { name: string; logo?: string; isPremium?: boolean };
  size?: 'sm' | 'lg';
  showBadge?: boolean;
  grayscale?: boolean;
}

function CompanyLogo({ company, size = 'sm', showBadge = false, grayscale = false }: CompanyLogoProps) {
  const sizeClass = size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const badgeSize = size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const badgeIconSize = size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5';
  const badgePosition = size === 'lg' ? '-top-1 -right-1' : '-top-0.5 -right-0.5';

  return (
    <div className="relative flex-shrink-0">
      <div
        className={cn(
          sizeClass,
          'rounded-lg bg-white border flex items-center justify-center overflow-hidden',
          grayscale ? 'border-slate-200 bg-slate-100' : 'border-slate-100'
        )}
      >
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className={cn('w-full h-full object-contain p-0.5', grayscale && 'grayscale')}
          />
        ) : (
          <span className="text-xs font-bold text-slate-400">{company.name[0]}</span>
        )}
      </div>
      {showBadge && (
        <div
          className={cn(
            'absolute bg-teal-500 rounded-full flex items-center justify-center',
            badgePosition,
            badgeSize
          )}
        >
          <BadgeCheck className={cn('text-white', badgeIconSize)} />
        </div>
      )}
    </div>
  );
}
