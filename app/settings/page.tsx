'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Bell, Lock, Heart, Briefcase, Eye, LogOut, ChevronRight } from 'lucide-react';
import { useCurrentUser } from '@/lib/api/hooks/queries/useUser';
import { useLogout } from '@/lib/api/hooks/mutations/useAuthMutations';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
}

function SettingItem({ icon, title, description, onClick, rightElement, className }: SettingItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900">{title}</p>
        {description && (
          <p className="text-sm text-slate-500 truncate">{description}</p>
        )}
      </div>
      {rightElement || (onClick && <ChevronRight className="h-5 w-5 text-slate-400" />)}
    </div>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-slate-500 px-4">{title}</h2>
      <Card className="divide-y divide-slate-100">
        {children}
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { logoutWithConfirm } = useLogout();

  // 이직 상태 토글
  const [openToWork, setOpenToWork] = React.useState(false);
  // 프로필 공개 토글
  const [profilePublic, setProfilePublic] = React.useState(true);
  // 알림 설정
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [emailEnabled, setEmailEnabled] = React.useState(true);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">설정</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 프로필 섹션 */}
        {user && (
          <Card className="p-4">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => router.push(`/profile/${user.id}`)}
            >
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.image_url} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
          </Card>
        )}

        {/* 이직 상태 */}
        <SettingSection title="커리어">
          <SettingItem
            icon={<Briefcase className="h-5 w-5" />}
            title="이직 상태"
            description={openToWork ? '적극적으로 구직 중' : '이직 의향 없음'}
            rightElement={
              <div className="flex items-center gap-2">
                {openToWork && (
                  <Badge tone="success" className="text-xs">
                    Open to Work
                  </Badge>
                )}
                <Switch
                  checked={openToWork}
                  onCheckedChange={setOpenToWork}
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
        </SettingSection>

        {/* 계정 설정 */}
        <SettingSection title="계정">
          <SettingItem
            icon={<User className="h-5 w-5" />}
            title="계정 정보"
            description="이메일, 비밀번호 변경"
            onClick={() => router.push('/settings/account')}
          />
          <SettingItem
            icon={<Eye className="h-5 w-5" />}
            title="프로필 공개 범위"
            description={profilePublic ? '전체 공개' : '팔로워만'}
            rightElement={
              <Switch
                checked={profilePublic}
                onCheckedChange={setProfilePublic}
              />
            }
          />
        </SettingSection>

        {/* 알림 설정 */}
        <SettingSection title="알림">
          <SettingItem
            icon={<Bell className="h-5 w-5" />}
            title="푸시 알림"
            description="새 댓글, 좋아요, 팔로우 알림"
            rightElement={
              <Switch
                checked={pushEnabled}
                onCheckedChange={setPushEnabled}
              />
            }
          />
          <SettingItem
            icon={<Bell className="h-5 w-5" />}
            title="이메일 알림"
            description="주간 뉴스레터, 추천 콘텐츠"
            rightElement={
              <Switch
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            }
          />
        </SettingSection>

        {/* 보안 */}
        <SettingSection title="보안">
          <SettingItem
            icon={<Lock className="h-5 w-5" />}
            title="비밀번호 변경"
            onClick={() => router.push('/settings/password')}
          />
        </SettingSection>

        {/* 로그아웃 */}
        <Card>
          <SettingItem
            icon={<LogOut className="h-5 w-5 text-red-500" />}
            title="로그아웃"
            onClick={logoutWithConfirm}
            className="text-red-500"
          />
        </Card>

        {/* 앱 정보 */}
        <div className="text-center text-xs text-slate-400 pt-4">
          <p>Careerly v2.0.0</p>
          <p className="mt-1">© 2025 Careerly. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
