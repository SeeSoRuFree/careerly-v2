/**
 * Careerly Chat API 타입 정의
 * Django Backend: /api/v1/chat/
 */

/**
 * API 버전 타입 (향후 확장용)
 */
export type ApiVersion = 'v1' | 'v3' | 'v4';

/**
 * Chat API 요청 타입 (Django Backend)
 */
export interface ChatRequest {
  /** 사용자 질문/메시지 (최대 5000자) */
  content: string;
  /** 대화 세션 ID (선택, 없으면 자동 생성) */
  session_id?: string;
}

/**
 * 구조화된 출처 타입
 */
export interface ChatSources {
  /** 전체 출처 목록 */
  all: string[];
  /** Somoon RAG 문서 출처 */
  document: string[];
  /** Careerly Q&A 출처 */
  careerly: string[];
  /** 웹 검색 출처 */
  web: string[];
}

/**
 * Chat API 응답 타입 (Django Backend)
 */
export interface ChatResponse {
  /** 세션 ID */
  session_id: string;
  /** 메시지 ID */
  message_id: string;
  /** AI 생성 답변 */
  content: string;
  /** 구조화된 출처 정보 */
  sources: ChatSources;
  /** 전체 출처 개수 */
  source_count?: number;
  /** 질문 의도 분류 */
  intent?: string;
  /** 사용된 에이전트 목록 */
  agents_used?: string[];
  /** 사용자 레벨 (V4 only) */
  persona_level?: string;
  /** 답변 신뢰도 (0.0-1.0) */
  confidence?: number;
  /** 응답 생성 지연시간 (ms) */
  latency_ms?: number;
  /** P1 점수 (1-5, V4 only) */
  p1_score?: number;
  /** P2 달성 여부 (V4 only) */
  p2_achieved?: boolean;
  /** 메시지 생성 시간 */
  created_at: string;
  /** LangSmith trace ID */
  langsmith_run_id?: string;
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
 * Chat 메타데이터 타입
 */
export interface ChatMetadata {
  processing_time: number;
  model: string;
  intent?: string;
  agents_used?: string[];
  persona_level?: string;
  confidence?: number;
  p1_score?: number;
  p2_achieved?: boolean;
  [key: string]: unknown;
}

/**
 * Chat 결과를 기존 SearchResult 형식으로 변환한 타입
 */
export interface ChatSearchResult {
  query: string;
  answer: string;
  citations: ChatCitation[];
  session_id?: string;
  metadata?: ChatMetadata;
}

/**
 * API 버전별 응답 비교 결과 타입
 * 여러 버전의 API 응답을 동시에 비교하기 위해 사용
 */
export interface ChatComparisonResult {
  /** v1 API 응답 결과 (에러 발생 시 null) */
  v1Result: ChatSearchResult | null;
  /** v3 API 응답 결과 (에러 발생 시 null) */
  v3Result: ChatSearchResult | null;
  /** v4 API 응답 결과 (에러 발생 시 null) */
  v4Result: ChatSearchResult | null;
}

/**
 * SSE 이벤트 타입
 */
export type SSEEventType = 'status' | 'token' | 'sources' | 'complete' | 'error';

/**
 * SSE Status 이벤트 step 타입
 */
export type SSEStatusStep = 'intent' | 'searching' | 'generating';

/**
 * SSE Status 이벤트 데이터
 */
export interface SSEStatusEvent {
  step: SSEStatusStep;
  message: string;
}

/**
 * SSE Token 이벤트 데이터
 */
export interface SSETokenEvent {
  content: string;
}

/**
 * SSE Sources 이벤트 데이터
 */
export interface SSESourcesEvent {
  sources: string[];
  count: number;
}

/**
 * SSE Complete 이벤트 데이터
 */
export interface SSECompleteEvent {
  intent?: string;
  agents_used?: string[];
  execution_time_ms?: number;
  session_id?: string;
  message_id?: string;
  /** 최종 답변 (token 스트리밍 대신 complete에서 전체 답변을 보낼 때 사용) */
  answer?: string;
  /** 메타데이터 */
  metadata?: {
    intent_confidence?: number;
    intent_reasoning?: string;
    complexity?: string;
    execution_mode?: string;
    success_rate?: number;
    synthesis_metadata?: Record<string, unknown>;
  };
}

/**
 * SSE Error 이벤트 데이터
 */
export interface SSEErrorEvent {
  error: string;
  code?: string;
}

/**
 * 스트리밍 콜백 인터페이스
 */
export interface StreamCallbacks {
  onStatus?: (step: SSEStatusStep, message: string) => void;
  onToken?: (content: string) => void;
  onSources?: (sources: string[], count: number) => void;
  onComplete?: (metadata: SSECompleteEvent) => void;
  onError?: (error: string, code?: string) => void;
}
