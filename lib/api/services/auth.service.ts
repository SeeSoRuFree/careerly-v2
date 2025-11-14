/**
 * 인증 관련 API 서비스
 */

import { publicClient, authClient, handleApiError } from '../clients/rest-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenResponse,
  User,
} from '../types/rest.types';

/**
 * 로그인
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await publicClient.post<LoginResponse>('/api/v1/auth/login/', credentials);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 로그아웃
 * Note: 새 API에는 로그아웃 엔드포인트가 없으므로 클라이언트에서 토큰만 제거
 */
export async function logout(): Promise<void> {
  // 클라이언트 사이드 토큰 정리는 hooks/mutations에서 처리
  return Promise.resolve();
}

/**
 * 토큰 갱신
 */
export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  try {
    const response = await publicClient.post<RefreshTokenResponse>('/api/v1/auth/refresh/', {
      refresh: refreshToken,
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
    const response = await authClient.get<User>('/api/v1/users/me/');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 회원가입
 */
export async function signup(data: RegisterRequest): Promise<LoginResponse> {
  try {
    const response = await publicClient.post<LoginResponse>('/api/v1/auth/register/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 비밀번호 재설정 요청
 * Note: 새 API에는 비밀번호 재설정 엔드포인트가 없음 (추후 구현 필요)
 */
export async function requestPasswordReset(email: string): Promise<void> {
  // TODO: API 엔드포인트 추가 필요
  console.warn('Password reset not implemented in current API');
  return Promise.resolve();
}

/**
 * 비밀번호 재설정
 * Note: 새 API에는 비밀번호 재설정 엔드포인트가 없음 (추후 구현 필요)
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  // TODO: API 엔드포인트 추가 필요
  console.warn('Password reset not implemented in current API');
  return Promise.resolve();
}
