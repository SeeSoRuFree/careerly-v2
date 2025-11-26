/**
 * Somoon Contents 관련 React Query 훅
 */

'use client';

import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { getDailyContents } from '../../services/contents.service';
import type {
  SomoonDailyContent,
  SomoonPaginatedResponse,
  GetDailyContentsParams,
} from '../../types/somoon.types';

/**
 * Contents 쿼리 키
 */
export const contentsKeys = {
  all: ['contents'] as const,
  daily: () => [...contentsKeys.all, 'daily'] as const,
  dailyList: (params?: GetDailyContentsParams) =>
    [...contentsKeys.daily(), params] as const,
};

/**
 * Daily contents 목록 조회 훅
 * @param params 페이지네이션 파라미터
 * @param options React Query 옵션
 * @returns Daily contents 쿼리 결과
 */
export function useDailyContents(
  params?: GetDailyContentsParams,
  options?: Omit<
    UseQueryOptions<SomoonPaginatedResponse<SomoonDailyContent>, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<SomoonPaginatedResponse<SomoonDailyContent>, Error>({
    queryKey: contentsKeys.dailyList(params),
    queryFn: () => getDailyContents(params),
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

/**
 * Daily contents 무한 스크롤 훅
 */
export function useInfiniteDailyContents(
  params?: Omit<GetDailyContentsParams, 'page'>
) {
  return useInfiniteQuery({
    queryKey: ['contents', 'daily', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => getDailyContents({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage: SomoonPaginatedResponse<SomoonDailyContent>, allPages: SomoonPaginatedResponse<SomoonDailyContent>[]) => {
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
