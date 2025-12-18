/**
 * Somoon Recruits API React Query 훅
 */

import { useQuery, useInfiniteQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  getRecruitsContents,
  searchCompaniesJobs,
  getTrendReport,
  getCompanyInfo,
  getContentsRanking,
  searchJobsByKeyword,
  getV2MainData,
  getJobsByIds,
  getContentsByIds,
} from '../../services/somoon-recruits.service';
import type {
  RecruitsContentsMainResponse,
  GetRecruitsContentsParams,
  RecruitsSearchJobsResponse,
  SearchCompaniesJobsParams,
  RecruitsTrendReportResponse,
  GetTrendReportParams,
  RecruitsCompanyInfoResponse,
  RecruitsContentRankingResponse,
  RecruitsContentType,
  SearchJobsByKeywordParams,
  RecruitsKeywordSearchResponse,
  RecruitsV2MainResponse,
  RecruitsJobsByIdsResponse,
  RecruitsContentsByIdsResponse,
} from '../../types/somoon-recruits.types';

// Query Keys
export const somoonRecruitsKeys = {
  all: ['somoon-recruits'] as const,
  contents: () => [...somoonRecruitsKeys.all, 'contents'] as const,
  contentsList: (params: GetRecruitsContentsParams) =>
    [...somoonRecruitsKeys.contents(), params] as const,
  contentsByIds: (ids: string) =>
    [...somoonRecruitsKeys.contents(), 'by-ids', ids] as const,
  jobs: () => [...somoonRecruitsKeys.all, 'jobs'] as const,
  jobsSearch: (params: SearchCompaniesJobsParams) =>
    [...somoonRecruitsKeys.jobs(), 'search', params] as const,
  jobsKeyword: (query: string, page?: number, size?: number) =>
    [...somoonRecruitsKeys.jobs(), 'keyword', query, page, size] as const,
  jobsByIds: (ids: string) =>
    [...somoonRecruitsKeys.jobs(), 'by-ids', ids] as const,
  v2Main: () => [...somoonRecruitsKeys.all, 'v2-main'] as const,
  trendReport: (params?: GetTrendReportParams) =>
    [...somoonRecruitsKeys.all, 'trend-report', params] as const,
  companyInfo: (signs: string) =>
    [...somoonRecruitsKeys.all, 'company-info', signs] as const,
  contentsRanking: (contentType: RecruitsContentType, showMonthlyChange?: boolean) =>
    [...somoonRecruitsKeys.all, 'contents-ranking', contentType, showMonthlyChange] as const,
};

/**
 * 콘텐츠 목록 조회 훅
 */
