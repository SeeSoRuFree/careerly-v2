'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, User, Lock, Heart, Briefcase, Eye, LogOut, Trash2 } from 'lucide-react';
import { useCurrentUser } from '@/lib/api/hooks/queries/useUser';
import { useLogout } from '@/lib/api/hooks/mutations/useAuthMutations';
import { useUserSettings, useUpdateUserSettings } from '@/lib/api';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingItem({ icon, title, description, onClick, rightElement, danger }: SettingItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 py-4 border-b border-slate-100 last:border-b-0',
        onClick && 'cursor-pointer hover:bg-slate-50 -mx-4 px-4 rounded-lg',
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-9 h-9 rounded-full',
        danger ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium', danger ? 'text-red-600' : 'text-slate-900')}>{title}</p>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>
      {rightElement || (onClick && <ChevronRight className="h-5 w-5 text-slate-400" />)}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { logoutWithConfirm } = useLogout();

  // 비로그인 상태면 메인으로 리다이렉트
  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  // 사용자 설정 조회 및 업데이트
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  // 이직 상태 변경
  const handleOpenToWorkChange = (checked: boolean) => {
    const newStatus = checked ? 'actively_looking' : 'not_interested';
    updateSettings.mutate({ open_to_work_status: newStatus });
  };

  // 프로필 공개 범위 변경
  const handleProfilePublicChange = (checked: boolean) => {
    updateSettings.mutate({ open_to_search_engine: checked });
  };

  // 이직 상태 텍스트 표시
  const getOpenToWorkText = () => {
    if (!settings?.open_to_work_status) return '미설정';
    switch (settings.open_to_work_status) {
      case 'actively_looking':
        return '적극적으로 구직 중';
      case 'open':
        return '이직에 열려 있음';
      case 'not_interested':
        return '이직 의향 없음';
      default:
        return '미설정';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="w-full bg-slate-50 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2 hover:bg-slate-200">
              <ChevronLeft className="h-6 w-6 text-slate-900" />
            </Button>
            <span className="font-semibold text-slate-900">설정</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-10">
            {/* 프로필 섹션 */}
            {user && (
              <div
                className="flex items-center gap-4 cursor-pointer hover:bg-slate-100 -mx-4 px-4 py-4 rounded-lg transition-colors"
                onClick={() => router.push(`/profile/${user.id}`)}
              >
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user.image_url} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            )}

            {/* 커리어 */}
            <section>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">커리어</h2>
              <SettingItem
                icon={<Briefcase className="h-5 w-5" />}
                title="이직 상태"
                description={getOpenToWorkText()}
                rightElement={
                  <div className="flex items-center gap-3">
                    {(settings?.open_to_work_status === 'actively_looking' || settings?.open_to_work_status === 'open') && (
                      <Badge tone="success" className="text-xs">
                        Open to Work
                      </Badge>
                    )}
                    <Switch
                      checked={settings?.open_to_work_status === 'actively_looking' || settings?.open_to_work_status === 'open'}
                      onCheckedChange={handleOpenToWorkChange}
                      disabled={updateSettings.isPending}
                    />
                  </div>
                }
              />
              <SettingItem
                icon={<Heart className="h-5 w-5" />}
                title="관심사 설정"
                description="관심 분야 및 기술 스택"
                onClick={() => router.push('/settings/interests')}
              />
            </section>

            {/* 계정 */}
            <section>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">계정</h2>
              <SettingItem
                icon={<User className="h-5 w-5" />}
                title="계정 정보"
                description="이메일, 비밀번호 변경"
                onClick={() => router.push('/settings/account')}
              />
              <SettingItem
                icon={<Eye className="h-5 w-5" />}
                title="프로필 공개 범위"
                description={settings?.open_to_search_engine ? '검색 엔진에 공개' : '검색 엔진에 비공개'}
                rightElement={
                  <Switch
                    checked={settings?.open_to_search_engine ?? false}
                    onCheckedChange={handleProfilePublicChange}
                    disabled={updateSettings.isPending}
                  />
                }
              />
            </section>

            {/* 보안 */}
            <section>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">보안</h2>
              <SettingItem
                icon={<Lock className="h-5 w-5" />}
                title="비밀번호 변경"
                onClick={() => router.push('/settings/password')}
              />
            </section>

            {/* 계정 관리 */}
            <section>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">계정 관리</h2>
              <SettingItem
                icon={<Trash2 className="h-5 w-5" />}
                title="계정 삭제 요청"
                description="계정 및 모든 데이터 삭제"
                onClick={() => router.push('/settings/delete-account')}
                danger
              />
              <SettingItem
                icon={<LogOut className="h-5 w-5" />}
                title="로그아웃"
                onClick={logoutWithConfirm}
                danger
              />
            </section>
        </div>
      </main>
    </div>
  );
}
