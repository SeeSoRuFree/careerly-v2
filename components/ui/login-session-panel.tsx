'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, Shield } from 'lucide-react';

export interface LoginSessionPanelProps {
  /**
   * Username or email
   */
  username: string;
  /**
   * Current login date/time
   */
  lastLoginAt?: string;
  /**
   * Callback when logout is clicked
   */
  onLogout?: () => void;
  /**
   * Callback when logout from all sessions is clicked
   */
  onLogoutAllSessions?: () => void;
  /**
   * Optional className
   */
  className?: string;
}

/**
 * LoginSessionPanel
 *
 * 로그인 정보 + 세션 관리
 *
 * @example
 * ```tsx
 * <LoginSessionPanel
 *   username="user@example.com"
 *   lastLoginAt="2024-01-15 14:30"
 *   onLogout={() => console.log('Logout')}
 *   onLogoutAllSessions={() => console.log('Logout all')}
 * />
 * ```
 */
export function LoginSessionPanel({
  username,
  lastLoginAt,
  onLogout,
  onLogoutAllSessions,
  className,
}: LoginSessionPanelProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Shield className="h-5 w-5 text-slate-700" />
          </div>
          <div>
            <CardTitle className="text-lg">로그인 세션</CardTitle>
            <CardDescription>현재 로그인 정보 및 세션 관리</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <dt className="text-sm font-medium text-slate-700 mb-1">계정</dt>
          <dd className="text-sm text-slate-900">{username}</dd>
        </div>

        {lastLoginAt && (
          <div>
            <dt className="text-sm font-medium text-slate-700 mb-1">마지막 로그인</dt>
            <dd className="text-sm text-slate-600">{lastLoginAt}</dd>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          {onLogout && (
            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          )}

          {onLogoutAllSessions && (
            <Button
              variant="ghost"
              onClick={onLogoutAllSessions}
              className="w-full justify-start gap-2 text-slate-700"
            >
              <LogOut className="h-4 w-4" />
              모든 세션에서 로그아웃하기
            </Button>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-600">
          다른 기기에서 로그인되어 있다면 모든 세션에서 로그아웃할 수 있습니다.
        </p>
      </CardFooter>
    </Card>
  );
}
