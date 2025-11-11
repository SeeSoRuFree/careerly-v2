'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface AccountSidebarNavItem {
  /**
   * Unique identifier for the nav item
   */
  id: string;
  /**
   * Display label
   */
  label: string;
  /**
   * Navigation path (if using as link)
   */
  path?: string;
  /**
   * Optional icon component
   */
  icon?: React.ReactNode;
}

export interface AccountSidebarNavProps {
  /**
   * Navigation items
   */
  items: AccountSidebarNavItem[];
  /**
   * Currently active item ID
   */
  activeItem: string;
  /**
   * Callback when item is clicked (alternative to path-based navigation)
   */
  onNavigate?: (itemId: string) => void;
  /**
   * Optional className
   */
  className?: string;
}

/**
 * AccountSidebarNav
 *
 * 계정 메뉴 리스트 표시 / 현재 탭 강조
 *
 * @example
 * ```tsx
 * <AccountSidebarNav
 *   items={[
 *     { id: 'account', label: '계정', path: '/account' },
 *     { id: 'preferences', label: '선호 설정', path: '/account/preferences' },
 *   ]}
 *   activeItem="account"
 *   onNavigate={(id) => console.log(id)}
 * />
 * ```
 */
export function AccountSidebarNav({
  items,
  activeItem,
  onNavigate,
  className,
}: AccountSidebarNavProps) {
  return (
    <nav className={cn('space-y-1', className)}>
      {items.map((item) => {
        const isActive = item.id === activeItem;
        const itemClasses = cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-slate-900 text-white'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
        );

        const content = (
          <>
            {item.icon && (
              <span className="shrink-0">{item.icon}</span>
            )}
            <span>{item.label}</span>
          </>
        );

        if (item.path) {
          return (
            <Link
              key={item.id}
              href={item.path}
              className={itemClasses}
              onClick={() => onNavigate?.(item.id)}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onNavigate?.(item.id)}
            className={cn(itemClasses, 'w-full text-left')}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
