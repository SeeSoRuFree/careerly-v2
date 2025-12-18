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
export type SSEEventType = 'session' | 'status' | 'token' | 'sources' | 'complete' | 'error' | 'agent_progress';

/**
 * SSE Status 이벤트 step 타입
 */
export type SSEStatusStep = 'intent' | 'routing' | 'searching' | 'generating';

/**
 * SSE Session 이벤트 데이터 (스트리밍 시작 시 세션 ID 반환)
 */
export interface SSESessionEvent {
  session_id: string;
}

/**
 * Agent Progress Event Type
 */
export type AgentProgressType = 'start' | 'complete';

/**
 * Agent Progress Status
 */
export type AgentProgressStatus = 'running' | 'success' | 'failed' | 'timeout';

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
 * SSE Agent Progress 이벤트 데이터
 */
export interface SSEAgentProgressEvent {
  type: AgentProgressType;
  agent_type: string;
  agent_name: string;
  agent_description?: string;
  icon?: string;
  color?: string;
  status: AgentProgressStatus;
  execution_time_ms?: number;
  error?: string | null;
  is_fallback?: boolean;
}

/**
 * 스트리밍 콜백 인터페이스
 */
export interface StreamCallbacks {
  onSession?: (sessionId: string) => void;
  onStatus?: (step: SSEStatusStep, message: string) => void;
  onToken?: (content: string) => void;
  onSources?: (sources: string[], count: number) => void;
  onComplete?: (metadata: SSECompleteEvent) => void;
  onError?: (error: string, code?: string) => void;
  onAgentProgress?: (data: SSEAgentProgressEvent) => void;
}

/**
 * Chat 세션 메시지 타입
 */
export interface ChatSessionMessage {
  /** 메시지 ID */
  id: string;
  /** 메시지 역할 (user/assistant) */
  role: 'user' | 'assistant';
  /** 메시지 내용 */
  content: string;
  /** 구조화된 출처 정보 (assistant만) */
  sources?: ChatSources;
  /** 질문 의도 분류 (assistant만) */
  intent?: string;
  /** 사용된 에이전트 목록 (assistant만) */
  agents_used?: string[];
  /** 메시지 생성 시간 */
  created_at: string;
  /** 답변 신뢰도 (assistant만) */
  confidence?: number;
  /** 응답 생성 지연시간 (ms, assistant만) */
  latency_ms?: number;
  /** P1 점수 (1-5, V4 only, assistant만) */
  p1_score?: number;
  /** P2 달성 여부 (V4 only, assistant만) */
  p2_achieved?: boolean;
  /** LangSmith trace ID (assistant만) */
  langsmith_run_id?: string;
  /** 사용자 피드백: 좋아요(true)/싫어요(false)/미평가(null) */
  is_liked?: boolean | null;
  /** 피드백 텍스트 */
  feedback_text?: string | null;
  /** 피드백 제출 시간 */
  feedback_at?: string | null;
  /** 피드백 제출 여부 */
  has_feedback?: boolean;
}

/**
 * 메시지 피드백 요청 타입
 */
export interface MessageFeedbackRequest {
  /** 좋아요(true) / 싫어요(false) */
  is_liked: boolean;
  /** 선택적 피드백 텍스트 */
  feedback_text?: string;
}

/**
 * 메시지 피드백 응답 타입 (업데이트된 메시지 반환)
 */
export type MessageFeedbackResponse = ChatSessionMessage;

/**
 * Chat 세션 타입
 */
export interface ChatSession {
  /** 세션 ID */
  id: string;
  /** 세션 제목 (첫 질문 기반) */
  title: string;
  /** 세션 생성 시간 */
  created_at: string;
  /** 세션 수정 시간 */
  updated_at: string;
  /** 메시지 개수 */
  message_count: number;
  /** 공개 여부 */
  is_public: boolean;
  /** 커뮤니티에 공유된 포스트 ID (있으면 이미 공유됨) */
  shared_post_id?: number;
  /** 세션 메시지 목록 */
  messages: ChatSessionMessage[];
}

/**
 * 세션 공유 요청 타입
 */
export interface ShareSessionRequest {
  is_public: boolean;
}

/**
 * 커뮤니티 공유 응답 타입
 * ChatSession을 Post로 변환하여 커뮤니티에 공유
 */
export interface ShareToCommunityResponse {
  /** 생성된 포스트 ID */
  id: number;
  /** 포스트 제목 (세션 첫 질문 기반) */
  title: string;
  /** 포스트 설명 */
  description: string;
  /** 포스트 타입 (10 = AI 검색 포스트) */
  posttype: number;
  /** 채팅 세션 데이터 */
  chat_data: {
    session_id: string;
    messages: ChatSessionMessage[];
  };
}

/**
 * 트렌딩 세션 작성자 타입
 */
export interface TrendingSessionAuthor {
  /** 작성자 ID */
  id: string;
  /** 닉네임 */
  nickname: string;
  /** 직무 */
  jobTitle?: string;
  /** 익명 여부 */
  isAnonymous: boolean;
  /** 아바타 URL */
  avatarUrl?: string;
}

/**
 * 트렌딩 세션 타입 (GET /api/v1/sessions/trending/)
 */
export interface TrendingSession {
  /** 세션 ID */
  id: string;
  /** 첫 번째 질문 */
  question: string;
  /** AI 답변 미리보기 */
  answerPreview: string;
  /** 좋아요 수 */
  likeCount: number;
  /** 댓글 수 */
  commentCount: number;
  /** 작성자 정보 */
  author: TrendingSessionAuthor;
  /** 태그 목록 */
  tags: string[];
  /** 생성 시간 (선택) */
  createdAt?: string;
}

/**
 * 트렌딩 세션 API 응답 타입
 */
export interface TrendingSessionsResponse {
  /** 총 개수 */
  count: number;
  /** 트렌딩 세션 목록 */
  results: TrendingSession[];
}
