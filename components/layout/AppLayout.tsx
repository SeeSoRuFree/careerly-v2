'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { SidebarRail } from '@/components/ui/sidebar-rail';
import { MobileNavOverlay } from '@/components/ui/mobile-nav-overlay';
import { TopAlertBanner, TopAlertProvider, useTopAlert } from '@/components/ui/top-alert-banner';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { LoginModal, SignupModal } from '@/components/auth';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MessageSquare, Sparkles, Users, Settings, LogIn, Menu, MessageSquareHeart } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/lib/api';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import {
  setUserId,
  clearUserId,
  trackLogout,
  usePageViewTracking,
  useSessionTracking,
} from '@/lib/analytics';

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isDrawerMode = searchParams.get('drawer') === 'true';

  // share 페이지는 별도 레이아웃 사용 (인증 체크 안함)
  const isSharePage = pathname?.startsWith('/share');

  const [isSignupModalOpen, setIsSignupModalOpen] = React.useState(false);
  // 모바일 네비게이션 상태 (조건부 return 전에 선언해야 함)
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  // 로그아웃 확인 다이얼로그 상태
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  // 피드백 모달 상태
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);

  // Get modal state from Zustand store
  const { isLoginModalOpen, openLoginModal, closeLoginModal } = useStore();

  // 페이지뷰 자동 추적
  usePageViewTracking();

  // 세션 추적 (로그아웃 시 session_duration 계산용)
  const { getSessionDuration } = useSessionTracking();

  // 로그인 상태 확인 (share 페이지에서는 스킵)
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser({
    enabled: !isSharePage, // share 페이지에서는 호출 안함
  });

  // 로그인 시 User-ID 설정
  React.useEffect(() => {
    if (currentUser?.id) {
      setUserId(String(currentUser.id));
    }
  }, [currentUser?.id]);

  const logout = useLogout({
    onSuccess: () => {
      // 로그아웃 성공 시 User-ID 초기화
      clearUserId();
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
    // 로그아웃 이벤트 트래킹 (session_duration 포함)
    trackLogout(getSessionDuration());
    logout.mutate();
  };

  // 커리어리 2.0 출시 알림 (localStorage로 영구 닫기 관리)
  const ALERT_DISMISSED_KEY = 'careerly2_launch_dismissed';
  const [showLaunchAlert, setShowLaunchAlert] = React.useState(false);

  // 초기 로드 시 localStorage 확인
  React.useEffect(() => {
    if (isSharePage) return;
    const isDismissed = localStorage.getItem(ALERT_DISMISSED_KEY) === 'true';
    if (!isDismissed) {
      setShowLaunchAlert(true);
    }
  }, [isSharePage]);

  // 링크 클릭 시 영구 닫기
  const handleLaunchAlertAction = () => {
    localStorage.setItem(ALERT_DISMISSED_KEY, 'true');
    setShowLaunchAlert(false);
    window.location.href = '/community?post=123773';
  };

  // 닫기 버튼 클릭 시 일시 닫기 (다음 방문 시 다시 표시)
  const handleLaunchAlertClose = () => {
    setShowLaunchAlert(false);
  };

  // Pull to Refresh 핸들러 (early return 전에 선언해야 hooks 개수 일치)
  const handleRefresh = React.useCallback(async () => {
    // 모든 React Query 캐시 무효화 및 refetch
    await queryClient.invalidateQueries();
  }, [queryClient]);

  // share 페이지는 별도 레이아웃 사용 (사이드바, 모달 없음)
  if (isSharePage) {
    return <>{children}</>;
  }

  // 모바일 네비게이션 아이템 설정
  const navItems = {
    primary: [
      { label: 'Chat', path: '/chat', icon: MessageSquare, badge: 'beta' },
      { label: 'Discover', path: '/discover', icon: Sparkles },
      { label: 'Community', path: '/community', icon: Users },
    ],
    // 피드백은 항상 표시, Settings는 로그인 시에만
    utilities: [
      { label: '피드백 보내기', onItemClick: () => setShowFeedbackModal(true), icon: MessageSquareHeart },
      ...(currentUser ? [{ label: 'Settings', path: '/settings', icon: Settings }] : []),
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
      ? [{ label: '로그인', icon: LogIn, variant: 'coral' as const, onClick: openLoginModal }]
      : [],
  };

  // 자체 헤더를 가진 페이지들 (모바일 헤더 숨김)
  const hasOwnHeader = pathname?.startsWith('/settings') || pathname?.startsWith('/community/new') || pathname?.startsWith('/community/edit') || pathname?.startsWith('/profile/');

  // community 페이지에서 drawer가 열린 상태 (post 또는 qna 파라미터가 있을 때)
  const isCommunityDrawerOpen = pathname === '/community' && (searchParams.has('post') || searchParams.has('qna'));

  // 채팅 페이지는 전체화면 레이아웃 (헤더 없음, 중앙 정렬)
  const isChatPage = pathname === '/chat';

  // Pull to Refresh 비활성화 조건
  // - 드로어 모드에서는 비활성화
  const isPullToRefreshDisabled = isDrawerMode;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 커리어리 2.0 출시 알림 */}
      {!isSharePage && (
        <TopAlertBanner
          isVisible={showLaunchAlert}
          onClose={handleLaunchAlertClose}
          variant="info"
          message="🎉 커리어리 2.0을 시작합니다!"
          actionText="자세히 보기"
          onAction={handleLaunchAlertAction}
          messageClickable
        />
      )}

      {/* Mobile Header - 모바일에서만 표시, 자체 헤더 페이지 및 community drawer에서는 숨김 */}
      {!isDrawerMode && !hasOwnHeader && !isCommunityDrawerOpen && (
        <header className={cn(
          "fixed top-0 left-0 right-0 z-40 md:hidden bg-slate-50 safe-pt"
        )}>
          <div className="h-14 flex items-center justify-between px-4">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* 페이지 타이틀 - 채팅 페이지에서는 숨김 */}
            {!isChatPage && (
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

            {/* 우측 여백 균형용 - 채팅 페이지에서는 숨김 */}
            {!isChatPage && <div className="w-10" />}
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
      <PullToRefresh
        onRefresh={handleRefresh}
        disabled={isPullToRefreshDisabled}
        topOffset={56}
      >
        <main
          className={cn(
            'min-h-screen',
            isDrawerMode ? '' : 'md:pl-20',
            // 채팅 페이지: 전체화면 중앙 정렬
            isChatPage && 'flex flex-col',
            // 자체 헤더가 있는 페이지는 모바일에서 상단 패딩 제거
            // safe-pt-14: safe area + 56px (헤더 높이)
            !isDrawerMode && !hasOwnHeader && !isChatPage && 'safe-pt-14 md:pt-0'
          )}
        >
          {isChatPage ? (
            children
          ) : pathname === '/community/new/post' || hasOwnHeader ? (
            children
          ) : (
            <div className="container mx-auto px-4 py-4 md:py-6 max-w-[1280px]">
              {children}
            </div>
          )}
        </main>
      </PullToRefresh>

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

      {/* 피드백 모달 */}
      <ConfirmDialog
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onConfirm={() => {
          window.open('https://feedback.careerly.co.kr/', '_blank');
          setShowFeedbackModal(false);
        }}
        title="피드백 보내기"
        description="커리어리를 더 좋게 만들기 위해 여러분의 소중한 의견을 기다리고 있어요. 불편한 점, 개선 아이디어, 칭찬 무엇이든 좋아요!"
        confirmText="피드백 남기기"
        cancelText="닫기"
        variant="default"
      />
    </div>
  );
}

function AppLayoutWrapper({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const isSharePage = pathname?.startsWith('/share');

  // share 페이지와 일반 페이지 간 전환 시 컴포넌트 remount (hooks 일관성 유지)
  return (
    <AppLayoutContent key={isSharePage ? 'share' : 'main'}>
      {children}
    </AppLayoutContent>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AppLayoutWrapper>{children}</AppLayoutWrapper>
    </Suspense>
  );
}
