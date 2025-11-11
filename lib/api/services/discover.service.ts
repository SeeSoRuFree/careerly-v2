/**
 * 발견(Discover) 피드 관련 API 서비스
 */

import { authClient, publicClient, handleApiError } from '../clients/rest-client';
import type { DiscoverFeed, DiscoverFeedResponse, PaginationParams } from '../types/rest.types';

/**
 * 발견 피드 목록 조회 (인증 선택)
 */
export async function getDiscoverFeeds(
  params?: PaginationParams,
  authenticated = false
): Promise<DiscoverFeedResponse> {
  try {
    const client = authenticated ? authClient : publicClient;
    const response = await client.get<{ data: DiscoverFeedResponse }>('/discover', {
      params,
    });
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 발견 피드 상세 조회
 */
export async function getDiscoverFeed(feedId: string): Promise<DiscoverFeed> {
  try {
    const response = await publicClient.get<{ data: DiscoverFeed }>(`/discover/${feedId}`);
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 카테고리별 피드 조회
 */
export async function getDiscoverFeedsByCategory(
  category: string,
  params?: PaginationParams
): Promise<DiscoverFeedResponse> {
  try {
    const response = await publicClient.get<{ data: DiscoverFeedResponse }>(
      `/discover/category/${category}`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 인기 피드 조회
 */
export async function getTrendingFeeds(limit = 10): Promise<DiscoverFeed[]> {
  try {
    const response = await publicClient.get<{ data: DiscoverFeed[] }>('/discover/trending', {
      params: { limit },
    });
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 추천 피드 조회 (인증 필요)
 */
export async function getRecommendedFeeds(params?: PaginationParams): Promise<DiscoverFeedResponse> {
  try {
    const response = await authClient.get<{ data: DiscoverFeedResponse }>('/discover/recommended', {
      params,
    });
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 피드 좋아요
 */
export async function likeFeed(feedId: string): Promise<void> {
  try {
    await authClient.post(`/discover/${feedId}/like`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 피드 좋아요 취소
 */
export async function unlikeFeed(feedId: string): Promise<void> {
  try {
    await authClient.delete(`/discover/${feedId}/like`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 피드 북마크
 */
export async function bookmarkFeed(feedId: string): Promise<void> {
  try {
    await authClient.post(`/discover/${feedId}/bookmark`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 피드 북마크 취소
 */
export async function unbookmarkFeed(feedId: string): Promise<void> {
  try {
    await authClient.delete(`/discover/${feedId}/bookmark`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * 북마크한 피드 목록 조회
 */
export async function getBookmarkedFeeds(params?: PaginationParams): Promise<DiscoverFeedResponse> {
  try {
    const response = await authClient.get<{ data: DiscoverFeedResponse }>('/discover/bookmarks', {
      params,
    });
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
