'use client';

import * as React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchLimitBannerProps {
  searchCount: number;
  maxSearches: number;
  resetTime: Date;
  className?: string;
}

const SearchLimitBanner = React.forwardRef<HTMLDivElement, SearchLimitBannerProps>(
  ({ searchCount, maxSearches, resetTime, className }, ref) => {
    const remaining = maxSearches - searchCount;
    const isLimited = remaining <= 0;

    const formatResetTime = (date: Date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return (
      <Alert
        ref={ref}
        className={cn(
          'border-amber-500/50 bg-amber-50 text-amber-900',
          isLimited && 'border-red-500/50 bg-red-50 text-red-900',
          className
        )}
      >
        <Clock className="h-5 w-5" />
        <AlertTitle className="font-semibold">
          {isLimited ? '검색 횟수 제한 도달' : '베타 검색 제한'}
        </AlertTitle>
        <AlertDescription>
          {isLimited ? (
            <>
              오늘의 검색 횟수를 모두 사용하셨습니다.{' '}
              <strong>{formatResetTime(resetTime)}</strong>에 {maxSearches}회로 초기화됩니다.
            </>
          ) : (
            <>
              베타 기간 동안 하루 <strong>{maxSearches}회</strong>까지 검색 가능합니다.{' '}
              (남은 횟수: <strong>{remaining}회</strong>)
            </>
          )}
        </AlertDescription>
      </Alert>
    );
  }
);

SearchLimitBanner.displayName = 'SearchLimitBanner';

export { SearchLimitBanner };
