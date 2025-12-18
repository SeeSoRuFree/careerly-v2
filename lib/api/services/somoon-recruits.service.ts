/**
 * Somoon Recruits API 서비스
 * recruits.somoon.ai:8000/data API
 */

import { somoonRecruitsClient, handleApiError } from '../clients/somoon-recruits-client';
import type {
  RecruitsContentsMainResponse,
  GetRecruitsContentsParams,
  RecruitsSearchJobsResponse,
  SearchCompaniesJobsParams,
  RecruitsTrendReportResponse,
  GetTrendReportParams,
  RecruitsCompanyInfoResponse,
  RecruitsContentRankingResponse,
  RecruitsContentType,
  SearchJobsByKeywordParams,
  RecruitsKeywordSearchResponse,
  RecruitsV2MainResponse,
  RecruitsJobsByIdsResponse,
  RecruitsContentsByIdsResponse,
} from '../types/somoon-recruits.types';

/**
 * 콘텐츠 메인 조회 (블로그, 강의, 도서)
 * @param params 조회 파라미터
 * @returns 콘텐츠 목록
 */
export async function getRecruitsContents(
  params: GetRecruitsContentsParams
): Promise<RecruitsContentsMainResponse> {
  try {
    const response = await somoonRecruitsClient.get<RecruitsContentsMainResponse>(
      '/contents/main',
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 회사별 채용공고 검색
 * @param params 검색 파라미터
 * @returns 채용공고 목록
 */
export async function searchCompaniesJobs(
  params: SearchCompaniesJobsParams
): Promise<RecruitsSearchJobsResponse> {
  try {
    const { categories, ...restParams } = params;
    const queryParams: Record<string, any> = { ...restParams };

    // categories 배열을 쿼리 파라미터로 변환
    if (categories && categories.length > 0) {
      queryParams.categories = categories.join(',');
    }

    const response = await somoonRecruitsClient.get<RecruitsSearchJobsResponse>(
      '/search/companies',
      { params: queryParams }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 트렌드 리포트 조회
 * @param params 조회 파라미터
 * @returns 트렌드 리포트
 */
export async function getTrendReport(
  params?: GetTrendReportParams
): Promise<RecruitsTrendReportResponse> {
  try {
    const response = await somoonRecruitsClient.get<RecruitsTrendReportResponse>(
      '/trend-report',
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 트렌드 리포트 생성 (AI 분석)
 * @param date 분석할 날짜 (YYYYMMDD)
 * @param jobCategory 직군 카테고리
 * @returns 생성된 트렌드 리포트
 */
export async function generateTrendReport(
  date?: string,
  jobCategory?: string
): Promise<RecruitsTrendReportResponse> {
  try {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    if (jobCategory) params.job_category = jobCategory;

    const response = await somoonRecruitsClient.get<RecruitsTrendReportResponse>(
      '/generate-trend-report',
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 회사 정보 조회
 * @param signs 쉼표로 구분된 회사 sign 목록
 * @returns 회사 정보 목록
 */
export async function getCompanyInfo(
  signs: string
): Promise<RecruitsCompanyInfoResponse> {
  try {
    const response = await somoonRecruitsClient.get<RecruitsCompanyInfoResponse>(
      '/company/info',
      { params: { signs } }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 콘텐츠 랭킹 조회
 * @param contentType 콘텐츠 타입 (blog, lecture, book)
 * @param showMonthlyChange 최근 1달 변화량 포함 여부
 * @returns 콘텐츠 랭킹
 */
export async function getContentsRanking(
  contentType: RecruitsContentType,
  showMonthlyChange = false
): Promise<RecruitsContentRankingResponse> {
  try {
    const response = await somoonRecruitsClient.get<RecruitsContentRankingResponse>(
      '/contents/ranking',
      {
        params: {
          content_type: contentType,
          show_monthly_change: showMonthlyChange,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 키워드로 채용공고 검색 (날짜 필터 지원)
 * @param params 검색 파라미터
 * @returns 채용공고 검색 결과
 */
export async function searchJobsByKeyword(
  params: SearchJobsByKeywordParams
): Promise<RecruitsKeywordSearchResponse> {
  try {
    const response = await somoonRecruitsClient.get<RecruitsKeywordSearchResponse>(
      '/search/keyword',
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * V2 메인 데이터 조회 (일별 통계 + 회사별 채용공고)
 * @returns 최근 7일 일별 통계 및 회사별 채용공고 데이터
 */
export async function getV2MainData(): Promise<RecruitsV2MainResponse> {
  try {
    const response = await somoonRecruitsClient.get<RecruitsV2MainResponse>(
      '/search/v2/main'
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 채용공고 ID로 상세 정보 조회
 * @param ids 쉼표로 구분된 채용공고 ID 또는 ID 배열
 * @returns 채용공고 상세 정보 목록
 */
export async function getJobsByIds(
  ids: string | number[]
): Promise<RecruitsJobsByIdsResponse> {
  try {
    const idsString = Array.isArray(ids) ? ids.join(',') : ids;
    const response = await somoonRecruitsClient.get<RecruitsJobsByIdsResponse>(
      '/search',
      { params: { ids: idsString } }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 콘텐츠(블로그/도서/강의) ID로 상세 정보 조회
 * @param ids 쉼표로 구분된 콘텐츠 ID 또는 ID 배열
 * @returns 콘텐츠 상세 정보 목록
 */
export async function getContentsByIds(
  ids: string | number[]
): Promise<RecruitsContentsByIdsResponse> {
  try {
    const idsString = Array.isArray(ids) ? ids.join(',') : ids;
    const response = await somoonRecruitsClient.get<RecruitsContentsByIdsResponse>(
      '/search/contents_ids',
      { params: { ids: idsString } }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
