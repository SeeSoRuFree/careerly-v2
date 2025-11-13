'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarRail } from '@/components/ui/sidebar-rail';
import { MessageSquare, Sparkles, Users, Settings } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDrawerMode = searchParams.get('drawer') === 'true';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Fixed (hidden in drawer mode) */}
      {!isDrawerMode && (
        <SidebarRail
          fixed={true}
          activePath={pathname}
          sections={{
            primary: [
              {
                label: 'Chat',
                path: '/',
                icon: MessageSquare,
              },
              {
                label: 'Discover',
                path: '/discover',
                icon: Sparkles,
              },
              {
                label: 'Community',
                path: '/community',
                icon: Users,
              },
            ],
            utilities: [
              { label: 'Settings', path: '/settings', icon: Settings },
            ],
            account: {
              name: 'User',
              fallback: 'U',
              path: '/profile',
            },
          }}
        />
      )}

      {/* Main Content - With left padding for sidebar (removed in drawer mode) */}
      <main className={isDrawerMode ? 'min-h-screen' : 'pl-20 min-h-screen'}>
        <div className="container mx-auto px-4 py-6 max-w-[1280px]">
          {children}
        </div>
      </main>
    </div>
  );
}
