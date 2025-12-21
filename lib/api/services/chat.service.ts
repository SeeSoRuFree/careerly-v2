/**
 * Careerly Chat API 서비스
 * Django Backend 직접 호출 (httpOnly 쿠키 자동 전송)
 */

import axios from 'axios';
import { handleApiError } from '../clients/rest-client';
import { API_CONFIG } from '../config';
import type {
  ChatRequest,
  ChatResponse,
  ChatSearchResult,
  ChatCitation,
  ApiVersion,
  ChatComparisonResult,
  StreamCallbacks,
  SSESessionEvent,
  SSEStatusEvent,
  SSETokenEvent,
  SSESourcesEvent,
  SSECompleteEvent,
  SSEErrorEvent,
  SSEAgentProgressEvent,
  SSEProfileSummaryEvent,
  ChatSession,
  ShareSessionRequest,
  ShareToCommunityResponse,
  ChatSessionListResponse,
} from '../types/chat.types';

/**
 * Chat API용 클라이언트 (Django Backend 직접 호출)
 */
const chatClient = axios.create({
  baseURL: `${API_CONFIG.REST_BASE_URL}/api/v1/chat`,
  timeout: 300000, // 5분 (AI 응답 시간 고려)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // httpOnly 쿠키 전송
});

/**
 * Chat API 호출 (Django Backend 직접 호출)
 * @param request - Chat 요청 객체
 * @returns Chat 응답
 */
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  try {
    const response = await chatClient.post<ChatResponse>('/', request);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Chat API 호출 (기존 SearchResult 형식으로 변환)
 * 기존 UI 컴포넌트와 호환되도록 변환
 * @param query - 사용자 질문
 * @param userId - 사용자 ID (사용 안 함, 인증 토큰에서 자동 추출)
 * @param sessionId - 세션 ID (선택사항)
 * @param version - API 버전 (향후 확장용, 현재 사용 안 함)
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
      content: query,
      session_id: sessionId,
    };

    const response = await sendChatMessage(request);

    // sources.all을 Citation 형식으로 변환
    const citations: ChatCitation[] = response.sources.all.map((url, index) => ({
      id: `citation-${index + 1}`,
      title: extractTitleFromUrl(url),
      url,
      snippet: '',
    }));

    return {
      query,
      answer: response.content,
      citations,
      session_id: response.session_id,
      metadata: {
        processing_time: response.latency_ms ? response.latency_ms / 1000 : 0,
        model: 'careerly-agent',
        intent: response.intent,
        agents_used: response.agents_used,
        persona_level: response.persona_level,
        confidence: response.confidence,
        p1_score: response.p1_score,
        p2_achieved: response.p2_achieved,
      },
    };
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Health Check
 * Note: Django backend에는 별도 health check 엔드포인트 없음
 * 필요시 별도 구현 필요
 */
export async function checkAgentHealth(): Promise<{ status: string }> {
  // Placeholder - Django backend에 health check 엔드포인트 추가 필요
  return { status: 'healthy' };
}

/**
 * 3개 버전 API를 병렬로 호출하여 결과 비교
 * Note: 현재 Django backend는 단일 응답만 제공
 * UI 호환성을 위해 동일한 결과를 3개 버전으로 복제
 * @param query - 사용자 질문
 * @param userId - 사용자 ID (사용 안 함, 인증 토큰에서 자동 추출)
 * @param sessionId - 세션 ID (선택사항)
 * @returns 버전별 결과 객체 (현재는 모두 동일한 결과)
 */
export async function chatSearchAllVersions(
  query: string,
  userId?: string,
  sessionId?: string
): Promise<ChatComparisonResult> {
  try {
    // Django backend는 단일 응답만 제공하므로 한 번만 호출
    const result = await chatSearch(query, userId, sessionId);

    // UI 호환성을 위해 동일한 결과를 3개 버전으로 복제
    return {
      v1Result: result,
      v3Result: result,
      v4Result: result,
    };
  } catch (error) {
    console.error('Chat search error:', error);
    return {
      v1Result: null,
      v3Result: null,
      v4Result: null,
    };
  }
}

/**
 * SSE 이벤트 파싱
 */
function parseSSEEvent(
  line: string
): { event: string; data: string } | null {
  // SSE 이벤트 형식: "event: xxx\ndata: yyy"
  const eventMatch = line.match(/^event:\s*(.+)$/);
  const dataMatch = line.match(/^data:\s*(.+)$/);

  if (eventMatch) {
    return { event: eventMatch[1], data: '' };
  }
  if (dataMatch) {
    return { event: '', data: dataMatch[1] };
  }
  return null;
}

