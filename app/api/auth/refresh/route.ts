/**
 * 토큰 갱신 API 라우트
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
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: '리프레시 토큰이 없습니다.' },
        { status: 401 }
      );
    }

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
      // 갱신 실패 시 쿠키 삭제
      const res = NextResponse.json(
        { success: false, error: '토큰 갱신에 실패했습니다.' },
        { status: 401 }
      );
      res.cookies.delete('accessToken');
      res.cookies.delete('refreshToken');
      return res;
    }

    const data = await response.json();

    // 새 토큰 쿠키에 저장
    const res = NextResponse.json({
      success: true,
      accessToken: data.access,
    });

    res.cookies.set('accessToken', data.access, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7,
    });

    // refresh token도 갱신되었다면 저장
    if (data.refresh) {
      res.cookies.set('refreshToken', data.refresh, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return res;
  } catch (error) {
    console.error('Refresh token error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '토큰 갱신 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
