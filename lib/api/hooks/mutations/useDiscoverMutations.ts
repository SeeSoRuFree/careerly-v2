/**
 * 발견(Discover) 관련 React Query Mutation 훅
 */

'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  likeFeed,
  unlikeFeed,
  bookmarkFeed,
  unbookmarkFeed,
} from '../../services/discover.service';
import { discoverKeys } from '../queries/useDiscover';

/**
 * 피드 좋아요 mutation
 */
export function useLikeFeed(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: likeFeed,
    onSuccess: (_, feedId) => {
      // 피드 상세 무효화
      queryClient.invalidateQueries({ queryKey: discoverKeys.detail(feedId) });
      // 피드 목록 무효화
      queryClient.invalidateQueries({ queryKey: discoverKeys.lists() });

      toast.success('좋아요를 눌렀습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '좋아요에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 피드 좋아요 취소 mutation
 */
export function useUnlikeFeed(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: unlikeFeed,
    onSuccess: (_, feedId) => {
      // 피드 상세 무효화
      queryClient.invalidateQueries({ queryKey: discoverKeys.detail(feedId) });
      // 피드 목록 무효화
      queryClient.invalidateQueries({ queryKey: discoverKeys.lists() });

      toast.success('좋아요를 취소했습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '좋아요 취소에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 피드 북마크 mutation
 */
export function useBookmarkFeed(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: bookmarkFeed,
    onSuccess: (_, feedId) => {
      // 피드 상세 무효화
      queryClient.invalidateQueries({ queryKey: discoverKeys.detail(feedId) });
      // 북마크 목록 무효화
      queryClient.invalidateQueries({ queryKey: discoverKeys.bookmarks() });

      toast.success('북마크에 추가했습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '북마크에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 피드 북마크 취소 mutation
 */
export function useUnbookmarkFeed(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: unbookmarkFeed,
    onSuccess: (_, feedId) => {
      // 피드 상세 무효화
      queryClient.invalidateQueries({ queryKey: discoverKeys.detail(feedId) });
      // 북마크 목록 무효화
      queryClient.invalidateQueries({ queryKey: discoverKeys.bookmarks() });

      toast.success('북마크를 취소했습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '북마크 취소에 실패했습니다.');
    },
    ...options,
  });
}
