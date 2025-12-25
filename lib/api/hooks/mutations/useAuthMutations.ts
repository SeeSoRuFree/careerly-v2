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
  requestPasswordReset as requestPasswordResetService,
  verifyPasswordReset as verifyPasswordResetService,
} from '../../services/auth.service';
import { setMemoryToken, clearMemoryToken } from '../../auth/token.client';
import { setLoggingOut, resetSessionExpired } from '../../auth/interceptor';
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
      // 세션 만료 상태 리셋
      resetSessionExpired();

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

  const mutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      // 로그아웃 시작 전에 플래그 설정 - 이후 401 에러에서 토큰 갱신 시도 방지
      setLoggingOut(true);
      return logoutService();
    },
    onSettled: () => {
      // 성공/실패 관계없이 항상 로컬 상태 정리
      clearMemoryToken();
      queryClient.clear();
      // 로그아웃 완료 후 플래그 리셋 (다음 로그인을 위해)
      setLoggingOut(false);

      // 앱 WebView 환경이면 앱에 로그아웃 메시지 전송 (앱에서 쿠키 정리)
      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'logout' }));
      }

      router.push('/');
    },
    onSuccess: () => {
      toast.success('로그아웃되었습니다.');
    },
    // onError는 제거 - 실패해도 조용히 로그아웃 처리
    ...options,
  });

  return mutation;
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
      // 세션 만료 상태 리셋
      resetSessionExpired();

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
      // 세션 만료 상태 리셋
      resetSessionExpired();

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

      // 로그인 실패 시 홈으로 리다이렉트 (로그인 모달은 자동으로 열림)
      router.push('/');
    },
    ...options,
  });
}

/**
 * 비밀번호 재설정 요청 mutation
 */
export function useRequestPasswordReset(
  options?: Omit<
    UseMutationOptions<{ success: boolean; message: string }, Error, string>,
    'mutationFn'
  >
) {
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: requestPasswordResetService,
    onSuccess: (data) => {
      toast.success(data.message || '인증 코드가 이메일로 전송되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '비밀번호 재설정 요청에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 비밀번호 재설정 확인 mutation
 */
export function useVerifyPasswordReset(
  options?: Omit<
    UseMutationOptions<
      { success: boolean; message: string },
      Error,
      { email: string; code: string; newPassword: string }
    >,
    'mutationFn'
  >
) {
  const router = useRouter();

  return useMutation<
    { success: boolean; message: string },
    Error,
    { email: string; code: string; newPassword: string }
  >({
    mutationFn: ({ email, code, newPassword }) =>
      verifyPasswordResetService(email, code, newPassword),
    onSuccess: (data) => {
      toast.success(data.message || '비밀번호가 성공적으로 변경되었습니다.');
      // 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/');
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.message || '비밀번호 재설정에 실패했습니다.');
    },
    ...options,
  });
}
