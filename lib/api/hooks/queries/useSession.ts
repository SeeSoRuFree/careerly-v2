/**
 * Chat Session Query 훅
 * 세션 데이터 조회 및 캐싱
 */

'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  getChatSession,
  getPublicChatSession,
  getChatSessionWithFallback,
} from '../../services/chat.service';
import type { ChatSession } from '../../types/chat.types';

/**
 * 세션 조회 훅 (인증 필요, 본인 세션만)
 * @param sessionId - 조회할 세션 ID
 * @param options - React Query 옵션
 */
export function useChatSession(
  sessionId: string | null | undefined,
  options?: Omit<
    UseQueryOptions<ChatSession, Error, ChatSession, [string, string]>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ChatSession, Error, ChatSession, [string, string]>({
    queryKey: ['chatSession', sessionId || ''],
    queryFn: () => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      return getChatSession(sessionId);
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5분 동안 fresh 상태 유지
    gcTime: 1000 * 60 * 30, // 30분 동안 캐시 유지
    retry: 1,
    ...options,
  });
}

/**
 * 공개 세션 조회 훅 (인증 불필요)
 * @param sessionId - 조회할 세션 ID
 * @param options - React Query 옵션
 */
export function usePublicChatSession(
  sessionId: string | null | undefined,
  options?: Omit<
    UseQueryOptions<ChatSession, Error, ChatSession, [string, string]>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ChatSession, Error, ChatSession, [string, string]>({
    queryKey: ['publicChatSession', sessionId || ''],
    queryFn: () => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      return getPublicChatSession(sessionId);
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5분 동안 fresh 상태 유지
    gcTime: 1000 * 60 * 30, // 30분 동안 캐시 유지
    retry: 1,
    ...options,
  });
}

/**
 * 세션 조회 훅 (인증 API 먼저 시도 → 실패 시 공개 API fallback)
 * 로그인 여부와 관계없이 사용 가능
 * @param sessionId - 조회할 세션 ID
 * @param options - React Query 옵션
 */
export function useChatSessionWithFallback(
  sessionId: string | null | undefined,
  options?: Omit<
    UseQueryOptions<ChatSession, Error, ChatSession, [string, string]>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ChatSession, Error, ChatSession, [string, string]>({
    queryKey: ['chatSessionFallback', sessionId || ''],
    queryFn: () => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      return getChatSessionWithFallback(sessionId);
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    ...options,
  });
}
