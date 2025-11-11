'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AccountPageLayoutProps {
  /**
   * Sidebar navigation content
   */
  sidebar: React.ReactNode;
  /**
   * Main content area
   */
  children: React.ReactNode;
  /**
   * Optional className for the container
   */
  className?: string;
}

/**
 * AccountPageLayout
 *
 * 계정 페이지 공통 레이아웃 (좌측 메뉴 + 우측 콘텐츠)
 *
 * @example
 * ```tsx
 * <AccountPageLayout
 *   sidebar={<AccountSidebarNav items={items} activeItem="account" />}
 * >
 *   <div>Account content</div>
 * </AccountPageLayout>
 * ```
 */
export function AccountPageLayout({
  sidebar,
  children,
  className,
}: AccountPageLayoutProps) {
  return (
    <div className={cn('flex gap-8 max-w-7xl mx-auto', className)}>
      {/* Sidebar - Fixed width on larger screens */}
      <aside className="w-64 shrink-0 hidden md:block">
        {sidebar}
      </aside>

      {/* Main Content - Flexible width */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
