/**
 * 로그인 API 라우트
 */

import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/api/auth/token.server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // TODO: 실제 API 서버로 로그인 요청
    // 현재는 mock 응답 (실제 구현 시 제거)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.message || '로그인에 실패했습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // httpOnly 쿠키에 토큰 저장
    await setAuthCookies(data.accessToken, data.refreshToken);

    return NextResponse.json({
      success: true,
      user: data.user,
      accessToken: data.accessToken, // 클라이언트 메모리 저장용
    });
  } catch (error) {
    console.error('Login error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '로그인 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
