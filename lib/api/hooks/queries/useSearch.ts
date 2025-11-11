/**
 * 검색 관련 React Query 훅
 */

'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  searchCareer,
  searchCareerGraphQL,
  getTrendingKeywords,
  getSearchHistory,
  searchAutocomplete,
  type SearchResult,
} from '../../services/search.service';

/**
 * 검색 쿼리 키
 */
export const searchKeys = {
  all: ['search'] as const,
  lists: () => [...searchKeys.all, 'list'] as const,
  list: (query: string) => [...searchKeys.lists(), query] as const,
  trending: () => [...searchKeys.all, 'trending'] as const,
  history: () => [...searchKeys.all, 'history'] as const,
  autocomplete: (query: string) => [...searchKeys.all, 'autocomplete', query] as const,
};

/**
 * RESTful API를 사용한 검색 훅
 */
export function useSearch(
  query: string,
  options?: Omit<UseQueryOptions<SearchResult, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<SearchResult, Error>({
    queryKey: searchKeys.list(query),
    queryFn: () => searchCareer(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (cacheTime 대체)
    ...options,
  });
}

/**
 * GraphQL을 사용한 검색 훅
 */
export function useSearchGraphQL(
  query: string,
  options?: Omit<UseQueryOptions<SearchResult, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<SearchResult, Error>({
    queryKey: [...searchKeys.list(query), 'graphql'],
    queryFn: () => searchCareerGraphQL(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * 트렌딩 키워드 조회 훅
 */
export function useTrendingKeywords(
  options?: Omit<UseQueryOptions<string[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<string[], Error>({
    queryKey: searchKeys.trending(),
    queryFn: getTrendingKeywords,
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
    ...options,
  });
}

/**
 * 검색 기록 조회 훅
 */
export function useSearchHistory(
  options?: Omit<UseQueryOptions<string[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<string[], Error>({
    queryKey: searchKeys.history(),
    queryFn: getSearchHistory,
    staleTime: 60 * 1000, // 1분
    ...options,
  });
}

/**
 * 검색 자동완성 훅
 */
export function useSearchAutocomplete(
  query: string,
  options?: Omit<UseQueryOptions<string[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<string[], Error>({
    queryKey: searchKeys.autocomplete(query),
    queryFn: () => searchAutocomplete(query),
    enabled: query.length > 1, // 2글자 이상일 때만 실행
    staleTime: 30 * 1000, // 30초
    ...options,
  });
}
