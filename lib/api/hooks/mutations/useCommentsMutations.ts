/**
 * 댓글 관련 React Query Mutation 훅
 */

'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createComment,
  updateComment,
  patchComment,
  deleteComment,
} from '../../services/comments.service';
import { commentKeys } from '../queries/useComments';
import type {
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
} from '../../types/comments.types';

/**
 * 댓글 생성 mutation
 */
export function useCreateComment(
  options?: Omit<UseMutationOptions<Comment, Error, CommentCreateRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<Comment, Error, CommentCreateRequest>({
    mutationFn: createComment,
    onSuccess: (data) => {
      // 해당 게시글의 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ postId: data.postid }),
      });

      // 전체 댓글 목록도 무효화 (postId 필터 없는 경우)
      queryClient.invalidateQueries({
        queryKey: commentKeys.lists(),
      });

      toast.success('댓글이 작성되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '댓글 작성에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 댓글 수정 mutation (PUT)
 */
export function useUpdateComment(
  options?: Omit<
    UseMutationOptions<Comment, Error, { id: number; data: CommentUpdateRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Comment, Error, { id: number; data: CommentUpdateRequest }>({
    mutationFn: ({ id, data }) => updateComment(id, data),
    onSuccess: (data, variables) => {
      // 댓글 상세 캐시 업데이트
      queryClient.setQueryData(commentKeys.detail(variables.id), data);

      // 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ postId: data.postid }),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.lists(),
      });

      toast.success('댓글이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '댓글 수정에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 댓글 부분 수정 mutation (PATCH)
 */
export function usePatchComment(
  options?: Omit<
    UseMutationOptions<Comment, Error, { id: number; data: Partial<CommentUpdateRequest> }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Comment, Error, { id: number; data: Partial<CommentUpdateRequest> }>({
    mutationFn: ({ id, data }) => patchComment(id, data),
    onSuccess: (data, variables) => {
      // 댓글 상세 캐시 업데이트
      queryClient.setQueryData(commentKeys.detail(variables.id), data);

      // 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ postId: data.postid }),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.lists(),
      });

      toast.success('댓글이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '댓글 수정에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 댓글 삭제 mutation (Soft Delete)
 */
export function useDeleteComment(
  options?: Omit<
    UseMutationOptions<void, Error, { id: number; postId: number }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: number; postId: number }>({
    mutationFn: ({ id }) => deleteComment(id),
    onSuccess: (_, variables) => {
      // 댓글 상세 캐시 제거
      queryClient.removeQueries({
        queryKey: commentKeys.detail(variables.id),
      });

      // 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ postId: variables.postId }),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.lists(),
      });

      toast.success('댓글이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '댓글 삭제에 실패했습니다.');
    },
    ...options,
  });
}
