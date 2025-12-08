/**
 * Block 관련 React Query Mutation 훅
 */

'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { blockUser, unblockUser } from '../../services/block.service';
import { blockKeys } from '../queries/useBlock';
import { postsKeys } from '../queries/usePosts';
import { questionKeys } from '../queries/useQuestions';
import type { BlockResponse, UnblockResponse } from '../../types/block.types';

/**
 * 사용자 차단 mutation
 */
export function useBlockUser(
  options?: Omit<UseMutationOptions<BlockResponse, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<BlockResponse, Error, number>({
    mutationFn: blockUser,
    onSuccess: (data, userId) => {
      if (data.success && data.blocked) {
        // 차단 상태 캐시 무효화
        queryClient.invalidateQueries({ queryKey: blockKeys.isBlocked(userId) });

        // 차단 목록 무효화
        queryClient.invalidateQueries({ queryKey: blockKeys.lists() });

        // 피드 리프레시 - 차단된 사용자의 게시글/질문 제거
        queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
        queryClient.invalidateQueries({ queryKey: questionKeys.lists() });

        toast.success('사용자를 차단했습니다.');
      } else {
        toast.info(data.message || '이미 차단한 사용자입니다.');
      }
    },
    onError: (error) => {
      toast.error(error.message || '차단에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 사용자 차단 해제 mutation
 */
export function useUnblockUser(
  options?: Omit<UseMutationOptions<UnblockResponse, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<UnblockResponse, Error, number>({
    mutationFn: unblockUser,
    onSuccess: (data, userId) => {
      if (data.success && !data.blocked) {
        // 차단 상태 캐시 무효화
        queryClient.invalidateQueries({ queryKey: blockKeys.isBlocked(userId) });

        // 차단 목록 무효화
        queryClient.invalidateQueries({ queryKey: blockKeys.lists() });

        toast.success('차단을 해제했습니다.');
      } else {
        toast.info(data.message || '차단되지 않은 사용자입니다.');
      }
    },
    onError: (error) => {
      toast.error(error.message || '차단 해제에 실패했습니다.');
    },
    ...options,
  });
}
