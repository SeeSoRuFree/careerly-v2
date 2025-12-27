/**
 * Posts 관련 React Query 훅
 */

'use client';

import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData } from '@tanstack/react-query';
import { getPosts, getPost, getPopularPosts, getTopPosts, getRecommendedPosts, getRecommendedPostsPaginated, getFollowingPosts, isPostLiked, isPostSaved, getPostLikers } from '../../services/posts.service';
import type { TopPostsPeriod, GetPostsParams, GetPostLikersParams } from '../../services/posts.service';
import type { Post, PostListItem, PaginatedPostResponse, PaginatedLikersResponse } from '../../types/posts.types';

/**
 * Posts 쿼리 키
 */
export const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (page?: number) => [...postsKeys.lists(), { page }] as const,
  following: (page?: number) => [...postsKeys.all, 'following', { page }] as const,
  popular: (limit?: number) => [...postsKeys.all, 'popular', { limit }] as const,
  top: (period: TopPostsPeriod, limit?: number) => [...postsKeys.all, 'top', { period, limit }] as const,
  recommended: (limit?: number) => [...postsKeys.all, 'recommended', { limit }] as const,
  recommendedPaginated: (params?: { page_size?: number }) => [...postsKeys.all, 'recommend', params] as const,
  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (id: number) => [...postsKeys.details(), id] as const,
  likeStatus: (id: number) => [...postsKeys.all, 'like-status', id] as const,
  saveStatus: (id: number) => [...postsKeys.all, 'save-status', id] as const,
  likers: (id: number) => [...postsKeys.all, 'likers', id] as const,
};

/**
 * 게시물 목록 조회 훅
 */
export function usePosts(
  params?: GetPostsParams,
  options?: Omit<UseQueryOptions<PaginatedPostResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedPostResponse, Error>({
    queryKey: postsKeys.list(params?.page),
    queryFn: () => getPosts(params),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

/**
 * 팔로잉 피드 조회 훅
 */
export function useFollowingPosts(
  page?: number,
  options?: Omit<UseQueryOptions<PaginatedPostResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedPostResponse, Error>({
    queryKey: postsKeys.following(page),
    queryFn: () => getFollowingPosts(page),
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
export function useInfinitePosts(
  params?: Omit<GetPostsParams, 'page'>,
  options?: Omit<UseInfiniteQueryOptions<PaginatedPostResponse, Error, InfiniteData<PaginatedPostResponse>, readonly unknown[], number>, 'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'>
) {
  return useInfiniteQuery<PaginatedPostResponse, Error, InfiniteData<PaginatedPostResponse>, readonly unknown[], number>({
    queryKey: [...postsKeys.lists(), params],
    queryFn: ({ pageParam }) => getPosts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      // next가 있으면 다음 페이지 번호 반환
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

/**
 * 게시물 좋아요 여부 조회 훅
 */
export function usePostLikeStatus(
  postId: number,
  options?: Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<boolean, Error>({
    queryKey: postsKeys.likeStatus(postId),
    queryFn: () => isPostLiked(postId),
    enabled: !!postId && postId > 0,
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

/**
 * 게시물 북마크 여부 조회 훅
 */
export function usePostSaveStatus(
  postId: number,
  options?: Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<boolean, Error>({
    queryKey: postsKeys.saveStatus(postId),
    queryFn: () => isPostSaved(postId),
    enabled: !!postId && postId > 0,
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

/**
 * 인기 게시물 조회 훅 (좋아요 순)
 */
export function usePopularPosts(
  limit: number = 5,
  options?: Omit<UseQueryOptions<PaginatedPostResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedPostResponse, Error>({
    queryKey: postsKeys.popular(limit),
    queryFn: () => getPopularPosts(limit),
    staleTime: 5 * 60 * 1000, // 5분 (인기 포스트는 자주 변하지 않음)
    gcTime: 15 * 60 * 1000, // 15분
    ...options,
  });
}

/**
 * Top 게시물 조회 훅 (기간별)
 * - engagement score: (likes × 3) + (saves × 2) + (views × 0.1)
 */
export function useTopPosts(
  period: TopPostsPeriod = 'weekly',
  limit: number = 10,
  options?: Omit<UseQueryOptions<PostListItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PostListItem[], Error>({
    queryKey: postsKeys.top(period, limit),
    queryFn: () => getTopPosts(period, limit),
    staleTime: 10 * 60 * 1000, // 10분 (기간별 인기글은 더 오래 캐싱)
    gcTime: 30 * 60 * 1000, // 30분
    ...options,
  });
}

/**
 * 추천 포스트 조회 훅 (간단 버전 - 사이드바용)
 * - 로그인 사용자: 팔로잉하는 사람의 포스트
 * - 비로그인: 글로벌 트렌딩 포스트
 */
export function useRecommendedPosts(
  limit: number = 10,
  options?: Omit<UseQueryOptions<PostListItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PostListItem[], Error>({
    queryKey: postsKeys.recommended(limit),
    queryFn: () => getRecommendedPosts(limit),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 15 * 60 * 1000, // 15분
    ...options,
  });
}

/**
 * 추천 포스트 무한 스크롤 훅 (메인 피드용)
 * GET /api/v1/posts/recommend/
 */
export function useInfiniteRecommendedPosts(
  params?: Omit<{ page_size?: number }, 'page'>,
  options?: Omit<UseInfiniteQueryOptions<PaginatedPostResponse, Error, InfiniteData<PaginatedPostResponse>, readonly unknown[], number>, 'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'>
) {
  return useInfiniteQuery<PaginatedPostResponse, Error, InfiniteData<PaginatedPostResponse>, readonly unknown[], number>({
    queryKey: postsKeys.recommendedPaginated(params),
    queryFn: ({ pageParam }) => getRecommendedPostsPaginated({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      // next가 있으면 다음 페이지 번호 반환
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

/**
 * 게시물 좋아요한 사용자 목록 무한 스크롤 훅
 */
export function useInfinitePostLikers(
  postId: number,
  params?: Omit<GetPostLikersParams, 'page'>,
  options?: Omit<UseInfiniteQueryOptions<PaginatedLikersResponse, Error, InfiniteData<PaginatedLikersResponse>, readonly unknown[], number>, 'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'>
) {
  return useInfiniteQuery<PaginatedLikersResponse, Error, InfiniteData<PaginatedLikersResponse>, readonly unknown[], number>({
    queryKey: postsKeys.likers(postId),
    queryFn: ({ pageParam }) => getPostLikers(postId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!postId && postId > 0,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}
