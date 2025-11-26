/**
 * Somoon Jobs 관련 React Query 훅
 */

'use client';

import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { getDailyJobs } from '../../services/jobs.service';
import type {
  SomoonJobItem,
  SomoonPaginatedResponse,
  GetDailyJobsParams,
} from '../../types/somoon.types';

/**
 * Jobs 쿼리 키
 */
export const jobsKeys = {
  all: ['jobs'] as const,
  daily: () => [...jobsKeys.all, 'daily'] as const,
  dailyList: (params?: GetDailyJobsParams) =>
    [...jobsKeys.daily(), params] as const,
};

/**
 * Daily jobs 목록 조회 훅
 * @param params 페이지네이션 파라미터
 * @param options React Query 옵션
 * @returns Daily jobs 쿼리 결과
 */
export function useDailyJobs(
  params?: GetDailyJobsParams,
  options?: Omit<
    UseQueryOptions<SomoonPaginatedResponse<SomoonJobItem>, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<SomoonPaginatedResponse<SomoonJobItem>, Error>({
    queryKey: jobsKeys.dailyList(params),
    queryFn: () => getDailyJobs(params),
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

/**
 * Daily jobs 무한 스크롤 훅
 */
export function useInfiniteDailyJobs(
  params?: Omit<GetDailyJobsParams, 'page'>
) {
  return useInfiniteQuery({
    queryKey: [...jobsKeys.daily(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) => getDailyJobs({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage: SomoonPaginatedResponse<SomoonJobItem>, allPages: SomoonPaginatedResponse<SomoonJobItem>[]) => {
      // next가 있으면 다음 페이지 번호 반환
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
