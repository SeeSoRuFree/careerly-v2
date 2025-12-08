'use client';

import { useEffect, useRef, useCallback } from 'react';
import { checkAuth } from '../api/auth/token.client';
import { recordImpressionsBatch } from '../api/services/posts.service';

const FLUSH_INTERVAL = 3000;
const MAX_QUEUE_SIZE = 10;

export function useImpressionTracker() {
  const isAuthenticatedRef = useRef<boolean>(false);
  const impressedIds = useRef<Set<number>>(new Set());
  const pendingQueue = useRef<number[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    (postId: number) => {
      if (!isAuthenticatedRef.current) return;
      if (impressedIds.current.has(postId)) return;

      impressedIds.current.add(postId);
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
