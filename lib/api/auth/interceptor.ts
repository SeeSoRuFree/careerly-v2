/**
 * 인증 인터셉터
 * 401 에러 발생 시 토큰 갱신을 시도합니다.
 */

import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getMemoryToken } from './token.client';

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * 토큰 갱신 대기 중인 요청들을 처리
 */
function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

/**
 * 토큰 갱신 완료 시 대기 중인 요청들에게 알림
 */
function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * 토큰 갱신 실패 시 대기 중인 요청들을 거부
 */
function onTokenRefreshFailed(): void {
  refreshSubscribers = [];
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

      // 재시도 플래그 설정
      originalRequest._retry = true;

      // 이미 토큰 갱신 중인 경우
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      // 토큰 갱신 시작
      isRefreshing = true;

      try {
        // 서버에 토큰 갱신 요청
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        const newToken = data.accessToken;

        // 새 토큰으로 헤더 업데이트
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // 대기 중인 요청들에게 알림
        onTokenRefreshed(newToken);

        isRefreshing = false;

        // 원래 요청 재시도
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onTokenRefreshFailed();

        // 토큰 갱신 실패 시 로그인 페이지로 이동
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }
  );
}
