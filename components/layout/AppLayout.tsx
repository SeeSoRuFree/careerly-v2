'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarRail } from '@/components/ui/sidebar-rail';
import { MobileNavOverlay } from '@/components/ui/mobile-nav-overlay';
import { LoginModal, SignupModal } from '@/components/auth';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
  // 모바일 네비게이션 상태 (조건부 return 전에 선언해야 함)
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  // 로그아웃 확인 다이얼로그 상태
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

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
    setIsMobileNavOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout.mutate();
  };

  // share 페이지는 별도 레이아웃 사용 (사이드바, 모달 없음)
  if (isSharePage) {
    return <>{children}</>;
  }

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
  const hasOwnHeader = pathname?.startsWith('/settings') || pathname?.startsWith('/community/new') || pathname?.startsWith('/community/edit');

  // 홈페이지는 전체화면 레이아웃 (헤더 없음, 중앙 정렬)
  const isHomePage = pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header - 모바일에서만 표시, 자체 헤더 페이지에서는 숨김 */}
      {!isDrawerMode && !hasOwnHeader && (
        <header className={cn(
          "fixed top-0 left-0 right-0 z-40 md:hidden",
          // 홈페이지: 투명 배경, 햄버거 버튼만
          isHomePage ? "bg-transparent safe-pt" : "bg-slate-50 safe-pt"
        )}>
          <div className="h-14 flex items-center justify-between px-4">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* 페이지 타이틀 - 홈페이지에서는 숨김 */}
            {!isHomePage && (
              <>
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
              </>
            )}

            {/* 우측 여백 균형용 - 홈페이지에서는 숨김 */}
            {!isHomePage && <div className="w-10" />}
          </div>
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
          // 홈페이지: 전체화면 중앙 정렬
          isHomePage && 'flex flex-col',
          // 자체 헤더가 있는 페이지는 모바일에서 상단 패딩 제거
          // safe-pt-14: safe area + 56px (헤더 높이)
          !isDrawerMode && !hasOwnHeader && !isHomePage && 'safe-pt-14 md:pt-0'
        )}
      >
        {isHomePage ? (
          children
        ) : pathname === '/community/new/post' || hasOwnHeader ? (
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

      {/* 로그아웃 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="로그아웃"
        description="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        variant="danger"
        isLoading={logout.isPending}
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
