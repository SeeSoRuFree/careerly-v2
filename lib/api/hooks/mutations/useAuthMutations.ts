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
  initiateOAuthLogin as initiateOAuthLoginService,
  handleOAuthCallback as handleOAuthCallbackService,
} from '../../services/auth.service';
import { setMemoryToken, clearMemoryToken } from '../../auth/token.client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  OAuthProvider,
  OAuthCallbackRequest,
} from '../../types/rest.types';
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
      setMemoryToken(data.tokens.access);

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
    UseMutationOptions<LoginResponse, Error, RegisterRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<LoginResponse, Error, RegisterRequest>({
    mutationFn: signupService,
    onSuccess: (data) => {
      // 메모리 토큰 저장
      setMemoryToken(data.tokens.access);

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

/**
 * OAuth 로그인 mutation
 * provider를 받아서 OAuth 인증 URL을 가져오고 리다이렉트
 */
export function useOAuthLogin(
  options?: Omit<
    UseMutationOptions<void, Error, OAuthProvider>,
    'mutationFn'
  >
) {
  return useMutation<void, Error, OAuthProvider>({
    mutationFn: async (provider: OAuthProvider) => {
      const { authUrl } = await initiateOAuthLoginService(provider);
      // OAuth 인증 URL로 리다이렉트
      window.location.href = authUrl;
    },
    onError: (error) => {
      toast.error(error.message || 'OAuth 인증 시작에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * OAuth 콜백 처리 mutation
 * 인증 코드를 받아서 로그인 처리
 */
export function useOAuthCallback(
  options?: Omit<
    UseMutationOptions<LoginResponse, Error, OAuthCallbackRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<LoginResponse, Error, OAuthCallbackRequest>({
    mutationFn: handleOAuthCallbackService,
    onSuccess: (data) => {
      // 메모리 토큰 저장
      setMemoryToken(data.tokens.access);

      // 사용자 정보 캐시
      queryClient.setQueryData(userKeys.me(), data.user);

      toast.success('로그인되었습니다.');

      // 메인 페이지로 이동
      router.push('/');
    },
    onError: (error) => {
      toast.error(error.message || 'OAuth 로그인에 실패했습니다.');

      // 로그인 실패 시 로그인 페이지로 리다이렉트
      router.push('/login');
    },
    ...options,
  });
}
