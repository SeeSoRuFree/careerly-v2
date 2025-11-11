/**
 * 토큰 갱신 API 라우트
 */

import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/api/auth/token.server';

export async function POST(request: NextRequest) {
  try {
    const newAccessToken = await refreshAccessToken();

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Token refresh failed',
      },
      { status: 401 }
    );
  }
}
