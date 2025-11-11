'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export interface DangerZoneCardProps {
  /**
   * Callback when deletion is requested
   */
  onRequestDeletion?: () => void;
  /**
   * Optional learn more link
   */
  learnMoreLink?: string;
  /**
   * Optional custom deletion button label
   */
  deletionLabel?: string;
  /**
   * Optional custom warning message
   */
  warningMessage?: string;
  /**
   * Optional className
   */
  className?: string;
}

/**
 * DangerZoneCard
 *
 * 계정 삭제 및 위험 조작 안내
 *
 * @example
 * ```tsx
 * <DangerZoneCard
 *   onRequestDeletion={() => console.log('Delete account')}
 *   learnMoreLink="https://help.careerly.com/delete-account"
 *   warningMessage="계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다."
 * />
 * ```
 */
export function DangerZoneCard({
  onRequestDeletion,
  learnMoreLink,
  deletionLabel = '계정 삭제',
  warningMessage = '이 작업은 되돌릴 수 없습니다. 계정과 모든 데이터가 영구적으로 삭제됩니다.',
  className,
}: DangerZoneCardProps) {
  return (
    <Card className={cn('border-red-200 bg-red-50/50', className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-lg text-red-900">위험 영역</CardTitle>
            <CardDescription className="text-red-700">
              신중하게 진행해주세요
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>주의</AlertTitle>
          <AlertDescription>{warningMessage}</AlertDescription>
        </Alert>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 mb-1">계정 삭제</p>
            <p className="text-sm text-slate-600">
              계정과 모든 관련 데이터를 영구적으로 삭제합니다.
            </p>
            {learnMoreLink && (
              <a
                href={learnMoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 mt-2"
              >
                자세히 알아보기
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {onRequestDeletion && (
            <Button
              variant="outline"
              onClick={onRequestDeletion}
              className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-900"
            >
              {deletionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
