/**
 * Chat SSE Stream API 라우트 (Django Backend 프록시)
 * SSE 스트림을 그대로 전달
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 빈 body 체크
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      return NextResponse.json(
        { error: '요청 본문이 비어있습니다.' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '잘못된 JSON 형식입니다.' },
        { status: 400 }
      );
    }

    if (!body.content) {
      return NextResponse.json(
        { error: '질문 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // Django 백엔드 Chat Stream API 호출
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat/stream/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Django Chat Stream API Error:', response.status, errorText);

      try {
        const error = JSON.parse(errorText);
        return NextResponse.json(
          { error: error.error || error.message || 'Chat Stream API 호출 실패' },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { error: 'Chat Stream API 호출 실패' },
          { status: response.status }
        );
      }
    }

    // SSE 스트림 그대로 전달
    const stream = response.body;

    if (!stream) {
      return NextResponse.json(
        { error: '스트림 응답을 받지 못했습니다.' },
        { status: 500 }
      );
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Chat stream proxy error:', error);

    return NextResponse.json(
      {
        error: '채팅 스트림 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
