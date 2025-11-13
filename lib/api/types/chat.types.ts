/**
 * Careerly Agent API 타입 정의
 * API 문서: https://seulchankim--careerly-agent-poc-fastapi-app.modal.run/docs
 */

/**
 * Chat API 요청 타입
 */
export interface ChatRequest {
  /** 사용자 질문 (1-2000자) */
  query: string;
  /** 사용자 식별자 (선택) */
  user_id?: string;
  /** 대화 세션 ID (선택, 없으면 자동 생성) */
  session_id?: string;
}

/**
 * Chat API 응답 타입
 */
export interface ChatResponse {
  /** 최종 답변 텍스트 */
  answer: string;
  /** 세션 ID (다음 질문 시 포함하면 대화 이어짐) */
  session_id: string;
  /** 질문 유형 */
  intent: 'factual_query' | 'web_search' | 'hybrid' | 'general';
  /** 출처 URL 배열 */
  sources: string[];
  /** 사용된 에이전트 목록 */
  agents_used: string[];
  /** 메타데이터 */
  metadata: {
    /** 처리 시간 (초) */
    processing_time: number;
    /** 사용된 모델 */
    model: string;
    [key: string]: unknown;
  };
  /** 타임스탬프 */
  timestamp: string;
}

/**
 * Health Check 응답 타입
 */
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  orchestrator: string;
  agents: string[];
  timestamp: string;
  version: string;
}

/**
 * Citation 타입 (기존 타입과 호환)
 */
export interface ChatCitation {
  id: string;
  title: string;
  url: string;
  snippet?: string;
}

/**
 * Chat 결과를 기존 SearchResult 형식으로 변환한 타입
 */
export interface ChatSearchResult {
  query: string;
  answer: string;
  citations: ChatCitation[];
  session_id?: string;
  metadata?: ChatResponse['metadata'];
}
