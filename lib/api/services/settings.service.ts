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
 * 계정 탈퇴 요청
 */
export interface DeleteAccountRequest {
  reason: string;
  feedback?: string;
}

/**
 * 계정 탈퇴 응답
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
    // v2 API 응답 타입
    interface CategoryResponse {
      id: number;
      name: string;
      enum: string;
      is_engineering: boolean;
    }

    const response = await authClient.get<CategoryResponse[]>('/api/v1/categories/');
    // v2 API 응답을 Interest 타입으로 변환
    return response.data.map((cat) => ({
      id: cat.id,
      name: cat.name,
      isEngineering: cat.is_engineering,
    }));
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 사용자 관심사 조회
 */
export async function getUserInterests(): Promise<number[]> {
  try {
    // v2 API 응답 타입
    interface V2UserInterestsResponse {
      id: number;
      user_id: number;
      categories: Array<{
        id: number;
        name: string;
        enum: string;
        is_engineering: boolean;
      }>;
    }

    const response = await authClient.get<V2UserInterestsResponse>('/api/v1/users/me/interests/');
    // categories 배열에서 id만 추출
    return response.data.categories.map((cat) => cat.id);
  } catch (error: any) {
    // 404인 경우 빈 배열 반환 (관심사 미설정 사용자)
    if (error?.status === 404) {
      return [];
    }
    throw handleApiError(error);
  }
}

/**
 * 사용자 관심사 업데이트
 */
export async function updateUserInterests(categoryIds: number[]): Promise<void> {
  try {
    // 먼저 PUT으로 업데이트 시도
    await authClient.put('/api/v1/users/me/interests/', { category_ids: categoryIds });
  } catch (error: any) {
    // 404인 경우 (관심사가 없는 경우) POST로 생성
    if (error?.status === 404) {
      await authClient.post('/api/v1/users/me/interests/', { category_ids: categoryIds });
    } else {
      throw handleApiError(error);
    }
  }
}

/**
 * 계정 탈퇴 요청
 */
export async function requestDeleteAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
  try {
    const response = await authClient.post<DeleteAccountResponse>('/api/v1/users/me/delete-request/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
