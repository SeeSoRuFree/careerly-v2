/**
 * 검색 관련 API 서비스
 */

import { authClient, publicClient, handleApiError } from '../clients/rest-client';
import { graphqlRequest } from '../clients/graphql-client';
import type { SearchParams, SearchResult as ApiSearchResult } from '../types/rest.types';
import { GRAPHQL_QUERIES } from '../types/graphql.types';
import mockData from '@/lib/mock/search.mock.json';

/**
 * 기존 타입 호환성을 위한 타입 (기존 search.ts와 호환)
 */
export interface Citation {
  id: string;
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResult {
  query: string;
  answer: string;
  citations: Citation[];
}

/**
 * RESTful API를 사용한 검색 (인증 필요)
 */
export async function searchCareer(query: string): Promise<SearchResult> {
  try {
    // TODO: 실제 API 연동 시 주석 해제
    // const response = await authClient.get<SearchResult>('/search', {
    //   params: { query },
    // });
    // return response.data;

    // 현재는 mock 데이터 반환 (기존 동작 유지)
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      ...mockData.sampleSearchResults,
      query,
    };
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * GraphQL을 사용한 검색
 */
export async function searchCareerGraphQL(query: string): Promise<SearchResult> {
  try {
    // TODO: 실제 GraphQL API 연동 시 주석 해제
    // const result = await graphqlRequest<{
    //   search: {
    //     query: string;
    //     answer: string;
    //     citations: Citation[];
    //   };
    // }>(GRAPHQL_QUERIES.SEARCH, { query });
    //
    // return result.search;

    // 현재는 mock 데이터 반환
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      ...mockData.sampleSearchResults,
      query,
    };
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 고급 검색 (페이지네이션, 필터링 지원)
 */
export async function advancedSearch(params: SearchParams): Promise<ApiSearchResult> {
  try {
    const response = await authClient.get<ApiSearchResult>('/search/advanced', {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 트렌딩 키워드 조회
 */
export function getTrendingKeywords(): string[] {
  return mockData.trendingKeywords;
}

/**
 * 검색 기록 조회
 */
export async function getSearchHistory(): Promise<string[]> {
  try {
    const response = await authClient.get<{ data: string[] }>('/search/history');
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 검색 기록 삭제
 */
export async function clearSearchHistory(): Promise<void> {
  try {
    await authClient.delete('/search/history');
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 검색 자동완성
 */
export async function searchAutocomplete(query: string): Promise<string[]> {
  try {
    const response = await publicClient.get<{ data: string[] }>('/search/autocomplete', {
      params: { query },
    });
    return response.data.data;
  } catch (error) {
    // 자동완성 에러는 조용히 처리
    throw handleApiError(error, { showToast: false });
  }
}
