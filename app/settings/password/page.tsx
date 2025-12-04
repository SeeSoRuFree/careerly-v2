'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChangePassword } from '@/lib/api';
import { cn } from '@/lib/utils';

const passwordSchema = z
  .object({
    current_password: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
    new_password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .regex(
        /^(?=.*[a-zA-Z])(?=.*[0-9])|(?=.*[a-zA-Z])(?=.*[!@#$%^&*])|(?=.*[0-9])(?=.*[!@#$%^&*])/,
        '영문, 숫자, 특수문자 중 2가지 이상을 조합해주세요.'
      ),
    new_password_confirm: z.string().min(1, '새 비밀번호를 다시 입력해주세요.'),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: '새 비밀번호가 일치하지 않습니다.',
    path: ['new_password_confirm'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function PasswordSettingsPage() {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: PasswordForm) => {
    changePassword.mutate(data);
  };

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
            <span className="font-semibold text-slate-900">비밀번호 변경</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              비밀번호를 변경합니다.
            </h2>
            <p className="text-sm text-slate-600">
              보안을 위해 현재 비밀번호를 먼저 입력해주세요.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current_password" className="text-slate-700">
                현재 비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="현재 비밀번호를 입력하세요"
                  className={cn(
                    'pr-10',
                    errors.current_password && 'border-red-500 focus-visible:ring-red-500'
                  )}
                  {...register('current_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-sm text-red-600">{errors.current_password.message}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new_password" className="text-slate-700">
                새 비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="새 비밀번호를 입력하세요"
                  className={cn(
                    'pr-10',
                    errors.new_password && 'border-red-500 focus-visible:ring-red-500'
                  )}
                  {...register('new_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.new_password ? (
                <p className="text-sm text-red-600">{errors.new_password.message}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  8자 이상, 영문/숫자/특수문자 중 2가지 이상 조합
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="new_password_confirm" className="text-slate-700">
                새 비밀번호 확인
              </Label>
              <div className="relative">
                <Input
                  id="new_password_confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  className={cn(
                    'pr-10',
                    errors.new_password_confirm && 'border-red-500 focus-visible:ring-red-500'
                  )}
                  {...register('new_password_confirm')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.new_password_confirm && (
                <p className="text-sm text-red-600">{errors.new_password_confirm.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="solid"
                className="w-full"
                disabled={!isValid || !isDirty || changePassword.isPending}
              >
                {changePassword.isPending ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
