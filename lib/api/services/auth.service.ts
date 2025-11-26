/**
 * 인증 관련 API 서비스
 */

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
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '로그인에 실패했습니다.');
    }

    const data = await response.json();

    // Next.js API Route 응답 형식: { success, user, accessToken }
    // LoginResponse 형식으로 변환: { user, tokens: { access, refresh } }
    return {
      user: data.user,
      tokens: {
        access: data.accessToken,
        refresh: '', // httpOnly 쿠키에 저장됨
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
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    // 로그아웃 실패해도 로컬 상태는 클리어
    console.error('Logout error:', error);
  }
}

/**
 * 토큰 갱신
 */
export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('토큰 갱신에 실패했습니다.');
    }

    const data = await response.json();
    return { access: data.accessToken };
  } catch (error) {
    throw new Error('토큰 갱신에 실패했습니다.');
  }
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '사용자 정보를 가져올 수 없습니다.');
    }

    const data = await response.json();
    return data.user;
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
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '회원가입에 실패했습니다.');
    }

    const result = await response.json();

    return {
      user: result.user,
      tokens: {
        access: result.accessToken,
        refresh: '', // httpOnly 쿠키에 저장됨
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

/**
 * OAuth 인증 URL 가져오기
 * TODO: Next.js API Route로 마이그레이션 필요 (/api/auth/oauth/${provider}/login)
 */
export async function initiateOAuthLogin(provider: OAuthProvider): Promise<OAuthLoginResponse> {
  try {
    const response = await fetch(`/api/auth/oauth/${provider}/login`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'OAuth 인증을 시작할 수 없습니다.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('OAuth 인증 중 오류가 발생했습니다.');
  }
}

/**
 * OAuth 콜백 처리
 * TODO: Next.js API Route로 마이그레이션 필요 (/api/auth/oauth/${provider}/callback)
 */
export async function handleOAuthCallback(
  data: OAuthCallbackRequest
): Promise<LoginResponse> {
  try {
    const response = await fetch(`/api/auth/oauth/${data.provider}/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        code: data.code,
        ...(data.state && { state: data.state }),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'OAuth 콜백 처리에 실패했습니다.');
    }

    const result = await response.json();

    return {
      user: result.user,
      tokens: {
        access: result.accessToken,
        refresh: '', // httpOnly 쿠키에 저장됨
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('OAuth 콜백 처리 중 오류가 발생했습니다.');
  }
}
