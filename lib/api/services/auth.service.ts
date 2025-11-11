/**
 * 인증 관련 API 서비스
 */

import { publicClient, handleApiError } from '../clients/rest-client';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  User,
} from '../types/rest.types';

/**
 * 로그인
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await publicClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  try {
    await publicClient.post('/auth/logout');
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 토큰 갱신
 */
export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  try {
    const response = await publicClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await publicClient.get<{ data: User }>('/auth/me', {
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 회원가입
 */
export async function signup(data: {
  email: string;
  password: string;
  name: string;
}): Promise<LoginResponse> {
  try {
    const response = await publicClient.post<LoginResponse>('/auth/signup', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 비밀번호 재설정 요청
 */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await publicClient.post('/auth/password-reset', { email });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 비밀번호 재설정
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    await publicClient.post('/auth/password-reset/confirm', {
      token,
      password: newPassword,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}
