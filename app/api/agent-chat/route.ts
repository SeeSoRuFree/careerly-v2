/**
 * Careerly Agent API 프록시
 * CORS 우회 및 서버사이드 API 호출
 */

import { NextRequest, NextResponse } from 'next/server';

const AGENT_API_URL =
  process.env.NEXT_PUBLIC_AGENT_API_URL ||
  'https://seulchan--careerly-agent-poc-fastapi-app.modal.run';

export async function POST(request: NextRequest) {
  try {
    // 클라이언트로부터 받은 요청 body
    const body = await request.json();

    // Agent API로 프록시 요청
    const response = await fetch(`${AGENT_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Agent API 응답 확인
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agent API Error:', response.status, errorText);

      return NextResponse.json(
        { error: 'Agent API 호출 실패', details: errorText },
        { status: response.status }
      );
    }

    // 성공 응답
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);

    return NextResponse.json(
      { error: '프록시 서버 오류', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const response = await fetch(`${AGENT_API_URL}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Health check 실패' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      { error: 'Health check 오류', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
