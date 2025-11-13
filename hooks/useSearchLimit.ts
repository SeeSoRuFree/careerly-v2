'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SearchLimitState {
  canSearch: boolean;
  searchCount: number;
  isLimited: boolean;
  maxSearches: number;
  resetTime: Date;
  recordSearch: () => void;
  reset: () => void;
}

const MAX_SEARCHES = 10;
const STORAGE_KEY = 'careerly_search_limit';

interface StoredData {
  count: number;
  date: string;
}

/**
 * 검색 횟수 제한 관리 훅
 *
 * @param maxSearches 하루 최대 검색 횟수 (기본값: 10)
 * @returns SearchLimitState 검색 제한 상태 및 제어 함수
 *
 * @example
 * const { canSearch, searchCount, isLimited, recordSearch } = useSearchLimit();
 *
 * if (!canSearch) {
 *   return <SearchLimitBanner searchCount={searchCount} />;
 * }
 *
 * // 검색 실행 시
 * recordSearch();
 */
export function useSearchLimit(maxSearches: number = MAX_SEARCHES): SearchLimitState {
  const [searchCount, setSearchCount] = useState<number>(0);
  const [resetTime, setResetTime] = useState<Date>(new Date());

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toDateString();

    if (stored) {
      try {
        const data: StoredData = JSON.parse(stored);

        // Check if data is from today
        if (data.date === today) {
          setSearchCount(data.count);
        } else {
          // Reset if it's a new day
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 0, date: today }));
          setSearchCount(0);
        }
      } catch (error) {
        console.error('Failed to parse search limit data:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      // Initialize if no data exists
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 0, date: today }));
    }

    // Calculate reset time (midnight)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    setResetTime(tomorrow);
  }, []);

  // Record a search
  const recordSearch = useCallback(() => {
    if (typeof window === 'undefined') return;

    const today = new Date().toDateString();
    const newCount = searchCount + 1;

    setSearchCount(newCount);

    const data: StoredData = { count: newCount, date: today };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [searchCount]);

  // Reset count (for testing or manual reset)
  const reset = useCallback(() => {
    if (typeof window === 'undefined') return;

    const today = new Date().toDateString();
    setSearchCount(0);

    const data: StoredData = { count: 0, date: today };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const isLimited = searchCount >= maxSearches;
  const canSearch = !isLimited;

  return {
    canSearch,
    searchCount,
    isLimited,
    maxSearches,
    resetTime,
    recordSearch,
    reset,
  };
}
