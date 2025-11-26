/**
 * 로그인 API 라우트
 */

import { NextRequest, NextResponse } from 'next/server';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Django 백엔드 로그인 요청
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login/`,
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
        { success: false, error: error.error || error.message || '로그인에 실패했습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // NextResponse에 httpOnly 쿠키 설정
    const res = NextResponse.json({
      success: true,
      user: data.user,
      accessToken: data.tokens.access,
    });

    res.cookies.set('accessToken', data.tokens.access, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    res.cookies.set('refreshToken', data.tokens.refresh, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 30, // 30일
    });

    return res;
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
