'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useSignup, initiateOAuthLogin, type OAuthProvider } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn, isInApp, postMessageToApp } from '@/lib/utils';
import { trackSignupStart } from '@/lib/analytics';
import { toast } from 'sonner';

const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, '이메일을 입력해주세요.')
      .email('올바른 이메일 형식이 아닙니다.'),
    name: z.string().min(1, '이름을 입력해주세요.').min(2, '이름은 최소 2자 이상이어야 합니다.'),
    password: z
      .string()
      .min(1, '비밀번호를 입력해주세요.')
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)/,
        '비밀번호는 영문과 숫자를 포함해야 합니다.'
      ),
    password_confirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['password_confirm'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick?: () => void;
}

export function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const signup = useSignup();
  const [isOAuthLoading, setIsOAuthLoading] = React.useState(false);
  const hasTrackedOpen = React.useRef(false);

  // 모달 오픈 시 signup_start 이벤트 트래킹
  React.useEffect(() => {
    if (isOpen && !hasTrackedOpen.current) {
      trackSignupStart('email'); // 기본값, OAuth 클릭 시 별도 트래킹
      hasTrackedOpen.current = true;
    }
    if (!isOpen) {
      hasTrackedOpen.current = false;
    }
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      password_confirm: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    signup.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    // OAuth 방식 signup_start 트래킹
    trackSignupStart(provider as 'apple' | 'kakao');

    // 앱 환경이면 네이티브 로그인 요청
    if (isInApp()) {
      const messageType = provider === 'apple' ? 'apple-login' : 'kakao-login';
      postMessageToApp({ type: messageType });
      return;
    }

    // 웹 브라우저: 기존 OAuth 로그인
    try {
      setIsOAuthLoading(true);
      const response = await initiateOAuthLogin(provider);
      window.location.href = response.authUrl;
    } catch (error) {
      console.error('OAuth login failed:', error);
      setIsOAuthLoading(false);
    }
  };

  // 앱에서 네이티브 로그인 결과 수신 (postMessage 방식 - 레거시 지원)
  // 참고: window.handleNativeAppleAuth/handleNativeKakaoAuth는 NativeAuthHandler에서 전역 등록됨
  React.useEffect(() => {
    if (!isInApp()) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        switch (data.type) {
          case 'native-login-success':
            // 로그인 성공 - 페이지 새로고침
            toast.success('로그인되었습니다.');
            onClose();
            window.location.reload();
            break;

          case 'native-login-error':
            // 로그인 실패
            if (data.error !== 'cancelled') {
              toast.error(`${data.provider} 로그인에 실패했습니다.`);
            }
            break;

          case 'native-login-unsupported':
            // 네이티브 미지원 (Android 애플 로그인) → 웹 폴백
            if (data.provider === 'apple') {
              initiateOAuthLogin('apple').then((response) => {
                window.location.href = response.authUrl;
              });
            }
            break;
        }
      } catch {
        // JSON 파싱 실패 무시
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  const isLoading = isSubmitting || signup.isPending || isOAuthLoading;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed z-[100] bg-white shadow-xl overflow-y-auto',
            // 모바일: 전체화면 + 중앙 정렬
            'inset-0 rounded-none flex flex-col justify-center',
            // 데스크톱: 중앙 모달
            'md:inset-auto md:left-[50%] md:top-[50%] md:w-full md:max-w-md md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-lg md:max-h-[90vh] md:block',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95',
            'md:data-[state=closed]:slide-out-to-left-1/2 md:data-[state=closed]:slide-out-to-top-[48%]',
            'md:data-[state=open]:slide-in-from-left-1/2 md:data-[state=open]:slide-in-from-top-[48%]'
          )}
        >
          {/* Header */}
          <div className="flex flex-col items-center pt-8 pb-4 px-6">
            <Image
              src="/images/logo.svg"
              alt="Careerly"
              width={120}
              height={32}
              className="mb-4"
            />
            <Dialog.Title className="text-2xl font-bold text-slate-900">
              회원가입
            </Dialog.Title>
            <Dialog.Description className="text-sm text-slate-500 mt-1">
              새로운 계정을 만들어 Careerly를 시작하세요
            </Dialog.Description>
          </div>

          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              className="absolute right-4 safe-top-4 rounded-full p-2 hover:bg-slate-100 transition-colors md:top-4"
              aria-label="닫기"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </Dialog.Close>

          {/* Content */}
          <div className="px-6 pb-8 space-y-6 safe-mb">
            {/* OAuth 버튼 (구글 제외) */}
            <div className="space-y-3">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => handleOAuthLogin('apple')}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                애플로 시작하기
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => handleOAuthLogin('kakao')}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 0 0-.656-.678l-1.928 1.866V9.282a.472.472 0 0 0-.944 0v2.557a.471.471 0 0 0 0 .222V13.5a.472.472 0 0 0 .944 0v-1.363l.427-.413 1.428 2.033a.472.472 0 1 0 .773-.543l-1.514-2.155zm-2.958 1.924h-1.46V9.297a.472.472 0 0 0-.943 0v4.159c0 .26.211.472.471.472h1.932a.472.472 0 1 0 0-.944zm-5.857-1.092l.696-1.707.638 1.707H9.092zm2.523.488l.002-.016a.469.469 0 0 0-.127-.32l-1.046-2.8a.69.69 0 0 0-.627-.474.696.696 0 0 0-.653.447l-1.661 4.075a.472.472 0 0 0 .874.357l.33-.813h2.07l.293.801a.472.472 0 1 0 .886-.325l-.341-.932zM8.293 9.302a.472.472 0 0 0-.471-.472H5.577a.472.472 0 1 0 0 .944h.85v3.736a.472.472 0 0 0 .944 0V9.774h.85a.472.472 0 0 0 .472-.472z" />
                </svg>
                카카오로 시작하기
              </Button>
            </div>

            {/* 구분선 */}
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-sm text-slate-500">또는</span>
              </div>
            </div>

            {/* 이메일 회원가입 폼 */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">이메일</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-name">이름</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="홍길동"
                  {...register('name')}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">비밀번호</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="8자 이상 (영문, 숫자 포함)"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password-confirm">비밀번호 확인</Label>
                <Input
                  id="signup-password-confirm"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  {...register('password_confirm')}
                  disabled={isLoading}
                />
                {errors.password_confirm && (
                  <p className="text-sm text-red-500">{errors.password_confirm.message}</p>
                )}
              </div>

              <Button type="submit" variant="coral" size="md" className="w-full" disabled={isLoading}>
                {isLoading ? '가입 중...' : '회원가입'}
              </Button>
            </form>

            {/* 로그인 링크 */}
            <div className="text-center text-sm text-slate-600">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-coral-500 hover:text-coral-600 font-medium"
              >
                로그인
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
