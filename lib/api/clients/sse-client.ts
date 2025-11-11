/**
 * SSE (Server-Sent Events) 클라이언트
 * 실시간 스트리밍을 위한 EventSource 래퍼
 */

import { API_CONFIG } from '../config';
import { getAuthToken } from '../auth/token.client';

/**
 * SSE 이벤트 핸들러 타입
 */
export interface SSEEventHandlers {
  onToken?: (token: string) => void;
  onCitation?: (citation: unknown) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * SSE 연결 옵션
 */
export interface SSEOptions extends SSEEventHandlers {
  withAuth?: boolean;
}

/**
 * SSE 클라이언트 클래스
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private handlers: SSEEventHandlers = {};

  /**
   * SSE 연결 시작
   */
  connect(endpoint: string, options: SSEOptions = {}): EventSource {
    const { withAuth = true, ...handlers } = options;
    this.handlers = handlers;

    // 기존 연결이 있으면 종료
    if (this.eventSource) {
      this.disconnect();
    }

    // URL 구성
    let url = endpoint.startsWith('http')
      ? endpoint
      : `${API_CONFIG.REST_BASE_URL}${endpoint}`;

    // 인증 토큰 추가 (EventSource는 헤더를 지원하지 않으므로 query param 사용)
    if (withAuth) {
      const token = getAuthToken();
      if (token) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}token=${encodeURIComponent(token)}`;
      }
    }

    // EventSource 생성
    this.eventSource = new EventSource(url);

    // 이벤트 리스너 등록
    this.setupEventListeners();

    return this.eventSource;
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // 토큰 이벤트
    this.eventSource.addEventListener('token', (event) => {
      this.handlers.onToken?.(event.data);
    });

    // Citation 이벤트
    this.eventSource.addEventListener('citation', (event) => {
      try {
        const citation = JSON.parse(event.data);
        this.handlers.onCitation?.(citation);
      } catch (error) {
        console.error('Failed to parse citation:', error);
      }
    });

    // 완료 이벤트
    this.eventSource.addEventListener('complete', () => {
      this.handlers.onComplete?.();
      this.disconnect();
    });

    // 에러 이벤트
    this.eventSource.onerror = (event) => {
      console.error('SSE Error:', event);
      this.handlers.onError?.('스트림 연결 오류가 발생했습니다.');
      this.disconnect();
    };

    // 일반 메시지 이벤트
    this.eventSource.onmessage = (event) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('SSE Message:', event.data);
      }
    };
  }

  /**
   * SSE 연결 종료
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState !== EventSource.CLOSED;
  }

  /**
   * 연결 상태 (ReadyState)
   */
  getReadyState(): number | null {
    return this.eventSource?.readyState ?? null;
  }

  /**
   * 리셋 (연결 종료와 동일)
   */
  reset(): void {
    this.disconnect();
  }
}

/**
 * SSE 클라이언트 싱글톤 인스턴스
 */
let sseClientInstance: SSEClient | null = null;

/**
 * SSE 클라이언트 인스턴스 가져오기
 */
export function getSSEClient(): SSEClient {
  if (!sseClientInstance) {
    sseClientInstance = new SSEClient();
  }
  return sseClientInstance;
}

/**
 * SSE 클라이언트 생성 (새 인스턴스)
 */
export function createSSEClient(): SSEClient {
  return new SSEClient();
}
