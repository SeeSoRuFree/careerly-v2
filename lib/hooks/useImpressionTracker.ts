'use client';

import { useEffect, useRef, useCallback } from 'react';
import { checkAuth } from '../api/auth/token.client';
import { recordImpressionsBatch } from '../api/services/posts.service';
import { trackPostImpression, trackQuestionImpression } from '../analytics';

const FLUSH_INTERVAL = 3000;
const MAX_QUEUE_SIZE = 10;

interface ImpressionData {
  id: number;
  type: 'post' | 'question';
  authorId?: string;
  feedPosition: number;
}

export function useImpressionTracker() {
  const isAuthenticatedRef = useRef<boolean>(false);
  const impressedIds = useRef<Set<number>>(new Set());
  const pendingQueue = useRef<number[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedPositionRef = useRef<number>(0);

  useEffect(() => {
    checkAuth().then((authenticated) => {
      isAuthenticatedRef.current = authenticated;
    });
  }, []);

  const flush = useCallback(async () => {
    if (pendingQueue.current.length === 0 || !isAuthenticatedRef.current) return;

    const postIds = [...pendingQueue.current];
    pendingQueue.current = [];

    try {
      await recordImpressionsBatch(postIds);
    } catch (error) {
      console.error('Failed to record impressions:', error);
    }
  }, []);

  const trackImpression = useCallback(
    (postId: number, options?: { type?: 'post' | 'question'; authorId?: string }) => {
      if (impressedIds.current.has(postId)) return;

      impressedIds.current.add(postId);
      feedPositionRef.current += 1;

      // GA4 이벤트 트래킹 (로그인 여부와 관계없이)
      const type = options?.type || 'post';
      if (type === 'post') {
        trackPostImpression(
          String(postId),
          options?.authorId || '',
          feedPositionRef.current
        );
      } else {
        trackQuestionImpression(String(postId), feedPositionRef.current);
      }

      // 백엔드 API는 로그인한 사용자만
      if (!isAuthenticatedRef.current) return;
      pendingQueue.current.push(postId);

      if (pendingQueue.current.length >= MAX_QUEUE_SIZE) {
        flush();
      }
    },
    [flush]
  );

  useEffect(() => {
    if (!isAuthenticatedRef.current) return;

    flushTimeoutRef.current = setInterval(flush, FLUSH_INTERVAL);
    return () => {
      if (flushTimeoutRef.current) clearInterval(flushTimeoutRef.current);
    };
  }, [flush]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingQueue.current.length > 0 && isAuthenticatedRef.current) {
        navigator.sendBeacon(
          '/api/v1/posts/impressions/batch/',
          JSON.stringify({ post_ids: pendingQueue.current })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return { trackImpression };
}