/**
 * 스트리밍 Chat 메시지 전송 (SSE)
 * fetch + ReadableStream을 사용하여 POST SSE 처리
 * Django 백엔드에 직접 요청하여 httpOnly 쿠키 자동 전송
 * @param content - 사용자 질문
 * @param sessionId - 세션 ID (선택)
 * @param callbacks - SSE 이벤트 콜백
 * @param options - 추가 옵션 (personalized 등)
 * @returns 스트림 중단을 위한 cleanup 함수
 */
export function streamChatMessage(
  content: string,
  sessionId: string | null,
  callbacks: StreamCallbacks,
  options?: { personalized?: boolean }
): () => void {
  const abortController = new AbortController();

  const startStream = async () => {
    try {
      // Django 백엔드에 직접 요청 (브라우저가 자동으로 httpOnly 쿠키 전송)
      const response = await fetch(`${API_CONFIG.REST_BASE_URL}/api/v1/chat/stream/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        credentials: 'include',
        body: JSON.stringify({
          content,
          session_id: sessionId,
          personalized: options?.personalized ?? false,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = '스트리밍 연결 실패';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.error || error.message || errorMessage;
        } catch {
          // JSON 파싱 실패 시 기본 메시지 사용
        }
        callbacks.onError?.(errorMessage, String(response.status));
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        callbacks.onError?.('스트림 리더를 생성할 수 없습니다.', 'NO_READER');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (!trimmedLine) {
            continue;
          }

          // event: 라인 처리
          if (trimmedLine.startsWith('event:')) {
            currentEvent = trimmedLine.slice(6).trim();
            continue;
          }

          // data: 라인 처리
          if (trimmedLine.startsWith('data:')) {
            const dataStr = trimmedLine.slice(5).trim();

            try {
              const data = JSON.parse(dataStr);

              switch (currentEvent) {
                case 'session': {
                  const sessionData = data as SSESessionEvent;
                  callbacks.onSession?.(sessionData.session_id);
                  break;
                }
                case 'status': {
                  const statusData = data as SSEStatusEvent;
                  callbacks.onStatus?.(statusData.step, statusData.message);
                  break;
                }
                case 'token': {
                  const tokenData = data as SSETokenEvent;
                  callbacks.onToken?.(tokenData.content);
                  break;
                }
                case 'sources': {
                  const sourcesData = data as SSESourcesEvent;
                  callbacks.onSources?.(sourcesData.sources, sourcesData.count);
                  break;
                }
                case 'complete': {
                  const completeData = data as SSECompleteEvent;
                  callbacks.onComplete?.(completeData);
                  break;
                }
                case 'error': {
                  const errorData = data as SSEErrorEvent;
                  callbacks.onError?.(errorData.error, errorData.code);
                  break;
                }
                case 'agent_progress': {
                  const agentProgressData = data as SSEAgentProgressEvent;
                  callbacks.onAgentProgress?.(agentProgressData);
                  break;
                }
                case 'profile_summary': {
                  const profileData = data as SSEProfileSummaryEvent;
                  callbacks.onProfileSummary?.(profileData);
                  break;
                }
                default:
                  // 알 수 없는 이벤트는 무시
              }
            } catch {
              // JSON 파싱 실패 시 무시 (keep-alive 메시지 등)
            }

            currentEvent = '';
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 사용자가 중단한 경우
        return;
      }

      console.error('Stream error:', error);
      callbacks.onError?.(
        error instanceof Error ? error.message : '스트리밍 중 오류가 발생했습니다.',
        'STREAM_ERROR'
      );
    }
  };

  startStream();

  // cleanup 함수 반환
  return () => {
    abortController.abort();
  };
}

/**
 * 세션 조회 (인증 필요, 본인 세션만)
 * @param sessionId - 조회할 세션 ID
 * @returns 세션 정보 및 메시지 목록
 */
export async function getChatSession(sessionId: string): Promise<ChatSession> {
  try {
    const response = await chatClient.get<ChatSession>(`/sessions/${sessionId}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 공개 세션 조회 (인증 불필요)
 * @param sessionId - 조회할 세션 ID
 * @returns 공개 세션 정보 및 메시지 목록
 */
export async function getPublicChatSession(sessionId: string): Promise<ChatSession> {
  try {
    const response = await chatClient.get<ChatSession>(`/sessions/public/${sessionId}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 세션 조회 (인증 API 먼저 시도 → 실패 시 공개 API fallback)
 * @param sessionId - 조회할 세션 ID
 * @returns 세션 정보 및 메시지 목록
 */
export async function getChatSessionWithFallback(sessionId: string): Promise<ChatSession> {
  try {
    // 먼저 인증된 API 시도
    const response = await chatClient.get<ChatSession>(`/sessions/${sessionId}/`);
    return response.data;
  } catch (error) {
    // 인증 에러(401, 403, 404)면 공개 API 시도
    try {
      const publicResponse = await chatClient.get<ChatSession>(`/sessions/public/${sessionId}/`);
      return publicResponse.data;
    } catch (publicError) {
      // 둘 다 실패하면 원래 에러 던지기
      throw handleApiError(publicError);
    }
  }
}

/**
 * 공유 페이지용 세션 조회 (공개 API 먼저 시도 → 실패 시 인증 API fallback)
 * 로그인 없이도 공개 세션 조회 가능, 로그인한 경우 비공개 세션도 미리보기 가능
 * @param sessionId - 조회할 세션 ID
 * @returns 세션 정보 및 메시지 목록
 */
export async function getSharePageSession(sessionId: string): Promise<ChatSession> {
  try {
    // 먼저 공개 API 시도 (로그인 없이도 접근 가능)
    const publicResponse = await chatClient.get<ChatSession>(`/sessions/public/${sessionId}/`);
    return publicResponse.data;
  } catch (publicError) {
    // 공개 API 실패 시 인증 API 시도 (본인 세션 미리보기용)
    // fetch 직접 사용하여 인터셉터 우회 (로그인 모달 방지)
    try {
      const response = await fetch(`${API_CONFIG.REST_BASE_URL}/api/v1/chat/sessions/${sessionId}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (authError) {
      // 둘 다 실패하면 공개 API 에러 던지기 (더 적절한 메시지)
      throw handleApiError(publicError);
    }
  }
}

/**
 * 세션 공유 설정 변경
 * @param sessionId - 세션 ID
 * @param isPublic - 공개 여부
 * @returns 업데이트된 세션 정보
 */
export async function shareChatSession(
  sessionId: string,
  isPublic: boolean
): Promise<ChatSession> {
  try {
    const request: ShareSessionRequest = { is_public: isPublic };
    // POST 메서드 사용 (백엔드가 PATCH를 지원하지 않음)
    const response = await chatClient.post<ChatSession>(`/sessions/${sessionId}/share/`, request);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 세션을 커뮤니티에 포스트로 공유
 * ChatSession을 Post로 변환하여 커뮤니티 피드에 노출
 * @param sessionId - 공유할 세션 ID
 * @returns 생성된 포스트 정보
 */
export async function shareSessionToCommunity(
  sessionId: string
): Promise<ShareToCommunityResponse> {
  try {
    const response = await chatClient.post<ShareToCommunityResponse>(
      `/sessions/${sessionId}/share-to-community/`
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 트렌딩 세션 조회 (인증 불필요)
 * @param limit - 조회할 세션 개수 (기본값: 4)
 * @returns 트렌딩 세션 목록
 */
export async function getTrendingSessions(
  limit: number = 4
): Promise<import('../types/chat.types').TrendingSessionsResponse> {
  try {
    const response = await chatClient.get<import('../types/chat.types').TrendingSessionsResponse>(
      '/sessions/trending/',
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 내 세션 목록 조회 (인증 필요)
 * @param page - 페이지 번호 (1부터 시작)
 * @param pageSize - 페이지당 개수
 * @returns 세션 목록
 */
export async function getChatSessions(
  page: number = 1,
  pageSize: number = 20
): Promise<ChatSessionListResponse> {
  try {
    const response = await chatClient.get<ChatSessionListResponse>('/sessions/', {
      params: {
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 메시지 피드백 제출 (좋아요/싫어요)
 * @param messageId - 메시지 ID
 * @param isLiked - 좋아요(true) / 싫어요(false)
 * @param feedbackText - 선택적 피드백 텍스트
 * @returns 업데이트된 메시지
 */
export async function submitMessageFeedback(
  messageId: string,
  isLiked: boolean,
  feedbackText?: string
): Promise<import('../types/chat.types').MessageFeedbackResponse> {
  try {
    const response = await chatClient.patch<import('../types/chat.types').MessageFeedbackResponse>(
      `/messages/${messageId}/feedback/`,
      {
        is_liked: isLiked,
        ...(feedbackText && { feedback_text: feedbackText }),
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 세션 삭제 (인증 필요, 본인 세션만)
 * @param sessionId - 삭제할 세션 ID
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  try {
    await chatClient.delete(`/sessions/${sessionId}/`);
  } catch (error) {
    throw handleApiError(error);
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
