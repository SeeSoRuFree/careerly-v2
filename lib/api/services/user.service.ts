/**
 * 사용자 관련 API 서비스
 */

import { authClient, handleApiError } from '../clients/rest-client';
import type { User } from '../types/rest.types';

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
