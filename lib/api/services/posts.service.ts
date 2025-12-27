/**
 * Posts API 서비스
 */

import { publicClient, authClient, handleApiError } from '../clients/rest-client';
import type {
  Post,
  PostListItem,
  PostCreateRequest,
  PostUpdateRequest,
  PaginatedPostResponse,
  ImageUploadResponse,
  PaginatedLikersResponse,
} from '../types/posts.types';

/**
 * 게시물 조회 파라미터
 */
export interface GetPostsParams {
  page?: number;
  following?: boolean;
  ordering?: string;
  page_size?: number;
  user_id?: number;  // 특정 사용자의 게시물만 조회
}

/**
 * 게시물 목록 조회 (페이징, 필터)
 */
export async function getPosts(params?: GetPostsParams): Promise<PaginatedPostResponse> {
  try {
    const response = await publicClient.get<PaginatedPostResponse>('/api/v1/posts/', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 팔로잉 피드 조회
 * 인증 필요
 */
export async function getFollowingPosts(page?: number): Promise<PaginatedPostResponse> {
  try {
    const params = { page, following: true };
    const response = await authClient.get<PaginatedPostResponse>('/api/v1/posts/', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 인기 게시물 조회 (좋아요 순)
 */
export async function getPopularPosts(limit: number = 5): Promise<PaginatedPostResponse> {
  try {
    const params = { ordering: '-like_count', page_size: limit };
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

/**
 * 게시물 좋아요
 * 인증 필요
 */
export async function likePost(postId: number): Promise<void> {
  try {
    await authClient.post(`/api/v1/posts/${postId}/like/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 좋아요 취소
 * 인증 필요
 */
export async function unlikePost(postId: number): Promise<void> {
  try {
    await authClient.delete(`/api/v1/posts/${postId}/unlike/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 좋아요 여부 확인
 * 인증 필요
 */
export async function isPostLiked(postId: number): Promise<boolean> {
  try {
    const response = await authClient.get<{ is_liked: boolean }>(`/api/v1/posts/${postId}/is-liked/`);
    return response.data.is_liked;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 북마크 (저장)
 * 인증 필요
 */
export async function savePost(postId: number): Promise<void> {
  try {
    await authClient.post(`/api/v1/posts/${postId}/save/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 북마크 취소
 * 인증 필요
 */
export async function unsavePost(postId: number): Promise<void> {
  try {
    await authClient.delete(`/api/v1/posts/${postId}/unsave/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 북마크 여부 확인
 * 인증 필요
 */
export async function isPostSaved(postId: number): Promise<boolean> {
  try {
    const response = await authClient.get<{ is_saved: boolean }>(`/api/v1/posts/${postId}/is-saved/`);
    return response.data.is_saved;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 조회수 증가
 * 인증 필요
 */
export async function viewPost(postId: number): Promise<void> {
  try {
    await authClient.post(`/api/v1/posts/${postId}/view/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 리포스트
 * 인증 필요
 */
export async function repostPost(postId: number): Promise<void> {
  try {
    await authClient.post(`/api/v1/posts/${postId}/repost/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 리포스트 취소
 * 인증 필요
 */
export async function unrepostPost(postId: number): Promise<void> {
  try {
    await authClient.delete(`/api/v1/posts/${postId}/repost/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Top Posts 기간별 타입
 */
export type TopPostsPeriod = 'daily' | 'weekly' | 'monthly';

/**
 * Top Posts 조회 (기간별 인기 게시물)
 * engagement score: (likes × 3) + (saves × 2) + (views × 0.1)
 */
export async function getTopPosts(
  period: TopPostsPeriod = 'weekly',
  limit: number = 10
): Promise<PostListItem[]> {
  try {
    const params = { period, limit };
    const response = await publicClient.get<PostListItem[]>('/api/v1/posts/top/', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 추천 포스트 조회 (간단 버전 - 사이드바용)
 * - 로그인 사용자: 팔로잉하는 사람의 포스트 (최근 7일, 참여도 순)
 * - 비로그인/팔로잉 없음: 글로벌 트렌딩 포스트
 */
export async function getRecommendedPosts(limit: number = 10): Promise<PostListItem[]> {
  try {
    const params = { page_size: limit };
    const response = await publicClient.get<PaginatedPostResponse>('/api/v1/posts/recommended/', { params });
    return response.data.results || [];
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 추천 포스트 조회 (페이지네이션 버전 - 메인 피드용)
 * GET /api/v1/posts/recommended/
 */
export async function getRecommendedPostsPaginated(params?: { page?: number; page_size?: number }): Promise<PaginatedPostResponse> {
  try {
    const response = await authClient.get<PaginatedPostResponse>('/api/v1/posts/recommended/', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 이미지 업로드
 * 인증 필요
 */
export async function uploadPostImage(file: File): Promise<ImageUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await authClient.post<ImageUploadResponse>(
      '/api/v1/posts/images/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 노출 수 일괄 기록
 * 인증 불필요 (로그인/비로그인 모두 가능)
 */
export async function recordImpressionsBatch(postIds: number[]): Promise<void> {
  try {
    await publicClient.post('/api/v1/posts/impressions/batch/', { post_ids: postIds });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 게시물 좋아요한 사용자 목록 조회
 * 인증 불필요 (공개 API)
 */
export interface GetPostLikersParams {
  page?: number;
  page_size?: number;
}

export async function getPostLikers(
  postId: number,
  params?: GetPostLikersParams
): Promise<PaginatedLikersResponse> {
  try {
    const response = await publicClient.get<PaginatedLikersResponse>(
      `/api/v1/posts/${postId}/likers/`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
