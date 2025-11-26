/**
 * Questions & Answers 관련 React Query 훅
 */

'use client';

import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';
import {
  getQuestions,
  getQuestion,
  getQuestionAnswers,
  getAnswers,
  getAnswer,
} from '../../services/questions.service';
import type {
  Question,
  Answer,
  PaginatedQuestionResponse,
  PaginatedAnswerResponse,
} from '../../types/questions.types';

/**
 * Questions 쿼리 키
 */
export const questionKeys = {
  all: ['question'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (page?: number) => [...questionKeys.lists(), { page }] as const,
  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (id: number) => [...questionKeys.details(), id] as const,
  answers: (questionId: number) => [...questionKeys.detail(questionId), 'answers'] as const,
  answersList: (questionId: number, page?: number) =>
    [...questionKeys.answers(questionId), { page }] as const,
};

/**
 * Answers 쿼리 키
 */
export const answerKeys = {
  all: ['answer'] as const,
  lists: () => [...answerKeys.all, 'list'] as const,
  list: (page?: number) => [...answerKeys.lists(), { page }] as const,
  details: () => [...answerKeys.all, 'detail'] as const,
  detail: (id: number) => [...answerKeys.details(), id] as const,
};

/**
 * 질문 목록 조회 훅
 */
export function useQuestions(
  { page }: { page?: number } = {},
  options?: Omit<UseQueryOptions<PaginatedQuestionResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedQuestionResponse, Error>({
    queryKey: questionKeys.list(page),
    queryFn: () => getQuestions(page),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

/**
 * 질문 무한 스크롤 훅
 */
export function useInfiniteQuestions() {
  return useInfiniteQuery({
    queryKey: questionKeys.lists(),
    queryFn: ({ pageParam = 1 }) => getQuestions(pageParam as number),
    getNextPageParam: (lastPage: PaginatedQuestionResponse, allPages: PaginatedQuestionResponse[]) => {
      // next가 있으면 다음 페이지 번호 반환
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 질문 상세 조회 훅
 */
export function useQuestion(
  id: number,
  options?: Omit<UseQueryOptions<Question, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Question, Error>({
    queryKey: questionKeys.detail(id),
    queryFn: () => getQuestion(id),
    enabled: !!id && id > 0,
    staleTime: 3 * 60 * 1000, // 3분
    gcTime: 15 * 60 * 1000, // 15분
    ...options,
  });
}

/**
 * 특정 질문의 답변 목록 조회 훅
 */
export function useQuestionAnswers(
  questionId: number,
  { page }: { page?: number } = {},
  options?: Omit<UseQueryOptions<PaginatedAnswerResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedAnswerResponse, Error>({
    queryKey: questionKeys.answersList(questionId, page),
    queryFn: () => getQuestionAnswers(questionId, page),
    enabled: !!questionId && questionId > 0,
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

/**
 * 답변 목록 조회 훅
 */
export function useAnswers(
  { page }: { page?: number } = {},
  options?: Omit<UseQueryOptions<PaginatedAnswerResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedAnswerResponse, Error>({
    queryKey: answerKeys.list(page),
    queryFn: () => getAnswers(page),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
}

/**
 * 답변 상세 조회 훅
 */
export function useAnswer(
  id: number,
  options?: Omit<UseQueryOptions<Answer, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Answer, Error>({
    queryKey: answerKeys.detail(id),
    queryFn: () => getAnswer(id),
    enabled: !!id && id > 0,
    staleTime: 3 * 60 * 1000, // 3분
    gcTime: 15 * 60 * 1000, // 15분
    ...options,
  });
}
