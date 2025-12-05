/**
 * Block API 서비스
 */

import { authClient, handleApiError } from '../clients/rest-client';
import type {
  BlockResponse,
  UnblockResponse,
  IsBlockedResponse,
  PaginatedBlockedUsersResponse,
} from '../types/block.types';

/**
 * 사용자 차단
 * 인증 필요
 *
 * @param userId - 차단할 사용자 ID
 */
export async function blockUser(userId: number): Promise<BlockResponse> {
  try {
    const response = await authClient.post<BlockResponse>(`/api/v1/users/${userId}/block/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 사용자 차단 해제
 * 인증 필요
 *
 * @param userId - 차단 해제할 사용자 ID
 */
export async function unblockUser(userId: number): Promise<UnblockResponse> {
  try {
    const response = await authClient.delete<UnblockResponse>(`/api/v1/users/${userId}/unblock/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 사용자 차단 상태 확인
 * 인증 필요
 *
 * @param userId - 확인할 사용자 ID
 */
export async function isUserBlocked(userId: number): Promise<boolean> {
  try {
    const response = await authClient.get<IsBlockedResponse>(`/api/v1/users/${userId}/is-blocked/`);
    return response.data.blocked;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 차단된 사용자 목록 조회 (페이지네이션)
 * 인증 필요
 *
 * @param page - 페이지 번호
 */
export async function getBlockedUsers(page?: number): Promise<PaginatedBlockedUsersResponse> {
  try {
    const params = page ? { page } : undefined;
    const response = await authClient.get<PaginatedBlockedUsersResponse>(
      '/api/v1/users/me/blocked-users/',
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
