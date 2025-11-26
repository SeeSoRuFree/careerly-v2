/**
 * Careerly Agent API 서비스
 * AI 채팅 및 질의응답 기능
 * CORS 우회를 위해 Next.js API Route 프록시 사용
 */

import axios from 'axios';
import { handleApiError } from '../clients/rest-client';
import type {
  ChatRequest,
  ChatResponse,
  ChatSearchResult,
  ChatCitation,
  HealthResponse,
  ApiVersion,
  ChatComparisonResult,
} from '../types/chat.types';

/**
 * Axios 인스턴스 생성 (프록시 사용)
 * /api/agent-chat 엔드포인트를 통해 Agent API 호출
 */
const agentClient = axios.create({
  baseURL: '/api/agent-chat', // Next.js API Route 프록시
  timeout: 300000, // 5분 (Agent API는 처리 시간이 길 수 있음)
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Chat API 호출 (프록시를 통해)
 * @param request - Chat 요청 객체
 * @param version - API 버전 (v1, v3, v4) - 선택사항
 * @returns Chat 응답
 */
export async function sendChatMessage(
  request: ChatRequest,
  version?: ApiVersion
): Promise<ChatResponse> {
  try {
    // 버전 쿼리 파라미터 추가
    const params = version ? { version } : {};
    const response = await agentClient.post<ChatResponse>('', request, { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Chat API 호출 (기존 SearchResult 형식으로 변환)
 * 기존 UI 컴포넌트와 호환되도록 변환
 * @param query - 사용자 질문
 * @param userId - 사용자 ID (선택사항)
 * @param sessionId - 세션 ID (선택사항)
 * @param version - API 버전 (v1, v3, v4) - 선택사항
 * @returns 변환된 Chat 응답
 */
export async function chatSearch(
  query: string,
  userId?: string,
  sessionId?: string,
  version?: ApiVersion
): Promise<ChatSearchResult> {
  try {
    const request: ChatRequest = {
      query,
      user_id: userId || 'anonymous',
      session_id: sessionId,
    };

    const response = await sendChatMessage(request, version);

    // sources를 Citation 형식으로 변환
    const citations: ChatCitation[] = response.sources.map((url, index) => ({
      id: `citation-${index + 1}`,
      title: extractTitleFromUrl(url),
      url,
      snippet: '',
    }));

    return {
      query,
      answer: response.answer,
      citations,
      session_id: response.session_id,
      metadata: response.metadata,
    };
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Health Check (프록시를 통해)
 */
export async function checkAgentHealth(): Promise<HealthResponse> {
  try {
    const response = await agentClient.get<HealthResponse>('');
    return response.data;
  } catch (error) {
    throw handleApiError(error, { showToast: false });
  }
}

/**
 * 3개 버전 API를 병렬로 호출하여 결과 비교
 * 한 버전이 실패해도 다른 버전은 계속 진행됨
 * @param query - 사용자 질문
 * @param userId - 사용자 ID (선택사항)
 * @param sessionId - 세션 ID (선택사항)
 * @returns 버전별 결과 객체 (실패한 버전은 null)
 */
export async function chatSearchAllVersions(
  query: string,
  userId?: string,
  sessionId?: string
): Promise<ChatComparisonResult> {
  try {
    // 3개 버전을 병렬로 호출
    const results = await Promise.allSettled([
      chatSearch(query, userId, sessionId, 'v1'),
      chatSearch(query, userId, sessionId, 'v3'),
      chatSearch(query, userId, sessionId, 'v4'),
    ]);

    return {
      v1Result:
        results[0].status === 'fulfilled'
          ? results[0].value
          : null,
      v3Result:
        results[1].status === 'fulfilled'
          ? results[1].value
          : null,
      v4Result:
        results[2].status === 'fulfilled'
          ? results[2].value
          : null,
    };
  } catch (error) {
    // 예상치 못한 에러의 경우 (Promise.allSettled는 일반적으로 throw하지 않음)
    console.error('All versions chat search error:', error);
    return {
      v1Result: null,
      v3Result: null,
      v4Result: null,
    };
  }
}

/**
 * URL에서 제목 추출 (간단한 파싱)
 */
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');

    // careerly.co.kr 도메인인 경우
    if (hostname.includes('careerly')) {
      return 'Careerly 아티클';
    }

    // 도메인 이름을 제목으로 사용
    return hostname
      .split('.')
      .slice(0, -1)
      .join('.')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return 'Reference';
  }
}
