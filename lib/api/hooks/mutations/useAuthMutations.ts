/**
 * 인증 관련 React Query Mutation 훅
 */

'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  login as loginService,
  logout as logoutService,
  signup as signupService,
} from '../../services/auth.service';
import { setMemoryToken, clearMemoryToken } from '../../auth/token.client';
import type { LoginRequest, LoginResponse } from '../../types/rest.types';
import { userKeys } from '../queries/useUser';

/**
 * 로그인 mutation
 */
export function useLogin(
  options?: Omit<UseMutationOptions<LoginResponse, Error, LoginRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginService,
    onSuccess: (data) => {
      // 메모리 토큰 저장 (SSE 등에서 사용)
      setMemoryToken(data.accessToken);

      // 사용자 정보 캐시
      queryClient.setQueryData(userKeys.me(), data.user);

      toast.success('로그인되었습니다.');

      // 메인 페이지로 이동
      router.push('/');
    },
    onError: (error) => {
      toast.error(error.message || '로그인에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 로그아웃 mutation
 */
export function useLogout(
  options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, Error, void>({
    mutationFn: logoutService,
    onSuccess: () => {
      // 메모리 토큰 삭제
      clearMemoryToken();

      // 모든 쿼리 캐시 삭제
      queryClient.clear();

      toast.success('로그아웃되었습니다.');

      // 로그인 페이지로 이동
      router.push('/login');
    },
    onError: (error) => {
      toast.error(error.message || '로그아웃에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 회원가입 mutation
 */
export function useSignup(
  options?: Omit<
    UseMutationOptions<
      LoginResponse,
      Error,
      { email: string; password: string; name: string }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    LoginResponse,
    Error,
    { email: string; password: string; name: string }
  >({
    mutationFn: signupService,
    onSuccess: (data) => {
      // 메모리 토큰 저장
      setMemoryToken(data.accessToken);

      // 사용자 정보 캐시
      queryClient.setQueryData(userKeys.me(), data.user);

      toast.success('회원가입이 완료되었습니다.');

      // 메인 페이지로 이동
      router.push('/');
    },
    onError: (error) => {
      toast.error(error.message || '회원가입에 실패했습니다.');
    },
    ...options,
  });
}
