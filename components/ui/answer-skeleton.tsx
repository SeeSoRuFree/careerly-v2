'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface AnswerSkeletonProps {
  className?: string;
  lines?: number;
}

export function AnswerSkeleton({ className, lines = 8 }: AnswerSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)} aria-label="답변 로딩 중">
      {/* Title skeleton */}
      <Skeleton className="h-6 w-2/3" />

      {/* First paragraph */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* List items skeleton */}
      <div className="space-y-2 ml-4">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-11/12" />
      </div>

      {/* Second paragraph */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Additional lines based on lines prop */}
      {lines > 8 && (
        <div className="space-y-2">
          {Array.from({ length: Math.min(lines - 8, 6) }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                'h-4',
                i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-4/5'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
