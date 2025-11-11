/**
 * API 로거 인터셉터 (개발 환경용)
 * 요청/응답을 콘솔에 로깅합니다.
 */

import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 요청 로깅
 */
function logRequest(config: InternalAxiosRequestConfig): void {
  console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  console.log('Headers:', config.headers);
  if (config.params) {
    console.log('Params:', config.params);
  }
  if (config.data) {
    console.log('Body:', config.data);
  }
  console.groupEnd();
}

/**
 * 응답 로깅
 */
function logResponse(response: AxiosResponse): void {
  const duration = response.config.headers?.['X-Request-Start']
    ? Date.now() - Number(response.config.headers['X-Request-Start'])
    : 0;

  console.group(
    `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`
  );
  console.log('Status:', response.status);
  console.log('Data:', response.data);
  console.groupEnd();
}

/**
 * 에러 로깅
 */
function logError(error: any): void {
  console.group(
    `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`
  );
  console.log('Status:', error.response?.status);
  console.log('Error:', error.message);
  if (error.response?.data) {
    console.log('Response:', error.response.data);
  }
  console.groupEnd();
}

/**
 * Axios 인스턴스에 로깅 인터셉터 추가 (개발 환경에서만)
 */
export function setupLoggerInterceptor(axiosInstance: AxiosInstance): void {
  // 개발 환경에서만 활성화
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // 요청 인터셉터
  axiosInstance.interceptors.request.use(
    (config) => {
      // 요청 시작 시간 기록
      config.headers['X-Request-Start'] = Date.now().toString();
      logRequest(config);
      return config;
    },
    (error) => {
      console.error('Request setup error:', error);
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  axiosInstance.interceptors.response.use(
    (response) => {
      logResponse(response);
      return response;
    },
    (error) => {
      logError(error);
      return Promise.reject(error);
    }
  );
}
