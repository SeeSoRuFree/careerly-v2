/**
 * API 설정 파일
 * 환경변수를 기반으로 API 클라이언트 설정을 관리합니다.
 */

export const API_CONFIG = {
  // RESTful API Base URL
  REST_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',

  // GraphQL API URL
  GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPH_API_HOST || '',

  // API 타임아웃 (밀리초)
  TIMEOUT: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,

  // 재시도 설정
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1초
    STATUS_CODES: [408, 429, 500, 502, 503, 504], // 재시도할 HTTP 상태 코드
  },

  // 인증 설정
  AUTH: {
    TOKEN_REFRESH_ENDPOINT: '/api/auth/refresh',
    LOGIN_ENDPOINT: '/api/auth/login',
    LOGOUT_ENDPOINT: '/api/auth/logout',
  },
} as const;

/**
 * 환경별 설정 검증
 */
export function validateApiConfig() {
  const missingVars: string[] = [];

  if (!API_CONFIG.REST_BASE_URL) {
    missingVars.push('NEXT_PUBLIC_API_BASE_URL');
  }

  if (!API_CONFIG.GRAPHQL_URL) {
    missingVars.push('NEXT_PUBLIC_GRAPH_API_HOST');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// 개발 환경에서 설정 검증
if (process.env.NODE_ENV === 'development') {
  try {
    validateApiConfig();
    console.log('✅ API configuration validated successfully');
  } catch (error) {
    console.error('❌ API configuration validation failed:', error);
  }
}
