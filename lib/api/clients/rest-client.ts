/**
 * RESTful API 클라이언트
 * Axios 기반으로 인증 필요 여부에 따라 두 개의 클라이언트를 제공합니다.
 */

import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config';
import { setupRetryInterceptor } from '../interceptors/retry-handler';
import { setupLoggerInterceptor } from '../interceptors/logger';
import { setupAuthInterceptor } from '../auth/interceptor';

/**
 * 기본 Axios 설정
 */
const baseConfig = {
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // httpOnly 쿠키 전송
};

/**
 * 🔓 Public API 클라이언트 (인증 불필요)
 */
export const publicClient: AxiosInstance = axios.create({
  ...baseConfig,
  baseURL: API_CONFIG.REST_BASE_URL,
});

// 재시도 인터셉터
setupRetryInterceptor(publicClient);

// 로거 인터셉터 (개발 환경)
setupLoggerInterceptor(publicClient);

/**
 * 🔒 Auth API 클라이언트 (인증 필요)
 */
export const authClient: AxiosInstance = axios.create({
  ...baseConfig,
  baseURL: API_CONFIG.REST_BASE_URL,
});

// 인증 인터셉터 (401 에러 시 토큰 갱신)
setupAuthInterceptor(authClient);

// 재시도 인터셉터
setupRetryInterceptor(authClient);

// 로거 인터셉터 (개발 환경)
setupLoggerInterceptor(authClient);

/**
 * 공통 에러 핸들러
 * 서비스 레이어에서 사용
 */
export { handleApiError } from '../interceptors/error-handler';
