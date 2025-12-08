/**
 * Questions & Answers 관련 React Query Mutation 훅
 */

'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createQuestion,
  updateQuestion,
  patchQuestion,
  deleteQuestion,
  createQuestionAnswer,
  createAnswer,
  updateAnswer,
  patchAnswer,
  deleteAnswer,
  acceptAnswer,
  likeQuestion,
  unlikeQuestion,
  likeAnswer,
  unlikeAnswer,
  uploadQuestionImage,
  uploadAnswerImage,
} from '../../services/questions.service';
import { questionKeys, answerKeys } from '../queries/useQuestions';
import type {
  Question,
  QuestionCreateRequest,
  QuestionUpdateRequest,
  Answer,
  AnswerCreateRequest,
  AnswerUpdateRequest,
  QuestionImageUploadResponse,
} from '../../types/questions.types';

/**
 * 질문 생성 mutation
 */
export function useCreateQuestion(
  options?: Omit<UseMutationOptions<Question, Error, QuestionCreateRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<Question, Error, QuestionCreateRequest>({
    mutationFn: createQuestion,
    onSuccess: (data) => {
      // 질문 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });

      toast.success('질문이 생성되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '질문 생성에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 질문 수정 mutation (PUT)
 */
export function useUpdateQuestion(
  options?: Omit<
    UseMutationOptions<Question, Error, { id: number; data: QuestionUpdateRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Question, Error, { id: number; data: QuestionUpdateRequest }>({
    mutationFn: ({ id, data }) => updateQuestion(id, data),
    onSuccess: (data, { id }) => {
      // 질문 상세 캐시 업데이트
      queryClient.setQueryData(questionKeys.detail(id), data);

      // 질문 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });

      toast.success('질문이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '질문 수정에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 질문 부분 수정 mutation (PATCH)
 */
export function usePatchQuestion(
  options?: Omit<
    UseMutationOptions<Question, Error, { id: number; data: Partial<QuestionUpdateRequest> }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Question, Error, { id: number; data: Partial<QuestionUpdateRequest> }>({
    mutationFn: ({ id, data }) => patchQuestion(id, data),
    onSuccess: (data, { id }) => {
      // 질문 상세 캐시 업데이트
      queryClient.setQueryData(questionKeys.detail(id), data);

      // 질문 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });

      toast.success('질문이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '질문 수정에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 질문 삭제 mutation
 */
export function useDeleteQuestion(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteQuestion,
    onSuccess: (_, id) => {
      // 질문 상세 캐시 제거
      queryClient.removeQueries({ queryKey: questionKeys.detail(id) });

      // 질문 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });

      toast.success('질문이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '질문 삭제에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 특정 질문에 답변 생성 mutation
 */
export function useCreateQuestionAnswer(
  options?: Omit<
    UseMutationOptions<Answer, Error, { questionId: number; description: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Answer, Error, { questionId: number; description: string }>({
    mutationFn: ({ questionId, description }) => createQuestionAnswer(questionId, description),
    onSuccess: (data, { questionId }) => {
      // 질문 상세 무효화 (답변 목록 포함)
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });

      // 질문의 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(questionId) });

      // 전체 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: answerKeys.lists() });

      toast.success('답변이 작성되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '답변 작성에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 답변 생성 mutation
 */
export function useCreateAnswer(
  options?: Omit<UseMutationOptions<Answer, Error, AnswerCreateRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<Answer, Error, AnswerCreateRequest>({
    mutationFn: createAnswer,
    onSuccess: (data) => {
      // 연결된 질문 상세 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(data.question_id) });

      // 질문의 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(data.question_id) });

      // 전체 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: answerKeys.lists() });

      toast.success('답변이 생성되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '답변 생성에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 답변 수정 mutation (PUT)
 */
export function useUpdateAnswer(
  options?: Omit<
    UseMutationOptions<Answer, Error, { id: number; questionId: number; data: AnswerUpdateRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Answer, Error, { id: number; questionId: number; data: AnswerUpdateRequest }>({
    mutationFn: ({ id, data }) => updateAnswer(id, data),
    onSuccess: (data, { id, questionId }) => {
      // 답변 상세 캐시 업데이트
      queryClient.setQueryData(answerKeys.detail(id), data);

      // 연결된 질문 상세 무효화 (파라미터 또는 응답에서 가져옴)
      const qId = questionId || data.question_id;
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(qId) });

      // 질문의 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(qId) });

      // 전체 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: answerKeys.lists() });

      toast.success('답변이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '답변 수정에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 답변 부분 수정 mutation (PATCH)
 */
export function usePatchAnswer(
  options?: Omit<
    UseMutationOptions<Answer, Error, { id: number; data: Partial<AnswerUpdateRequest> }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Answer, Error, { id: number; data: Partial<AnswerUpdateRequest> }>({
    mutationFn: ({ id, data }) => patchAnswer(id, data),
    onSuccess: (data, { id }) => {
      // 답변 상세 캐시 업데이트
      queryClient.setQueryData(answerKeys.detail(id), data);

      // 연결된 질문 상세 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(data.question_id) });

      // 질문의 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(data.question_id) });

      // 전체 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: answerKeys.lists() });

      toast.success('답변이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '답변 수정에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 답변 삭제 mutation
 */
export function useDeleteAnswer(
  options?: Omit<UseMutationOptions<void, Error, { id: number; questionId: number }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: number; questionId: number }>({
    mutationFn: ({ id }) => deleteAnswer(id),
    onSuccess: (_, { id, questionId }) => {
      // 답변 상세 캐시 제거
      queryClient.removeQueries({ queryKey: answerKeys.detail(id) });

      // 연결된 질문 상세 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });

      // 질문의 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(questionId) });

      // 전체 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: answerKeys.lists() });

      toast.success('답변이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '답변 삭제에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 답변 채택 mutation
 */
export function useAcceptAnswer(
  options?: Omit<UseMutationOptions<void, Error, { answerId: number; questionId: number }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { answerId: number; questionId: number }>({
    mutationFn: ({ answerId }) => acceptAnswer(answerId),
    onSuccess: (_, { answerId, questionId }) => {
      // 답변 상세 무효화
      queryClient.invalidateQueries({ queryKey: answerKeys.detail(answerId) });
      // 질문 상세 무효화 (채택된 답변 표시)
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
      // 질문의 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(questionId) });

      toast.success('답변이 채택되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '답변 채택에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 질문 좋아요 mutation
 */
export function useLikeQuestion(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: likeQuestion,
    onSuccess: (_, questionId) => {
      // 질문 상세 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
      // 질문 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });

      toast.success('질문을 좋아합니다.');
    },
    onError: (error) => {
      toast.error(error.message || '좋아요에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 질문 좋아요 취소 mutation
 */
export function useUnlikeQuestion(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: unlikeQuestion,
    onSuccess: (_, questionId) => {
      // 질문 상세 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
      // 질문 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });

      toast.success('좋아요를 취소했습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '좋아요 취소에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 답변 좋아요 mutation
 */
export function useLikeAnswer(
  options?: Omit<UseMutationOptions<void, Error, { answerId: number; questionId: number }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { answerId: number; questionId: number }>({
    mutationFn: ({ answerId }) => likeAnswer(answerId),
    onSuccess: (_, { answerId, questionId }) => {
      // 답변 상세 무효화
      queryClient.invalidateQueries({ queryKey: answerKeys.detail(answerId) });
      // 질문 상세 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
      // 질문의 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(questionId) });
      // 전체 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: answerKeys.lists() });

      toast.success('답변을 좋아합니다.');
    },
    onError: (error) => {
      toast.error(error.message || '좋아요에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 답변 좋아요 취소 mutation
 */
export function useUnlikeAnswer(
  options?: Omit<UseMutationOptions<void, Error, { answerId: number; questionId: number }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { answerId: number; questionId: number }>({
    mutationFn: ({ answerId }) => unlikeAnswer(answerId),
    onSuccess: (_, { answerId, questionId }) => {
      // 답변 상세 무효화
      queryClient.invalidateQueries({ queryKey: answerKeys.detail(answerId) });
      // 질문 상세 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
      // 질문의 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: questionKeys.answers(questionId) });
      // 전체 답변 목록 무효화
      queryClient.invalidateQueries({ queryKey: answerKeys.lists() });

      toast.success('좋아요를 취소했습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '좋아요 취소에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * Q&A 질문 이미지 업로드 mutation
 */
export function useUploadQuestionImage(
  options?: Omit<UseMutationOptions<QuestionImageUploadResponse, Error, File>, 'mutationFn'>
) {
  return useMutation<QuestionImageUploadResponse, Error, File>({
    mutationFn: uploadQuestionImage,
    onSuccess: () => {
      toast.success('이미지가 업로드되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '이미지 업로드에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * Q&A 답변 이미지 업로드 mutation
 */
export function useUploadAnswerImage(
  options?: Omit<UseMutationOptions<QuestionImageUploadResponse, Error, File>, 'mutationFn'>
) {
  return useMutation<QuestionImageUploadResponse, Error, File>({
    mutationFn: uploadAnswerImage,
    onSuccess: () => {
      toast.success('이미지가 업로드되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '이미지 업로드에 실패했습니다.');
    },
    ...options,
  });
}
