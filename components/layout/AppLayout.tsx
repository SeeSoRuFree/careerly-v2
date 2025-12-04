'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarRail } from '@/components/ui/sidebar-rail';
import { LoginModal, SignupModal } from '@/components/auth';
import { MessageSquare, Sparkles, Users, Settings, LogIn, LogOut } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/lib/api';
import { useStore } from '@/hooks/useStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDrawerMode = searchParams.get('drawer') === 'true';

  const [isSignupModalOpen, setIsSignupModalOpen] = React.useState(false);

  // Get modal state from Zustand store
  const { isLoginModalOpen, openLoginModal, closeLoginModal } = useStore();

  // 로그인 상태 확인
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const logout = useLogout({
    onSuccess: () => {
      // 로그아웃 성공 시 별도 처리 필요 없음 (useLogout에서 처리)
    },
  });

  const handleOpenSignup = () => {
    closeLoginModal();
    setIsSignupModalOpen(true);
  };

  const handleLogout = () => {
    logout.mutate();
  };

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
            account: currentUser
              ? {
                name: currentUser.name,
                email: currentUser.email,
                avatar: currentUser.image_url,
                fallback: currentUser.name?.charAt(0) || 'U',
                path: '/profile',
              }
              : undefined,
            ctas: !currentUser
              ? [
                {
                  label: '로그인',
                  icon: LogIn,
                  variant: 'coral',
                  onClick: openLoginModal,
                },
              ]
              : [
                {
                  label: '로그아웃',
                  icon: LogOut,
                  variant: 'outline',
                  onClick: handleLogout,
                },
              ],
          }}
        />
      )}

      {/* Main Content - With left padding for sidebar (removed in drawer mode) */}
      <main className={isDrawerMode ? 'min-h-screen' : 'pl-20 min-h-screen'}>
        {pathname === '/community/new/post' ? (
          children
        ) : (
          <div className="container mx-auto px-4 py-6 max-w-[1280px]">
            {children}
          </div>
        )}
      </main>

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSignupClick={handleOpenSignup}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onLoginClick={openLoginModal}
      />
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
}
