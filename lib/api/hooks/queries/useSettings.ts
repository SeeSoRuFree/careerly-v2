/**
 * 설정 관련 React Query 훅
 */

'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  getUserSettings,
  getInterests,
  getUserInterests,
  UserSettings,
  Interest,
} from '../../services/settings.service';

/**
 * Query Key Factory
 */
export const settingsKeys = {
  all: () => ['settings'] as const,
  userSettings: () => [...settingsKeys.all(), 'userSettings'] as const,
  interests: () => [...settingsKeys.all(), 'interests'] as const,
  userInterests: () => [...settingsKeys.all(), 'userInterests'] as const,
};

/**
 * 사용자 설정 조회
 */
export function useUserSettings(
  options?: Omit<UseQueryOptions<UserSettings, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UserSettings, Error>({
    queryKey: settingsKeys.userSettings(),
    queryFn: getUserSettings,
    ...options,
  });
}

/**
 * 관심사 목록 조회
 */
export function useInterests(
  options?: Omit<UseQueryOptions<Interest[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Interest[], Error>({
    queryKey: settingsKeys.interests(),
    queryFn: getInterests,
    ...options,
  });
}

/**
 * 사용자 관심사 조회
 */
export function useUserInterests(
  options?: Omit<UseQueryOptions<number[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<number[], Error>({
    queryKey: settingsKeys.userInterests(),
    queryFn: getUserInterests,
    ...options,
  });
}
