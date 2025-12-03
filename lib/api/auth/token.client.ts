/**
 * 클라이언트 사이드 토큰 유틸리티
 * 브라우저 환경에서 사용
 *
 * 주의: 이 파일은 interceptor에서 사용되므로 rest-client를 import하면 안 됩니다.
 * 순환 의존성 방지를 위해 fetch를 직접 사용합니다.
 */

'use client';

import { API_CONFIG } from '../config';

/**
 * 로그인 처리 (백엔드 직접 호출)
 */
export async function login(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.REST_BASE_URL}/api/v1/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '로그인에 실패했습니다.');
  }
}

/**
 * 로그아웃 처리 (백엔드 직접 호출)
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_CONFIG.REST_BASE_URL}/api/v1/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * 토큰 갱신 (백엔드 직접 호출)
 */
export async function refreshToken(): Promise<void> {
  const response = await fetch(`${API_CONFIG.REST_BASE_URL}/api/v1/auth/refresh/`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('토큰 갱신에 실패했습니다.');
  }
}

/**
 * 현재 인증 상태 확인 (백엔드 직접 호출)
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.REST_BASE_URL}/api/v1/users/me/`, {
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 클라이언트에서 사용할 수 있는 간단한 메모리 토큰 저장소
 * (백업용, httpOnly 쿠키가 주 인증 수단)
 */
let memoryToken: string | null = null;

export function setMemoryToken(token: string): void {
  memoryToken = token;
}

export function getMemoryToken(): string | null {
  return memoryToken;
}

export function clearMemoryToken(): void {
  memoryToken = null;
}

/**
 * SSE나 다른 용도로 토큰이 필요할 때 사용
 * (httpOnly 쿠키로는 EventSource에 토큰을 전달할 수 없음)
 */
export function getAuthToken(): string | null {
  return memoryToken;
}
