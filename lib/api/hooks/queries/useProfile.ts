/**
 * 프로필 관련 React Query 훅
 */

'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  getProfileById,
  getProfileByUserId,
  getMyProfileDetail,
} from '../../services/profile.service';
import type { ProfileDetail } from '../../types/profile.types';

/**
 * 프로필 쿼리 키
 */
export const profileKeys = {
  all: ['profile'] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (id: number) => [...profileKeys.details(), id] as const,
  byUser: (userId: number) => [...profileKeys.all, 'user', userId] as const,
  me: () => [...profileKeys.all, 'me'] as const,
};

/**
 * 프로필 ID로 프로필 조회 훅
 */
export function useProfileById(
  profileId: number,
  options?: Omit<UseQueryOptions<ProfileDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProfileDetail, Error>({
    queryKey: profileKeys.detail(profileId),
    queryFn: () => getProfileById(profileId),
    enabled: !!profileId && profileId > 0,
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

/**
 * 사용자 ID로 프로필 조회 훅
 */
export function useProfileByUserId(
  userId: number,
  options?: Omit<UseQueryOptions<ProfileDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProfileDetail, Error>({
    queryKey: profileKeys.byUser(userId),
    queryFn: () => getProfileByUserId(userId),
    enabled: !!userId && userId > 0,
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}

/**
 * 내 프로필 상세 조회 훅
 * 현재 사용자 ID를 파라미터로 받아 프로필 조회
 */
export function useMyProfileDetail(
  userId: number | undefined,
  options?: Omit<UseQueryOptions<ProfileDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProfileDetail, Error>({
    queryKey: profileKeys.me(),
    queryFn: () => getMyProfileDetail(userId!),
    enabled: !!userId && userId > 0,
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  });
}
