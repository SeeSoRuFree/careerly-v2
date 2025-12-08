/**
 * Chat API Mutation 훅
 * Careerly Agent API를 사용한 AI 채팅 기능
 */

'use client';

import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import {
  chatSearch,
  sendChatMessage,
  chatSearchAllVersions,
  shareChatSession,
} from '../../services/chat.service';
import type {
  ChatRequest,
  ChatResponse,
  ChatSearchResult,
  ChatComparisonResult,
  ChatSession,
} from '../../types/chat.types';

/**
 * Chat 요청을 위한 파라미터 타입
 */
export interface UseChatMutationParams {
  query: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Chat API 호출 훅 (SearchResult 형식)
 * 기존 UI와 호환되는 형식으로 반환
 */
export function useChatSearch(
  options?: Omit<
    UseMutationOptions<ChatSearchResult, Error, UseChatMutationParams>,
    'mutationFn'
  >
) {
  return useMutation<ChatSearchResult, Error, UseChatMutationParams>({
    mutationFn: async ({ query, userId, sessionId }) => {
      return chatSearch(query, userId, sessionId);
    },
    ...options,
  });
}

/**
 * Chat API 원본 응답 훅
 * 전체 응답 데이터가 필요한 경우 사용
 */
export function useChatMessage(
  options?: Omit<UseMutationOptions<ChatResponse, Error, ChatRequest>, 'mutationFn'>
) {
  return useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: (request: ChatRequest) => sendChatMessage(request),
    ...options,
  });
}

/**
 * 3개 버전 API를 동시에 호출하는 훅
 * v1, v3, v4 API 결과를 동시에 비교할 수 있음
 */
export interface UseChatSearchAllVersionsParams {
  query: string;
  userId?: string;
  sessionId?: string;
}

export function useChatSearchAllVersions(
  options?: Omit<
    UseMutationOptions<ChatComparisonResult, Error, UseChatSearchAllVersionsParams>,
    'mutationFn'
  >
) {
  return useMutation<ChatComparisonResult, Error, UseChatSearchAllVersionsParams>({
    mutationFn: async ({ query, userId, sessionId }) => {
      return chatSearchAllVersions(query, userId, sessionId);
    },
    ...options,
  });
}

/**
 * 세션 공유 설정 변경 파라미터 타입
 */
export interface UseShareSessionParams {
  sessionId: string;
  isPublic: boolean;
}

/**
 * 세션 공유 설정 변경 훅
 * 세션을 공개/비공개로 전환하여 URL 공유 가능 여부 설정
 */
export function useShareSession(
  options?: Omit<
    UseMutationOptions<ChatSession, Error, UseShareSessionParams>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<ChatSession, Error, UseShareSessionParams>({
    mutationFn: async ({ sessionId, isPublic }) => {
      return shareChatSession(sessionId, isPublic);
    },
    onSuccess: (data, variables) => {
      // 세션 캐시 업데이트
      queryClient.setQueryData(['chatSession', variables.sessionId], data);
      queryClient.setQueryData(['publicChatSession', variables.sessionId], data);
    },
    ...options,
  });
}
