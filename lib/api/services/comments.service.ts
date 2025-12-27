/**
 * Comments API 서비스
 */

import { publicClient, authClient, handleApiError } from '../clients/rest-client';
import type {
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
  PaginatedCommentResponse,
} from '../types/comments.types';

/**
 * 댓글 목록 조회 파라미터
 */
export interface GetCommentsParams {
  postId?: number;
  page?: number;
}

/**
 * 댓글 목록 조회 (postId로 필터 가능)
 */
export async function getComments(params?: GetCommentsParams): Promise<PaginatedCommentResponse> {
  try {
    const response = await publicClient.get<PaginatedCommentResponse>('/api/v1/comments/', {
      params
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 댓글 상세 조회
 */
export async function getComment(id: number): Promise<Comment> {
  try {
    const response = await publicClient.get<Comment>(`/api/v1/comments/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 댓글 생성 (최상위 댓글 또는 대댓글)
 * 인증 필요
 */
export async function createComment(data: CommentCreateRequest): Promise<Comment> {
  try {
    const response = await authClient.post<Comment>('/api/v1/comments/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 댓글 수정
 * 인증 필요, 작성자만 가능
 */
export async function updateComment(id: number, data: CommentUpdateRequest): Promise<Comment> {
  try {
    const response = await authClient.put<Comment>(`/api/v1/comments/${id}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 댓글 부분 수정
 * 인증 필요, 작성자만 가능
 */
export async function patchComment(id: number, data: Partial<CommentUpdateRequest>): Promise<Comment> {
  try {
    const response = await authClient.patch<Comment>(`/api/v1/comments/${id}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 댓글 삭제 (Soft Delete)
 * 인증 필요, 작성자만 가능
 */
export async function deleteComment(id: number): Promise<void> {
  try {
    await authClient.delete(`/api/v1/comments/${id}/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 댓글 좋아요
 * 인증 필요
 */
export async function likeComment(commentId: number): Promise<void> {
  try {
    await authClient.post(`/api/v1/comments/${commentId}/like/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 댓글 좋아요 취소
 * 인증 필요
 */
export async function unlikeComment(commentId: number): Promise<void> {
  try {
    await authClient.post(`/api/v1/comments/${commentId}/unlike/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 댓글 좋아요한 사용자 목록 조회 파라미터
 */
export interface GetCommentLikersParams {
  page?: number;
  page_size?: number;
}

/**
 * 댓글 좋아요한 사용자 목록 응답
 */
export interface CommentLiker {
  id: number;
  user: {
    id: number;
    profile_id: number | null;
    name: string | null;
    image_url: string | null;
    small_image_url: string | null;
    headline: string | null;
  } | null;
}

export interface PaginatedCommentLikersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CommentLiker[];
}

/**
 * 댓글 좋아요한 사용자 목록 조회
 * 인증 불필요 (공개 API)
 */
export async function getCommentLikers(
  commentId: number,
  params?: GetCommentLikersParams
): Promise<PaginatedCommentLikersResponse> {
  try {
    const response = await publicClient.get<PaginatedCommentLikersResponse>(
      `/api/v1/comments/${commentId}/likers/`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