export function useRecruitsContents(
  params: GetRecruitsContentsParams,
  options?: Omit<UseQueryOptions<RecruitsContentsMainResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: somoonRecruitsKeys.contentsList(params),
    queryFn: () => getRecruitsContents(params),
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

/**
 * 회사별 채용공고 검색 훅
 */
export function useSearchCompaniesJobs(
  params: SearchCompaniesJobsParams,
  options?: Omit<UseQueryOptions<RecruitsSearchJobsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: somoonRecruitsKeys.jobsSearch(params),
    queryFn: () => searchCompaniesJobs(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * 회사별 채용공고 검색 무한 스크롤 훅
 */
export function useInfiniteSearchCompaniesJobs(
  params: Omit<SearchCompaniesJobsParams, 'page'>,
  options?: { enabled?: boolean }
) {
  const pageSize = params.size || 10;
  return useInfiniteQuery({
    queryKey: somoonRecruitsKeys.jobsSearch({ ...params, page: 1 }),
    queryFn: ({ pageParam = 1 }) =>
      searchCompaniesJobs({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      // 현재 페이지 수 * 페이지 사이즈가 전체 개수보다 작으면 다음 페이지 있음
      const loadedCount = allPages.length * pageSize;
      if (loadedCount < lastPage.total_count) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * 트렌드 리포트 조회 훅
 */
export function useTrendReport(
  params?: GetTrendReportParams,
  options?: Omit<UseQueryOptions<RecruitsTrendReportResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: somoonRecruitsKeys.trendReport(params),
    queryFn: () => getTrendReport(params),
    staleTime: 30 * 60 * 1000, // 30분
    ...options,
  });
}

/**
 * 회사 정보 조회 훅
 */
export function useCompanyInfo(
  signs: string,
  options?: Omit<UseQueryOptions<RecruitsCompanyInfoResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: somoonRecruitsKeys.companyInfo(signs),
    queryFn: () => getCompanyInfo(signs),
    staleTime: 60 * 60 * 1000, // 1시간
    enabled: !!signs,
    ...options,
  });
}

/**
 * 콘텐츠 랭킹 조회 훅
 */
export function useContentsRanking(
  contentType: RecruitsContentType,
  showMonthlyChange = false,
  options?: Omit<UseQueryOptions<RecruitsContentRankingResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: somoonRecruitsKeys.contentsRanking(contentType, showMonthlyChange),
    queryFn: () => getContentsRanking(contentType, showMonthlyChange),
    staleTime: 30 * 60 * 1000, // 30분
    ...options,
  });
}

/**
 * 키워드로 채용공고 검색 훅 (날짜 필터 지원)
 */
export function useSearchJobsByKeyword(
  params: SearchJobsByKeywordParams,
  options?: Omit<UseQueryOptions<RecruitsKeywordSearchResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: somoonRecruitsKeys.jobsKeyword(params.query, params.page, params.size),
    queryFn: () => searchJobsByKeyword(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * 키워드로 채용공고 검색 무한 스크롤 훅 (날짜 필터 지원)
 */
export function useInfiniteSearchJobsByKeyword(
  params: Omit<SearchJobsByKeywordParams, 'page'>,
  options?: { enabled?: boolean }
) {
  const pageSize = params.size || 20;
  return useInfiniteQuery({
    queryKey: [...somoonRecruitsKeys.jobs(), 'keyword-infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      searchJobsByKeyword({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.length * pageSize;
      if (loadedCount < lastPage.total_count) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * V2 메인 데이터 조회 훅 (일별 통계 + 회사별 채용공고)
 */
export function useV2MainData(
  options?: Omit<UseQueryOptions<RecruitsV2MainResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: somoonRecruitsKeys.v2Main(),
    queryFn: getV2MainData,
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

/**
 * 채용공고 ID로 상세 정보 조회 훅
 * @param ids 쉼표로 구분된 채용공고 ID 또는 ID 배열
 */
export function useJobsByIds(
  ids: string | number[] | null | undefined,
  options?: Omit<UseQueryOptions<RecruitsJobsByIdsResponse>, 'queryKey' | 'queryFn'>
) {
  const idsString = Array.isArray(ids) ? ids.join(',') : (ids || '');
  return useQuery({
    queryKey: somoonRecruitsKeys.jobsByIds(idsString),
    queryFn: () => getJobsByIds(idsString),
    staleTime: 5 * 60 * 1000, // 5분
    enabled: !!ids && (Array.isArray(ids) ? ids.length > 0 : ids.length > 0),
    ...options,
  });
}

/**
 * 콘텐츠(블로그/도서/강의) ID로 상세 정보 조회 훅
 * @param ids 쉼표로 구분된 콘텐츠 ID 또는 ID 배열
 */
export function useContentsByIds(
  ids: string | number[] | null | undefined,
  options?: Omit<UseQueryOptions<RecruitsContentsByIdsResponse>, 'queryKey' | 'queryFn'>
) {
  const idsString = Array.isArray(ids) ? ids.join(',') : (ids || '');
  return useQuery({
    queryKey: somoonRecruitsKeys.contentsByIds(idsString),
    queryFn: () => getContentsByIds(idsString),
    staleTime: 5 * 60 * 1000, // 5분
    enabled: !!ids && (Array.isArray(ids) ? ids.length > 0 : ids.length > 0),
    ...options,
  });
}
