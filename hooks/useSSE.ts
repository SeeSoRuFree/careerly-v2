/**
 * SSE (Server-Sent Events) 훅
 * 새로운 SSE 클라이언트를 사용하며 인증을 지원합니다.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createSSEClient, type SSEOptions } from '@/lib/api/clients/sse-client';

export interface SSEMessage {
  type: 'token' | 'citation' | 'complete' | 'error';
  content: string;
  metadata?: Record<string, unknown>;
}

interface UseSSEOptions {
  url: string;
  enabled: boolean;
  withAuth?: boolean; // 인증 여부 (기본값: true)
  onMessage?: (message: SSEMessage) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useSSE({
  url,
  enabled,
  withAuth = true,
  onMessage,
  onComplete,
  onError,
}: UseSSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const sseClientRef = useRef(createSSEClient());

  const connect = useCallback(() => {
    if (!enabled || sseClientRef.current.isConnected()) return;

    try {
      const sseOptions: SSEOptions = {
        withAuth,
        onToken: (token) => {
          const message: SSEMessage = {
            type: 'token',
            content: token,
          };
          setMessages((prev) => [...prev, message]);
          onMessage?.(message);
        },
        onCitation: (citation) => {
          const message: SSEMessage = {
            type: 'citation',
            content: JSON.stringify(citation),
            metadata: citation as Record<string, unknown>,
          };
          setMessages((prev) => [...prev, message]);
          onMessage?.(message);
        },
        onComplete: () => {
          const message: SSEMessage = {
            type: 'complete',
            content: 'Stream completed',
          };
          setMessages((prev) => [...prev, message]);
          onMessage?.(message);
          onComplete?.();
          setIsConnected(false);
        },
        onError: (errorMessage) => {
          const errorObj = new Error(errorMessage);
          setError(errorObj);
          setIsConnected(false);
          onError?.(errorObj);
        },
      };

      sseClientRef.current.connect(url, sseOptions);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      const errorObj =
        err instanceof Error ? err : new Error('Failed to connect to SSE');
      setError(errorObj);
      onError?.(errorObj);
    }
  }, [url, enabled, withAuth, onMessage, onComplete, onError]);

  const disconnect = useCallback(() => {
    sseClientRef.current.disconnect();
    setIsConnected(false);
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setMessages([]);
    setError(null);
  }, [disconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    error,
    messages,
    connect,
    disconnect,
    reset,
  };
}
