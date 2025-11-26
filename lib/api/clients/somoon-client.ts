/**
 * Somoon API 클라이언트
 * Axios 기반으로 Somoon API와 통신합니다.
 */

import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config';
import { setupRetryInterceptor } from '../interceptors/retry-handler';
import { setupLoggerInterceptor } from '../interceptors/logger';

/**
 * Somoon API 클라이언트
 * - Base URL: /api/somoon (Next.js proxy to https://somoon.ai)
 * - CSRF 토큰 자동 주입
 */
export const somoonClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.SOMOON_API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': API_CONFIG.SOMOON_CSRF_TOKEN,
  },
});

// 재시도 인터셉터
setupRetryInterceptor(somoonClient);

// 로거 인터셉터 (개발 환경)
setupLoggerInterceptor(somoonClient);

/**
 * 공통 에러 핸들러
 * 서비스 레이어에서 사용
 */
export { handleApiError } from '../interceptors/error-handler';
