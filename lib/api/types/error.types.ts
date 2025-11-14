/**
 * API 에러 타입 정의
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ErrorResponse {
  code: string;
  message: string;
  data?: unknown;
}

/**
 * 에러 코드 상수
 */
export const ERROR_CODES = {
  // 네트워크 에러
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // 인증 에러
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  REFRESH_FAILED: 'REFRESH_FAILED',
  NO_REFRESH_TOKEN: 'NO_REFRESH_TOKEN',

  // 권한 에러
  FORBIDDEN: 'FORBIDDEN',

  // 리소스 에러
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // 서버 에러
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // 클라이언트 에러
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // 알 수 없는 에러
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * 에러 메시지 맵
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  TIMEOUT: '요청 시간이 초과되었습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  TOKEN_EXPIRED: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  INVALID_TOKEN: '유효하지 않은 인증 정보입니다.',
  REFRESH_FAILED: '인증 정보 갱신에 실패했습니다.',
  NO_REFRESH_TOKEN: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  CONFLICT: '이미 존재하는 데이터입니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
  SERVICE_UNAVAILABLE: '서비스를 일시적으로 사용할 수 없습니다.',
  BAD_REQUEST: '잘못된 요청입니다.',
  VALIDATION_ERROR: '입력 값을 확인해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};

/**
 * 에러 핸들러 옵션
 */
export interface ErrorHandlerOptions {
  showToast?: boolean;
  customMessage?: string;
  logError?: boolean;
}
