/**
 * 프로필 관련 API 서비스
 *
 * Endpoints:
 * - GET /api/v1/profiles/{profile_id}/ - 프로필 ID로 조회
 * - GET /api/v1/users/{user_id}/profile/ - 사용자 ID로 프로필 조회
 */

import { publicClient, authClient, handleApiError } from '../clients/rest-client';
import type {
  ProfileDetail,
  ProfileUpdateRequest,
  CareerRequest,
  EducationRequest,
} from '../types/profile.types';

/**
 * 프로필 ID로 프로필 상세 조회 (공개 API)
 */
export async function getProfileById(profileId: number): Promise<ProfileDetail> {
  try {
    const response = await publicClient.get<ProfileDetail>(`/api/v1/profiles/${profileId}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 사용자 ID로 프로필 상세 조회 (공개 API)
 */
export async function getProfileByUserId(userId: number): Promise<ProfileDetail> {
  try {
    const response = await publicClient.get<ProfileDetail>(`/api/v1/users/${userId}/profile/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 내 프로필 조회 (현재 사용자 ID를 통해 조회)
 * 기존 /api/v1/users/{user_id}/profile/ API 활용
 */
export async function getMyProfileDetail(userId: number): Promise<ProfileDetail> {
  try {
    const response = await publicClient.get<ProfileDetail>(`/api/v1/users/${userId}/profile/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 프로필 업데이트 (인증 필요)
 */
export async function updateMyProfile(data: ProfileUpdateRequest): Promise<ProfileDetail> {
  try {
    const response = await authClient.patch<ProfileDetail>('/api/v1/users/me/profile/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 경력 추가 (인증 필요)
 */
export async function addCareer(data: CareerRequest): Promise<ProfileDetail> {
  try {
    const response = await authClient.post<ProfileDetail>('/api/v1/users/me/careers/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 경력 수정 (인증 필요)
 */
export async function updateCareer(careerId: number, data: CareerRequest): Promise<ProfileDetail> {
  try {
    const response = await authClient.patch<ProfileDetail>(`/api/v1/users/me/careers/${careerId}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 경력 삭제 (인증 필요)
 */
export async function deleteCareer(careerId: number): Promise<void> {
  try {
    await authClient.delete(`/api/v1/users/me/careers/${careerId}/`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 학력 추가 (인증 필요)
 */
export async function addEducation(data: EducationRequest): Promise<ProfileDetail> {
  try {
    const response = await authClient.post<ProfileDetail>('/api/v1/users/me/educations/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 학력 수정 (인증 필요)
 */
export async function updateEducation(educationId: number, data: EducationRequest): Promise<ProfileDetail> {
  try {
    const response = await authClient.patch<ProfileDetail>(`/api/v1/users/me/educations/${educationId}/`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 학력 삭제 (인증 필요)
 */
export async function deleteEducation(educationId: number): Promise<void> {
  try {
    await authClient.delete(`/api/v1/users/me/educations/${educationId}/`);
  } catch (error) {
    throw handleApiError(error);
  }
}
