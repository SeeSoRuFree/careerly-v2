'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarRail } from '@/components/ui/sidebar-rail';
import { MessageSquare, Sparkles, Users, Settings } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Fixed */}
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

      {/* Main Content - With left padding for sidebar */}
      <main className="pl-20 min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-[1280px]">
          {children}
        </div>
      </main>
    </div>
  );
}
