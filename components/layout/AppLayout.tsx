'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarRail } from '@/components/ui/sidebar-rail';
import { MobileNavOverlay } from '@/components/ui/mobile-nav-overlay';
import { LoginModal, SignupModal } from '@/components/auth';
import { MessageSquare, Sparkles, Users, Settings, LogIn, LogOut, Menu } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/lib/api';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDrawerMode = searchParams.get('drawer') === 'true';

  // share 페이지는 별도 레이아웃 사용 (인증 체크 안함)
  const isSharePage = pathname?.startsWith('/share');

  const [isSignupModalOpen, setIsSignupModalOpen] = React.useState(false);

  // Get modal state from Zustand store
  const { isLoginModalOpen, openLoginModal, closeLoginModal } = useStore();

  // 로그인 상태 확인 (share 페이지에서는 스킵)
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser({
    enabled: !isSharePage, // share 페이지에서는 호출 안함
  });
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

  // share 페이지는 별도 레이아웃 사용 (사이드바, 모달 없음)
  if (isSharePage) {
    return <>{children}</>;
  }

  // 모바일 네비게이션 상태
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  // 모바일 네비게이션 아이템 설정
  const navItems = {
    primary: [
      { label: 'Chat', path: '/', icon: MessageSquare },
      { label: 'Discover', path: '/discover', icon: Sparkles },
      { label: 'Community', path: '/community', icon: Users },
    ],
    // 비로그인 상태에서는 Settings 메뉴 숨김
    utilities: currentUser ? [{ label: 'Settings', path: '/settings', icon: Settings }] : [],
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
      ? [{ label: '로그인', icon: LogIn, variant: 'coral' as const, onClick: openLoginModal }]
      : [{ label: '로그아웃', icon: LogOut, variant: 'outline' as const, onClick: handleLogout }],
  };

  // 자체 헤더를 가진 페이지들 (모바일 헤더 숨김)
  const hasOwnHeader = pathname?.startsWith('/settings') || pathname?.startsWith('/community/new');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header - 모바일에서만 표시, 자체 헤더가 있는 페이지에서는 숨김 */}
      {!isDrawerMode && !hasOwnHeader && (
        <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-40 md:hidden bg-slate-50 safe-mt">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="메뉴 열기"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* 페이지 타이틀 */}
          {pathname?.startsWith('/community') && (
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-slate-700" />
              <span className="text-base font-semibold text-slate-900">Community</span>
            </div>
          )}
          {pathname?.startsWith('/discover') && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-slate-700" />
              <span className="text-base font-semibold text-slate-900">Discover</span>
            </div>
          )}

          {/* 우측 여백 균형용 */}
          <div className="w-10" />
        </header>
      )}

      {/* Mobile Navigation Overlay */}
      <MobileNavOverlay
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activePath={pathname}
        sections={navItems}
      />

      {/* Sidebar - Fixed (hidden in drawer mode, hidden on mobile) */}
      {!isDrawerMode && (
        <SidebarRail
          fixed={true}
          activePath={pathname}
          sections={navItems}
          className="hidden md:flex"
        />
      )}

      {/* Main Content - With left padding for sidebar (removed in drawer mode) */}
      <main
        className={cn(
          'min-h-screen',
          isDrawerMode ? '' : 'md:pl-20',
          // 자체 헤더가 있는 페이지는 모바일에서 상단 패딩 제거
          !isDrawerMode && !hasOwnHeader && 'pt-14 md:pt-0'
        )}
      >
        {pathname === '/community/new/post' || hasOwnHeader ? (
          children
        ) : (
          <div className="container mx-auto px-4 py-4 md:py-6 max-w-[1280px]">
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
