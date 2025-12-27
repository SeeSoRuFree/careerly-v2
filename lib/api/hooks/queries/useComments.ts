/**
 * 댓글 관련 React Query 훅
 */

'use client';

import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData } from '@tanstack/react-query';
import { getComments, getComment, getCommentLikers } from '../../services/comments.service';
import type { GetCommentLikersParams, PaginatedCommentLikersResponse } from '../../services/comments.service';
import type { Comment, PaginatedCommentResponse } from '../../types/comments.types';

/**
 * 댓글 쿼리 키
 */
export const commentKeys = {
  all: ['comment'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (filters: { postId?: number; page?: number }) => [...commentKeys.lists(), filters] as const,
  details: () => [...commentKeys.all, 'detail'] as const,
  detail: (id: number) => [...commentKeys.details(), id] as const,
  likers: (id: number) => [...commentKeys.all, 'likers', id] as const,
};

/**
 * 댓글 목록 조회 훅
 * @param postId - 게시글 ID (선택적, 필터링용)
 * @param page - 페이지 번호 (선택적)
 */
export function useComments(
  { postId, page }: { postId?: number; page?: number } = {},
  options?: Omit<UseQueryOptions<PaginatedCommentResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedCommentResponse, Error>({
    queryKey: commentKeys.list({ postId, page }),
    queryFn: () => getComments({ postId, page }),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

/**
 * 댓글 상세 조회 훅
 * @param id - 댓글 ID
 */
export function useComment(
  id: number,
  options?: Omit<UseQueryOptions<Comment, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Comment, Error>({
    queryKey: commentKeys.detail(id),
    queryFn: () => getComment(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

/**
 * 댓글 좋아요한 사용자 목록 무한 스크롤 훅
 * @param commentId - 댓글 ID
 */
export function useInfiniteCommentLikers(
  commentId: number,
  params?: Omit<GetCommentLikersParams, 'page'>,
  options?: Omit<UseInfiniteQueryOptions<PaginatedCommentLikersResponse, Error, InfiniteData<PaginatedCommentLikersResponse>, readonly unknown[], number>, 'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'>
) {
  return useInfiniteQuery<PaginatedCommentLikersResponse, Error, InfiniteData<PaginatedCommentLikersResponse>, readonly unknown[], number>({
    queryKey: commentKeys.likers(commentId),
    queryFn: ({ pageParam }) => getCommentLikers(commentId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!commentId && commentId > 0,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}
