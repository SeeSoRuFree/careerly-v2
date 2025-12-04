/**
 * Jobs API 서비스
 *
 * Careerly 백엔드를 통해 채용공고를 조회합니다.
 * 인증된 사용자의 경우, 팔로우한 기업의 공고를 우선 정렬합니다.
 */

import { authClient, handleApiError } from '../clients/rest-client';
import type {
  SomoonJobItem,
  SomoonPaginatedResponse,
  GetDailyJobsParams,
} from '../types/somoon.types';

/**
 * Daily jobs 목록 조회 (관심기업 우선 정렬)
 *
 * Careerly 백엔드 (/api/v1/jobs/daily/)를 통해 채용공고를 가져옵니다.
 * 로그인한 사용자는 팔로우한 기업의 공고가 우선 표시됩니다.
 *
 * @param params 페이지네이션 파라미터
 * @returns 페이지네이션된 daily job 목록 (is_followed_company 플래그 포함)
 */
export async function getDailyJobs(
  params?: GetDailyJobsParams
): Promise<SomoonPaginatedResponse<SomoonJobItem>> {
  try {
    const response = await authClient.get<SomoonPaginatedResponse<SomoonJobItem>>(
      '/jobs/daily/',
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
