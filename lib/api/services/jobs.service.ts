/**
 * Somoon Jobs API 서비스
 */

import { somoonClient, handleApiError } from '../clients/somoon-client';
import type {
  SomoonJobItem,
  SomoonPaginatedResponse,
  GetDailyJobsParams,
} from '../types/somoon.types';

/**
 * Daily jobs 목록 조회
 * @param params 페이지네이션 파라미터
 * @returns 페이지네이션된 daily job 목록
 */
export async function getDailyJobs(
  params?: GetDailyJobsParams
): Promise<SomoonPaginatedResponse<SomoonJobItem>> {
  try {
    const response = await somoonClient.get<SomoonPaginatedResponse<SomoonJobItem>>(
      '/v1/jobs/daily',
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
