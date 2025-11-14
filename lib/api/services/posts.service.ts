/**
 * Posts API 서비스
 */

import { publicClient, authClient, handleApiError } from '../clients/rest-client';
import type {
  Post,
  PostCreateRequest,
  PostUpdateRequest,
  PaginatedPostResponse,
} from '../types/posts.types';

/**
 * 게시물 목록 조회 (페이징)
 */
export async function getPosts(page?: number): Promise<PaginatedPostResponse> {
  try {
    const params = page ? { page } : {};
    const response = await publicClient.get<PaginatedPostResponse>('/api/v1/posts/', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 상세 조회
 */
export async function getPost(id: number): Promise<Post> {
  try {
    const response = await publicClient.get<Post>(`/api/v1/posts/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 생성
 * 인증 필요
 */
export async function createPost(data: PostCreateRequest): Promise<Post> {
  try {
    const response = await authClient.post<Post>('/api/v1/posts/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 수정
 * 인증 필요, 작성자만 가능
 */
export async function updatePost(id: number, data: PostUpdateRequest): Promise<Post> {
  try {
    const response = await authClient.put<Post>(`/api/v1/posts/${id}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 부분 수정
 * 인증 필요, 작성자만 가능
 */
export async function patchPost(id: number, data: Partial<PostUpdateRequest>): Promise<Post> {
  try {
    const response = await authClient.patch<Post>(`/api/v1/posts/${id}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 삭제 (Soft Delete)
 * 인증 필요, 작성자만 가능
 */
export async function deletePost(id: number): Promise<void> {
  try {
    await authClient.delete(`/api/v1/posts/${id}/`);
  } catch (error) {
    throw handleApiError(error);
  }
}
