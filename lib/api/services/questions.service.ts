/**
 * Questions & Answers API 서비스
 */

import { publicClient, authClient, handleApiError } from '../clients/rest-client';
import type {
  Question,
  QuestionCreateRequest,
  QuestionUpdateRequest,
  Answer,
  AnswerCreateRequest,
  AnswerUpdateRequest,
  PaginatedQuestionResponse,
  PaginatedAnswerResponse,
} from '../types/questions.types';

/**
 * 질문 목록 조회
 */
export async function getQuestions(page?: number): Promise<PaginatedQuestionResponse> {
  try {
    const params = page ? { page } : {};
    const response = await publicClient.get<PaginatedQuestionResponse>('/api/v1/questions/', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 질문 상세 조회
 */
export async function getQuestion(id: number): Promise<Question> {
  try {
    const response = await publicClient.get<Question>(`/api/v1/questions/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 질문 생성
 * 인증 필요
 */
export async function createQuestion(data: QuestionCreateRequest): Promise<Question> {
  try {
    const response = await authClient.post<Question>('/api/v1/questions/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 질문 수정
 * 인증 필요, 작성자만 가능
 */
export async function updateQuestion(id: number, data: QuestionUpdateRequest): Promise<Question> {
  try {
    const response = await authClient.put<Question>(`/api/v1/questions/${id}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 질문 부분 수정
 * 인증 필요, 작성자만 가능
 */
export async function patchQuestion(id: number, data: Partial<QuestionUpdateRequest>): Promise<Question> {
  try {
    const response = await authClient.patch<Question>(`/api/v1/questions/${id}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 질문 삭제 (Soft Delete)
 * 인증 필요, 작성자만 가능
 */
export async function deleteQuestion(id: number): Promise<void> {
  try {
    await authClient.delete(`/api/v1/questions/${id}/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 특정 질문의 답변 목록 조회
 */
export async function getQuestionAnswers(questionId: number, page?: number): Promise<PaginatedAnswerResponse> {
  try {
    const params = page ? { page } : {};
    const response = await publicClient.get<PaginatedAnswerResponse>(
      `/api/v1/questions/${questionId}/answers/`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 특정 질문에 답변 작성
 * 인증 필요
 */
export async function createQuestionAnswer(questionId: number, content: string): Promise<Answer> {
  try {
    const response = await authClient.post<Answer>(`/api/v1/questions/${questionId}/answers/`, {
      content,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 모든 답변 목록 조회
 */
export async function getAnswers(page?: number): Promise<PaginatedAnswerResponse> {
  try {
    const params = page ? { page } : {};
    const response = await publicClient.get<PaginatedAnswerResponse>('/api/v1/answers/', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 답변 상세 조회
 */
export async function getAnswer(id: number): Promise<Answer> {
  try {
    const response = await publicClient.get<Answer>(`/api/v1/answers/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 답변 생성
 * 인증 필요
 */
export async function createAnswer(data: AnswerCreateRequest): Promise<Answer> {
  try {
    const response = await authClient.post<Answer>('/api/v1/answers/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 답변 수정
 * 인증 필요, 작성자만 가능
 */
export async function updateAnswer(id: number, data: AnswerUpdateRequest): Promise<Answer> {
  try {
    const response = await authClient.put<Answer>(`/api/v1/answers/${id}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 답변 부분 수정
 * 인증 필요, 작성자만 가능
 */
export async function patchAnswer(id: number, data: Partial<AnswerUpdateRequest>): Promise<Answer> {
  try {
    const response = await authClient.patch<Answer>(`/api/v1/answers/${id}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 답변 삭제 (Soft Delete)
 * 인증 필요, 작성자만 가능
 */
export async function deleteAnswer(id: number): Promise<void> {
  try {
    await authClient.delete(`/api/v1/answers/${id}/`);
  } catch (error) {
    throw handleApiError(error);
  }
}
