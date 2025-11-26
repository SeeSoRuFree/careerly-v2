/**
 * 서버 사이드 토큰 관리
 * Next.js 서버 액션과 API 라우트에서 사용
 */

import { cookies } from 'next/headers';
import { ApiError, ERROR_CODES, ERROR_MESSAGES } from '../types/error.types';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * 인증 쿠키 설정
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7, // 7일
  });

  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30, // 30일
  });
}

/**
 * 인증 쿠키 조회
 */
export async function getAuthCookies(): Promise<{
  accessToken: string | undefined;
  refreshToken: string | undefined;
}> {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_KEY)?.value,
    refreshToken: cookieStore.get(REFRESH_TOKEN_KEY)?.value,
  };
}

/**
 * Access Token 조회
 */
export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value;
}

/**
 * Refresh Token 조회
 */
export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_KEY)?.value;
}

/**
 * 인증 쿠키 삭제
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);
}

/**
 * Access Token 갱신
 */
export async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = await getAuthCookies();

  if (!refreshToken) {
    throw new ApiError(
      401,
      ERROR_CODES.NO_REFRESH_TOKEN,
      ERROR_MESSAGES.NO_REFRESH_TOKEN
    );
  }

  try {
    // Django 백엔드 토큰 갱신 요청
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      }
    );

    if (!response.ok) {
      throw new ApiError(
        401,
        ERROR_CODES.REFRESH_FAILED,
        ERROR_MESSAGES.REFRESH_FAILED
      );
    }

    const data = await response.json();

    // 새 토큰 저장 (Django 응답: { access, refresh })
    await setAuthCookies(data.access, data.refresh);

    return data.access;
  } catch (error) {
    // 갱신 실패 시 쿠키 삭제
    await clearAuthCookies();
    throw error;
  }
}

/**
 * 인증 여부 확인
 */
export async function isAuthenticated(): Promise<boolean> {
  const { accessToken } = await getAuthCookies();
  return !!accessToken;
}

/**
 * 서버 사이드 API 요청에 사용할 Authorization 헤더 생성
 */
export async function getAuthHeader(): Promise<Record<string, string>> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}
