/**
 * Somoon Contents API 서비스
 */

import { somoonClient, handleApiError } from '../clients/somoon-client';
import type {
  SomoonDailyContent,
  SomoonPaginatedResponse,
  GetDailyContentsParams,
} from '../types/somoon.types';

/**
 * Daily contents 목록 조회
 * @param params 페이지네이션 파라미터
 * @returns 페이지네이션된 daily content 목록
 */
export async function getDailyContents(
  params?: GetDailyContentsParams
): Promise<SomoonPaginatedResponse<SomoonDailyContent>> {
  try {
    const response = await somoonClient.get<SomoonPaginatedResponse<SomoonDailyContent>>(
      '/v1/contents/daily',
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
