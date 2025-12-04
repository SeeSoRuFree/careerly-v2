'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Mail, Phone, Lock } from 'lucide-react';
import { useCurrentUser } from '@/lib/api/hooks/queries/useUser';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
  disabledText?: string;
}

function SettingItem({ icon, title, description, onClick, disabled, disabledText }: SettingItemProps) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        'flex items-center gap-4 py-4 border-b border-slate-100 last:border-b-0',
        onClick && !disabled && 'cursor-pointer hover:bg-slate-50 -mx-4 px-4 rounded-lg transition-colors',
        disabled && 'opacity-60 cursor-not-allowed',
      )}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900">{title}</p>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        )}
        {disabled && disabledText && (
          <p className="text-xs text-slate-400 mt-1">{disabledText}</p>
        )}
      </div>
      {onClick && !disabled && <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />}
    </div>
  );
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  // Determine if user is social login
  // Note: API may need to add social_login_type field to User type
  const isSocialLogin = false; // TODO: Update when API provides social_login_type
  const socialProvider: 'kakao' | 'apple' | 'google' | null = null; // TODO: Update when API provides social_login_type

  // Mask phone number
  const maskedPhone = user?.phone
    ? user.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3')
    : '미등록';

  const handlePasswordClick = () => {
    router.push('/settings/password');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="w-full bg-slate-50 sticky top-0 z-50 pt-4 pb-2">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="-ml-2 hover:bg-slate-200"
            >
              <ChevronLeft className="h-6 w-6 text-slate-900" />
            </Button>
            <span className="font-semibold text-slate-900">계정 정보</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-10">
          {/* 가입 정보 섹션 (소셜 로그인 사용자만) */}
          {isSocialLogin && (
            <section>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
                가입 정보
              </h2>
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <p className="text-slate-900 font-medium mb-1">{user?.email}</p>
                <p className="text-sm text-slate-500">
                  {socialProvider === 'kakao' && '카카오 계정으로 가입하셨습니다.'}
                  {socialProvider === 'apple' && 'Apple 계정으로 가입하셨습니다.'}
                  {socialProvider === 'google' && 'Google 계정으로 가입하셨습니다.'}
                </p>
              </div>
            </section>
          )}

          {/* 계정 섹션 */}
          <section>
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
              계정
            </h2>
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6">
                <SettingItem
                  icon={<Mail className="h-5 w-5" />}
                  title="이메일"
                  description={user?.email || '-'}
                />

                <SettingItem
                  icon={<Phone className="h-5 w-5" />}
                  title="전화번호"
                  description={maskedPhone}
                />

                <SettingItem
                  icon={<Lock className="h-5 w-5" />}
                  title="비밀번호 변경"
                  onClick={handlePasswordClick}
                  disabled={isSocialLogin}
                  disabledText={isSocialLogin ? '소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.' : undefined}
                />
              </div>
            </div>

            {/* 소셜 로그인 안내 메시지 */}
            {isSocialLogin && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600">
                  소셜 로그인 계정은 이메일과 비밀번호를 직접 변경할 수 없습니다.
                  소셜 로그인 제공업체에서 관리하는 정보입니다.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
