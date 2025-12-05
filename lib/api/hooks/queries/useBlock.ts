/**
 * Block 관련 React Query 훅
 */

'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { isUserBlocked, getBlockedUsers } from '../../services/block.service';
import type { PaginatedBlockedUsersResponse } from '../../types/block.types';

/**
 * Block 쿼리 키
 */
export const blockKeys = {
  all: ['block'] as const,
  lists: () => [...blockKeys.all, 'list'] as const,
  list: (page?: number) => [...blockKeys.lists(), { page }] as const,
  isBlocked: (userId: number) => [...blockKeys.all, 'is-blocked', userId] as const,
};

/**
 * 사용자 차단 상태 확인 훅
 */
export function useIsUserBlocked(
  userId: number,
  options?: Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<boolean, Error>({
    queryKey: blockKeys.isBlocked(userId),
    queryFn: () => isUserBlocked(userId),
    enabled: !!userId && userId > 0,
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

/**
 * 차단된 사용자 목록 조회 훅
 */
export function useBlockedUsers(
  page?: number,
  options?: Omit<UseQueryOptions<PaginatedBlockedUsersResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedBlockedUsersResponse, Error>({
    queryKey: blockKeys.list(page),
    queryFn: () => getBlockedUsers(page),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}
