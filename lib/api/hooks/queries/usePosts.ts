/**
 * Posts 관련 React Query 훅
 */

'use client';

import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { getPosts, getPost } from '../../services/posts.service';
import type { Post, PaginatedPostResponse } from '../../types/posts.types';

/**
 * Posts 쿼리 키
 */
export const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (page?: number) => [...postsKeys.lists(), { page }] as const,
  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (id: number) => [...postsKeys.details(), id] as const,
};

/**
 * 게시물 목록 조회 훅
 */
export function usePosts(
  params?: { page?: number },
  options?: Omit<UseQueryOptions<PaginatedPostResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedPostResponse, Error>({
    queryKey: postsKeys.list(params?.page),
    queryFn: () => getPosts(params?.page),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

/**
 * 게시물 상세 조회 훅
 */
export function usePost(
  id: number,
  options?: Omit<UseQueryOptions<Post, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Post, Error>({
    queryKey: postsKeys.detail(id),
    queryFn: () => getPost(id),
    enabled: !!id && id > 0,
    staleTime: 3 * 60 * 1000, // 3분
    gcTime: 15 * 60 * 1000, // 15분
    ...options,
  });
}

/**
 * 게시물 무한 스크롤 훅
 */
export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: postsKeys.lists(),
    queryFn: ({ pageParam = 1 }) => getPosts(pageParam as number),
    getNextPageParam: (lastPage: PaginatedPostResponse, allPages: PaginatedPostResponse[]) => {
      // next가 있으면 다음 페이지 번호 반환
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
