/**
 * 사용자 관련 API 서비스
 */

import { authClient, publicClient, handleApiError } from '../clients/rest-client';
import type { User } from '../types/rest.types';
import type { PaginatedPostResponse } from '../types/posts.types';
import type { PaginatedQuestionResponse } from '../types/questions.types';

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(userId: string): Promise<User> {
  try {
    const response = await authClient.get<{ data: User }>(`/users/${userId}`);
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 내 프로필 조회
 */
export async function getMyProfile(): Promise<User> {
  try {
    const response = await authClient.get<{ data: User }>('/users/me');
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 프로필 업데이트
 */
export async function updateProfile(data: Partial<User>): Promise<User> {
  try {
    const response = await authClient.patch<{ data: User }>('/users/me', data);
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 프로필 이미지 업로드
 */
export async function uploadAvatar(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await authClient.post<{ data: { url: string } }>(
      '/users/me/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data.url;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 사용자 검색
 */
export async function searchUsers(query: string): Promise<User[]> {
  try {
    const response = await authClient.get<{ data: User[] }>('/users/search', {
      params: { query },
    });
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 사용자 팔로우
 */
export async function followUser(userId: string): Promise<void> {
  try {
    await authClient.post(`/users/${userId}/follow`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 사용자 언팔로우
 */
export async function unfollowUser(userId: string): Promise<void> {
  try {
    await authClient.delete(`/users/${userId}/follow`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 팔로워 목록 조회
 */
export async function getFollowers(userId: string): Promise<User[]> {
  try {
    const response = await authClient.get<{ data: User[] }>(`/users/${userId}/followers`);
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 팔로잉 목록 조회
 */
export async function getFollowing(userId: string): Promise<User[]> {
  try {
    const response = await authClient.get<{ data: User[] }>(`/users/${userId}/following`);
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 내가 저장한 포스트 목록 조회
 */
export async function getMySavedPosts(page?: number): Promise<PaginatedPostResponse> {
  try {
    const params = page ? { page } : {};
    const response = await authClient.get<PaginatedPostResponse>('/api/v1/users/me/saved-posts/', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 내가 작성한 게시글 목록 조회
 * user_id 파라미터로 posts API에서 필터링
 */
export async function getMyPosts(userId: number, page?: number): Promise<PaginatedPostResponse> {
  try {
    const params: Record<string, number> = { user_id: userId };
    if (page) params.page = page;
    const response = await authClient.get<PaginatedPostResponse>('/api/v1/posts/', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 내가 작성한 질문 목록 조회
 * user_id 파라미터로 questions API에서 필터링
 */
export async function getMyQuestions(userId: number, page?: number): Promise<PaginatedQuestionResponse> {
  try {
    const params: Record<string, number> = { user_id: userId };
    if (page) params.page = page;
    const response = await authClient.get<PaginatedQuestionResponse>('/api/v1/questions/', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 추천 팔로워 타입
 */
export interface RecommendedFollower {
  id: number;
  name: string;
  image_url: string | null;
  headline: string | null;
  mutual_count: number | null; // friends of friends인 경우에만 있음
  follower_count: number;
}

/**
 * 추천 팔로워 조회
 * - 로그인 사용자: friends of friends 알고리즘
 * - 비로그인: popular authors (최근 30일 좋아요 많은 포스트 작성자)
 */
export async function getRecommendedFollowers(limit: number = 10): Promise<RecommendedFollower[]> {
  try {
    const params = { limit };
    const response = await publicClient.get<RecommendedFollower[]>('/api/v1/users/recommended/', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
