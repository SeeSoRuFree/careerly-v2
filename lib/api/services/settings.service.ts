/**
 * 설정 관련 API 서비스
 */

import { authClient, handleApiError } from '../clients/rest-client';

// ============================================================
// Types
// ============================================================

/**
 * 사용자 설정
 */
export interface UserSettings {
  open_to_work_status: 'actively_looking' | 'open' | 'not_interested' | null;
  open_to_search_engine: boolean;
}

/**
 * 비밀번호 변경 요청
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

/**
 * 관심사
 */
export interface Interest {
  id: number;
  name: string;
  description?: string;
  isEngineering?: boolean;
  displaySequence?: number;
}

/**
 * 사용자 관심사 응답
 */
export interface UserInterestsResponse {
  category_ids: number[];
}

/**
 * 계정 삭제 요청
 */
export interface DeleteAccountRequest {
  reason?: string;
  feedback?: string;
}

/**
 * 계정 삭제 응답
 */
export interface DeleteAccountResponse {
  request_id: number;
}

// ============================================================
// Services
// ============================================================

/**
 * 사용자 설정 조회
 */
export async function getUserSettings(): Promise<UserSettings> {
  try {
    const response = await authClient.get<UserSettings>('/api/v1/users/me/settings/');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 사용자 설정 수정
 */
export async function updateUserSettings(data: Partial<UserSettings>): Promise<UserSettings> {
  try {
    const response = await authClient.patch<UserSettings>('/api/v1/users/me/settings/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 비밀번호 변경
 */
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  try {
    await authClient.put('/api/v1/users/me/password/', data);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 관심사 목록 조회
 */
export async function getInterests(): Promise<Interest[]> {
  try {
    const response = await authClient.get<Interest[]>('/api/v1/interests/');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 사용자 관심사 조회
 */
export async function getUserInterests(): Promise<number[]> {
  try {
    const response = await authClient.get<UserInterestsResponse>('/api/v1/users/me/interests/');
    return response.data.category_ids;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 사용자 관심사 업데이트
 */
export async function updateUserInterests(categoryIds: number[]): Promise<void> {
  try {
    await authClient.put('/api/v1/users/me/interests/', { category_ids: categoryIds });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 계정 삭제 요청
 */
export async function requestDeleteAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
  try {
    const response = await authClient.post<DeleteAccountResponse>('/api/v1/users/me/delete-request/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
