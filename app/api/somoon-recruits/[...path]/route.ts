import { NextRequest, NextResponse } from 'next/server';

const SOMOON_RECRUITS_BASE_URL = 'http://recruits.somoon.ai:8000/data';
const SOMOON_RECRUITS_TOKEN = process.env.SOMOON_RECRUITS_API_TOKEN || '';

/**
 * Somoon Recruits API 프록시
 * 서버 사이드에서 Somoon Recruits API를 호출하여 CORS 우회
 */
async function handleRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } },
  method: 'GET' | 'POST'
) {
  try {
    const { path } = params;
    const searchParams = request.nextUrl.searchParams;

    // Somoon Recruits API URL 구성
    const recruitsUrl = `${SOMOON_RECRUITS_BASE_URL}/${path.join('/')}`;
    const url = new URL(recruitsUrl);

    // 쿼리 파라미터 복사
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Token ${SOMOON_RECRUITS_TOKEN}`,
      },
      cache: 'no-store',
    };

    // POST 요청인 경우 body 추가
    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      console.error(`[Somoon Recruits] Error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Somoon Recruits API error', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Somoon Recruits] Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleRequest(request, context, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleRequest(request, context, 'POST');
}

export const dynamic = 'force-dynamic';
