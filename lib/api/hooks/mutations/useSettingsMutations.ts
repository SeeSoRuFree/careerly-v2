/**
 * 설정 관련 React Query Mutation 훅
 */

'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  updateUserSettings,
  changePassword,
  updateUserInterests,
  requestDeleteAccount,
  UserSettings,
  ChangePasswordRequest,
  DeleteAccountRequest,
  DeleteAccountResponse,
} from '../../services/settings.service';
import { settingsKeys } from '../queries/useSettings';

/**
 * 사용자 설정 업데이트 mutation
 */
export function useUpdateUserSettings(
  options?: Omit<UseMutationOptions<UserSettings, Error, Partial<UserSettings>>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<UserSettings, Error, Partial<UserSettings>>({
    mutationFn: updateUserSettings,
    onSuccess: (data) => {
      // 설정 캐시 업데이트
      queryClient.setQueryData(settingsKeys.userSettings(), data);

      toast.success('설정이 저장되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '설정 저장에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 비밀번호 변경 mutation
 */
export function useChangePassword(
  options?: Omit<UseMutationOptions<void, Error, ChangePasswordRequest>, 'mutationFn'>
) {
  const router = useRouter();

  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('비밀번호가 변경되었습니다.');
      router.back();
    },
    onError: (error) => {
      toast.error(error.message || '비밀번호 변경에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 사용자 관심사 업데이트 mutation
 */
export function useUpdateUserInterests(
  options?: Omit<UseMutationOptions<void, Error, number[]>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number[]>({
    mutationFn: updateUserInterests,
    onSuccess: () => {
      // 관심사 목록 무효화
      queryClient.invalidateQueries({ queryKey: settingsKeys.userInterests() });

      toast.success('관심사가 저장되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '관심사 저장에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 계정 삭제 요청 mutation
 */
export function useRequestDeleteAccount(
  options?: Omit<UseMutationOptions<DeleteAccountResponse, Error, DeleteAccountRequest>, 'mutationFn'>
) {
  return useMutation<DeleteAccountResponse, Error, DeleteAccountRequest>({
    mutationFn: requestDeleteAccount,
    onSuccess: () => {
      toast.success('계정 삭제 요청이 접수되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '계정 삭제 요청에 실패했습니다.');
    },
    ...options,
  });
}
