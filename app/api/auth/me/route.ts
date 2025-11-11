/**
 * 현재 사용자 정보 조회 API 라우트
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, getAuthHeader } from '@/lib/api/auth/token.server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: '인증되지 않았습니다.' },
        { status: 401 }
      );
    }

    // TODO: 실제 API 서버로 사용자 정보 요청
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
      {
        headers: await getAuthHeader(),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: '사용자 정보를 가져올 수 없습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      user: data.user || data.data,
    });
  } catch (error) {
    console.error('Get user error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '사용자 정보 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
