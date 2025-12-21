'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  trackPageView,
  trackPostImpression,
  trackQuestionImpression,
} from './gtag';

type PageType =
  | 'home'
  | 'search'
  | 'community'
  | 'profile'
  | 'discover'
  | 'settings'
  | 'bookmarks';

/**
 * 경로에서 페이지 타입 추출
 */
function getPageTypeFromPath(path: string): PageType {
  if (path === '/') return 'home';
  if (path.startsWith('/search')) return 'search';
  if (path.startsWith('/community')) return 'community';
  if (path.startsWith('/profile')) return 'profile';
  if (path.startsWith('/discover')) return 'discover';
  if (path.startsWith('/settings')) return 'settings';
  if (path.startsWith('/bookmarks')) return 'bookmarks';
  return 'home';
}

/**
 * 페이지 뷰 자동 추적 훅
 * AppLayout 또는 최상위 컴포넌트에서 사용
 */
export function usePageViewTracking(): void {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const pageType = getPageTypeFromPath(pathname);
    trackPageView(pageType, pathname);
  }, [pathname]);
}

/**
 * 세션 시작 시간 추적 (로그아웃 시 session_duration 계산용)
 */
export function useSessionTracking(): {
  getSessionDuration: () => number;
} {
  const sessionStartRef = useRef<number>(Date.now());

  const getSessionDuration = useCallback(() => {
    return Math.floor((Date.now() - sessionStartRef.current) / 1000);
  }, []);

  return { getSessionDuration };
}

interface UseImpressionTrackingOptions {
  threshold?: number; // 뷰포트 노출 비율 (0-1), 기본값 0.5
  triggerOnce?: boolean; // 한 번만 트리거, 기본값 true
}

/**
 * 게시글 노출 추적 훅 (IntersectionObserver 기반)
 */
export function usePostImpressionTracking(
  postId: string,
  authorId: string,
  feedPosition: number,
  options: UseImpressionTrackingOptions = {}
): (node: HTMLElement | null) => void {
  const { threshold = 0.5, triggerOnce = true } = options;
  const hasTrackedRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (triggerOnce && hasTrackedRef.current) return;

              trackPostImpression(postId, authorId, feedPosition);
              hasTrackedRef.current = true;

              if (triggerOnce && observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        { threshold }
      );

      observerRef.current.observe(node);
    },
    [postId, authorId, feedPosition, threshold, triggerOnce]
  );

  return ref;
}

/**
 * Q&A 노출 추적 훅 (IntersectionObserver 기반)
 */
export function useQuestionImpressionTracking(
  questionId: string,
  feedPosition: number,
  options: UseImpressionTrackingOptions = {}
): (node: HTMLElement | null) => void {
  const { threshold = 0.5, triggerOnce = true } = options;
  const hasTrackedRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (triggerOnce && hasTrackedRef.current) return;

              trackQuestionImpression(questionId, feedPosition);
              hasTrackedRef.current = true;

              if (triggerOnce && observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        { threshold }
      );

      observerRef.current.observe(node);
    },
    [questionId, feedPosition, threshold, triggerOnce]
  );

  return ref;
}
