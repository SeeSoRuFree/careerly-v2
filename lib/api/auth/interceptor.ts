/**
 * 인증 인터셉터
 * 401 에러 발생 시 토큰 갱신을 시도합니다.
 */

import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getMemoryToken, setMemoryToken, clearMemoryToken } from './token.client';
import { useStore } from '@/hooks/useStore';

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let refreshRejectSubscribers: Array<(error: Error) => void> = [];
let sessionExpiredNotified = false;

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
 * 로그인 성공 시 세션 만료 플래그 리셋
 */
export function resetSessionExpired(): void {
  sessionExpiredNotified = false;
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

      // 이미 세션이 만료된 상태면 refresh 시도하지 않음
      if (sessionExpiredNotified) {
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

        // 메모리에 새 토큰 저장 (SSE 등에서 사용)
        setMemoryToken(newToken);

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

        // BE에 로그아웃 요청 (쿠키 정리) - 에러 무시
        try {
          const { API_CONFIG } = await import('../config');
          await fetch(`${API_CONFIG.REST_BASE_URL}/api/v1/auth/logout/`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch {
          // 로그아웃 실패해도 무시
        }

        // 세션 만료 알림 및 로그인 모달 (중복 방지)
        if (!sessionExpiredNotified) {
          sessionExpiredNotified = true;

          // Sonner toast 동적 import
          import('sonner').then(({ toast }) => {
            toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
          }).catch(() => {
            // Toast 로드 실패해도 무시
          });

          useStore.getState().openLoginModal();
        }

        return Promise.reject(error);
      }
    }
  );
}
