'use client';

/**
 * 위젯 로딩 스켈레톤
 */

import { WidgetSize } from './types';

interface WidgetSkeletonProps {
  size: WidgetSize;
}

export function WidgetSkeleton({ size }: WidgetSkeletonProps) {
  const isLarge = size === 'large' || size === 'full';

  return (
    <div className="animate-pulse h-full">
      {/* Title skeleton */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>

      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        {isLarge && (
          <>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </>
        )}
      </div>

      {/* Additional content for larger widgets */}
      {isLarge && (
        <div className="mt-6 space-y-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      )}
    </div>
  );
}
