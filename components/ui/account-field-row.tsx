'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface AccountFieldRowProps {
  /**
   * Field label
   */
  label: string;
  /**
   * Field value
   */
  value: string;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Action button label (e.g., "변경", "수정")
   */
  actionLabel?: string;
  /**
   * Callback when action button is clicked
   */
  onAction?: () => void;
  /**
   * Optional className
   */
  className?: string;
}

/**
 * AccountFieldRow
 *
 * 각각의 계정 필드 표시 + 변경 버튼
 *
 * @example
 * ```tsx
 * <AccountFieldRow
 *   label="전체 이름"
 *   value="홍길동"
 *   description="프로필에 표시되는 이름입니다"
 *   actionLabel="변경"
 *   onAction={() => console.log('Change name')}
 * />
 * ```
 */
export function AccountFieldRow({
  label,
  value,
  description,
  actionLabel = '변경',
  onAction,
  className,
}: AccountFieldRowProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 py-4 border-b border-slate-200 last:border-b-0',
        className
      )}
    >
      {/* Left side: Label and Value */}
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-slate-700 mb-1">{label}</dt>
        <dd className="text-sm text-slate-900 truncate">{value}</dd>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>

      {/* Right side: Action Button */}
      {onAction && (
        <div className="shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="text-slate-700 hover:text-slate-900"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
