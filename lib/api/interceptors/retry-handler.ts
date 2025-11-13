/**
 * API 재시도 핸들러
 * 특정 HTTP 상태 코드에 대해 자동으로 재시도합니다.
 */

import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config';

interface RetryConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
  lastRetryTime?: number;
}

/**
 * 재시도 가능한 에러인지 확인
 */
function isRetryableError(error: AxiosError): boolean {
  // 네트워크 에러는 재시도
  if (!error.response) {
    return true;
  }

  // 설정된 상태 코드는 재시도
  const status = error.response.status;
  return API_CONFIG.RETRY.STATUS_CODES.includes(status as any);
}

/**
 * 재시도 대기 시간 계산 (exponential backoff)
 */
function calculateRetryDelay(retryCount: number): number {
  const baseDelay = API_CONFIG.RETRY.DELAY;
  const delay = baseDelay * Math.pow(2, retryCount - 1);
  // 최대 10초까지만
  return Math.min(delay, 10000);
}

/**
 * 대기 함수
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Axios 인스턴스에 재시도 인터셉터 추가
 */
export function setupRetryInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig & RetryConfig;

      // 재시도 불가능한 경우
      if (!config || !isRetryableError(error)) {
        throw error;
      }

      // 재시도 횟수 초기화
      config.retryCount = config.retryCount || 0;

      // 최대 재시도 횟수 초과
      if (config.retryCount >= API_CONFIG.RETRY.MAX_ATTEMPTS) {
        if (process.env.NODE_ENV === 'development') {
          console.error(
            `Max retry attempts (${API_CONFIG.RETRY.MAX_ATTEMPTS}) exceeded for ${config.url}`
          );
        }
        throw error;
      }

      // 재시도 횟수 증가
      config.retryCount += 1;

      // 재시도 대기
      const delay = calculateRetryDelay(config.retryCount);
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Retrying request (${config.retryCount}/${API_CONFIG.RETRY.MAX_ATTEMPTS}) to ${config.url} after ${delay}ms`
        );
      }

      await wait(delay);

      // 재시도 시간 기록
      config.lastRetryTime = Date.now();

      // 요청 재시도
      return axiosInstance(config);
    }
  );
}

/**
 * 특정 요청에 대해 재시도 비활성화
 */
export function disableRetry(config: InternalAxiosRequestConfig): RetryConfig {
  return {
    ...config,
    retryCount: API_CONFIG.RETRY.MAX_ATTEMPTS, // 최대값으로 설정하여 재시도 방지
  };
}
