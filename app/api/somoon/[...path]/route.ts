import { NextRequest, NextResponse } from 'next/server';

/**
 * Somoon API 프록시
 * 서버 사이드에서 Somoon API를 호출하여 CORS 및 프록시 차단 우회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = params;
    const searchParams = request.nextUrl.searchParams;

    // Somoon API URL 구성
    const somoonUrl = `https://somoon.ai/api/${path.join('/')}`;
    const url = new URL(somoonUrl);

    // 쿼리 파라미터 복사
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    // Somoon API 요청 (서버 사이드에서 완전히 새로운 요청)
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Next.js)',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('❌ Somoon API error:', response.status);
      return NextResponse.json(
        { error: 'Somoon API error', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Somoon proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
