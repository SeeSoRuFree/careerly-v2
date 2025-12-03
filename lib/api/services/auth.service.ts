/**
 * 인증 관련 API 서비스
 */

import { publicClient, authClient } from '../clients/rest-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenResponse,
  User,
  OAuthProvider,
  OAuthLoginResponse,
  OAuthCallbackRequest,
} from '../types/rest.types';

/**
 * 로그인
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await publicClient.post<{
      user: User;
      tokens: { access: string; refresh: string };
    }>('/api/v1/auth/login/', credentials);

    return {
      user: response.data.user,
      tokens: {
        access: response.data.tokens.access,
        refresh: response.data.tokens.refresh,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('로그인 중 오류가 발생했습니다.');
  }
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  try {
    await publicClient.post('/api/v1/auth/logout/');
  } catch (error) {
    // 로그아웃 실패해도 로컬 상태는 클리어
    console.error('Logout error:', error);
  }
}

/**
 * 토큰 갱신
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  try {
    const response = await publicClient.post<{ access: string }>('/api/v1/auth/refresh/');
    return { access: response.data.access };
  } catch (error) {
    throw new Error('토큰 갱신에 실패했습니다.');
  }
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await authClient.get<User>('/api/v1/users/me/');
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('사용자 정보 조회 중 오류가 발생했습니다.');
  }
}

/**
 * 회원가입
 */
export async function signup(data: RegisterRequest): Promise<LoginResponse> {
  try {
    const response = await publicClient.post<{
      user: User;
      tokens: { access: string; refresh: string };
    }>('/api/v1/auth/register/', data);

    return {
      user: response.data.user,
      tokens: {
        access: response.data.tokens.access,
        refresh: response.data.tokens.refresh,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('회원가입 중 오류가 발생했습니다.');
  }
}

/**
 * 비밀번호 재설정 요청
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await publicClient.post<{ success: boolean; message: string }>(
      '/api/v1/auth/password/reset-request/',
      { email }
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('비밀번호 재설정 요청 중 오류가 발생했습니다.');
  }
}

/**
 * 비밀번호 재설정 확인
 */
export async function verifyPasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await publicClient.post<{ success: boolean; message: string }>(
      '/api/v1/auth/password/reset-verify/',
      {
        email,
        code,
        new_password: newPassword,
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('비밀번호 재설정 중 오류가 발생했습니다.');
  }
}

/**
 * OAuth 인증 URL 가져오기
 */
export async function initiateOAuthLogin(provider: OAuthProvider): Promise<OAuthLoginResponse> {
  try {
    const response = await publicClient.get<{ authorization_url: string }>(
      `/api/v1/auth/oauth/${provider}/login/`
    );
    return { authUrl: response.data.authorization_url };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('OAuth 인증 중 오류가 발생했습니다.');
  }
}

/**
 * OAuth 콜백 처리
 */
export async function handleOAuthCallback(data: OAuthCallbackRequest): Promise<LoginResponse> {
  try {
    const response = await publicClient.post<{
      user: User;
      tokens: { access: string; refresh: string };
    }>(`/api/v1/auth/oauth/${data.provider}/callback/`, {
      code: data.code,
      ...(data.state && { state: data.state }),
    });

    return {
      user: response.data.user,
      tokens: {
        access: response.data.tokens.access,
        refresh: response.data.tokens.refresh,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('OAuth 콜백 처리 중 오류가 발생했습니다.');
  }
}
