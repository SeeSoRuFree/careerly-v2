/**
 * 사용자 관련 React Query Mutation 훅
 */

'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  updateProfile,
  uploadAvatar,
  followUser,
  unfollowUser,
} from '../../services/user.service';
import { userKeys } from '../queries/useUser';
import type { User } from '../../types/rest.types';

/**
 * 프로필 업데이트 mutation
 */
export function useUpdateProfile(
  options?: Omit<UseMutationOptions<User, Error, Partial<User>>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<User, Error, Partial<User>>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // 사용자 정보 캐시 업데이트
      queryClient.setQueryData(userKeys.me(), data);

      toast.success('프로필이 업데이트되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '프로필 업데이트에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 프로필 이미지 업로드 mutation
 */
export function useUploadAvatar(
  options?: Omit<UseMutationOptions<string, Error, File>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, File>({
    mutationFn: uploadAvatar,
    onSuccess: (avatarUrl) => {
      // 사용자 정보 캐시 업데이트
      queryClient.setQueryData<User>(userKeys.me(), (old) =>
        old ? { ...old, avatar: avatarUrl } : undefined
      );

      toast.success('프로필 이미지가 업로드되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '이미지 업로드에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 사용자 팔로우 mutation
 */
export function useFollowUser(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: followUser,
    onSuccess: (_, userId) => {
      // 팔로잉 목록 무효화
      queryClient.invalidateQueries({ queryKey: userKeys.following(userId) });

      toast.success('팔로우했습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '팔로우에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 사용자 언팔로우 mutation
 */
export function useUnfollowUser(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: unfollowUser,
    onSuccess: (_, userId) => {
      // 팔로잉 목록 무효화
      queryClient.invalidateQueries({ queryKey: userKeys.following(userId) });

      toast.success('언팔로우했습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '언팔로우에 실패했습니다.');
    },
    ...options,
  });
}
