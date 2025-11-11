/**
 * 로그아웃 API 라우트
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/api/auth/token.server';

export async function POST(request: NextRequest) {
  try {
    // httpOnly 쿠키 삭제
    await clearAuthCookies();

    // TODO: 실제 API 서버로 로그아웃 요청 (선택사항)
    // await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
    //   method: 'POST',
    //   headers: await getAuthHeader(),
    // });

    return NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.',
    });
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '로그아웃 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
