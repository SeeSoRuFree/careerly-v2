/**
 * 인증 인터셉터
 * 401 에러 발생 시 토큰 갱신을 시도합니다.
 */

import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getMemoryToken, clearMemoryToken } from './token.client';
import { useStore } from '@/hooks/useStore';

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let refreshRejectSubscribers: Array<(error: Error) => void> = [];

/**
 * 토큰 갱신 대기 중인 요청들을 등록
 */
function subscribeTokenRefresh(
  onResolved: (token: string) => void,
  onRejected: (error: Error) => void
): void {
  refreshSubscribers.push(onResolved);
  refreshRejectSubscribers.push(onRejected);
}

/**
 * 토큰 갱신 완료 시 대기 중인 요청들에게 알림
 */
function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
  refreshRejectSubscribers = [];
}

/**
 * 토큰 갱신 실패 시 대기 중인 요청들을 거부
 */
function onTokenRefreshFailed(error: Error): void {
  refreshRejectSubscribers.forEach((callback) => callback(error));
  refreshSubscribers = [];
  refreshRejectSubscribers = [];
}

/**
 * Axios 인스턴스에 인증 인터셉터 추가
 */
export function setupAuthInterceptor(axiosInstance: AxiosInstance): void {
  // 요청 인터셉터: 메모리 토큰이 있으면 헤더에 추가 (백업용)
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getMemoryToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터: 401 에러 시 토큰 갱신
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // 401 에러가 아니거나 이미 재시도한 경우
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // 인증 관련 엔드포인트는 토큰 갱신 시도하지 않음 (무한 루프 방지)
      const url = originalRequest.url || '';
      if (url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/logout')) {
        return Promise.reject(error);
      }

      // 재시도 플래그 설정
      originalRequest._retry = true;

      // 이미 토큰 갱신 중인 경우 - 대기열에 등록
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            (err: Error) => {
              reject(err);
            }
          );
        });
      }

      // 토큰 갱신 시작
      isRefreshing = true;

      try {
        // 백엔드에 직접 토큰 갱신 요청
        const { API_CONFIG } = await import('../config');
        const response = await fetch(`${API_CONFIG.REST_BASE_URL}/api/v1/auth/refresh/`, {
          method: 'POST',
          credentials: 'include', // 쿠키 전송 허용
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        const newToken = data.access;

        // 새 토큰으로 헤더 업데이트
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // 대기 중인 요청들에게 알림
        onTokenRefreshed(newToken);

        isRefreshing = false;

        // 원래 요청 재시도
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        // 메모리 토큰 정리
        clearMemoryToken();

        // 대기 중인 요청들 reject
        const error = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
        onTokenRefreshFailed(error);

        // POST/PUT/DELETE/PATCH 요청에서만 로그인 모달 열기 (액션 수행 시도)
        // GET 요청은 단순 데이터 조회이므로 조용히 처리
        const method = originalRequest.method?.toUpperCase();
        const isActionRequest = method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

        if (isActionRequest) {
          useStore.getState().openLoginModal();
        }

        return Promise.reject(error);
      }
    }
  );
}
