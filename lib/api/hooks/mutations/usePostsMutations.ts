/**
 * Posts 관련 React Query Mutation 훅
 */

'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createPost,
  updatePost,
  patchPost,
  deletePost,
} from '../../services/posts.service';
import { postsKeys } from '../queries/usePosts';
import type { Post, PostCreateRequest, PostUpdateRequest } from '../../types/posts.types';

/**
 * 게시물 생성 mutation
 */
export function useCreatePost(
  options?: Omit<UseMutationOptions<Post, Error, PostCreateRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<Post, Error, PostCreateRequest>({
    mutationFn: createPost,
    onSuccess: (data) => {
      // 게시물 목록 무효화 (모든 페이지)
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      // 새로운 게시물 캐시에 추가
      queryClient.setQueryData(postsKeys.detail(data.id), data);

      toast.success('게시물이 생성되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '게시물 생성에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 수정 (PUT) mutation
 */
export function useUpdatePost(
  options?: Omit<
    UseMutationOptions<Post, Error, { id: number; data: PostUpdateRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Post, Error, { id: number; data: PostUpdateRequest }>({
    mutationFn: ({ id, data }) => updatePost(id, data),
    onSuccess: (data, variables) => {
      // 해당 게시물 상세 캐시 업데이트
      queryClient.setQueryData(postsKeys.detail(variables.id), data);

      // 게시물 목록 무효화
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      toast.success('게시물이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '게시물 수정에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 부분 수정 (PATCH) mutation
 */
export function usePatchPost(
  options?: Omit<
    UseMutationOptions<Post, Error, { id: number; data: Partial<PostUpdateRequest> }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Post, Error, { id: number; data: Partial<PostUpdateRequest> }>({
    mutationFn: ({ id, data }) => patchPost(id, data),
    onSuccess: (data, variables) => {
      // 해당 게시물 상세 캐시 업데이트
      queryClient.setQueryData(postsKeys.detail(variables.id), data);

      // 게시물 목록 무효화
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      toast.success('게시물이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '게시물 수정에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 삭제 mutation
 */
export function useDeletePost(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deletePost,
    onSuccess: (_, postId) => {
      // 해당 게시물 상세 캐시 제거
      queryClient.removeQueries({ queryKey: postsKeys.detail(postId) });

      // 게시물 목록 무효화
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      toast.success('게시물이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '게시물 삭제에 실패했습니다.');
    },
    ...options,
  });
}
