'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOAuthCallback, type OAuthProvider } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';

/**
 * OAuth 콜백 처리 페이지
 *
 * OAuth 인증 후 리다이렉트되는 페이지입니다.
 * URL 파라미터에서 code와 state를 추출하여 백엔드로 전송합니다.
 */
export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oauthCallback = useOAuthCallback();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleCallback = async () => {
      // URL 파라미터 추출
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const provider = searchParams.get('provider') as OAuthProvider;
      const errorParam = searchParams.get('error');

      // OAuth 인증 에러 처리
      if (errorParam) {
        setError('OAuth 인증에 실패했습니다.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      // 필수 파라미터 검증
      if (!code || !provider) {
        setError('잘못된 OAuth 콜백 요청입니다.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      // OAuth 콜백 처리
      try {
        await oauthCallback.mutateAsync({
          provider,
          code,
          ...(state && { state }),
        });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('OAuth 로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, oauthCallback, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        {error ? (
          <div>
            <p className="text-red-500 text-lg font-medium">{error}</p>
            <p className="text-slate-600 text-sm mt-2">로그인 페이지로 이동합니다...</p>
          </div>
        ) : (
          <div>
            <Spinner className="mx-auto mb-4" />
            <p className="text-slate-700 text-lg font-medium">로그인 중입니다...</p>
            <p className="text-slate-600 text-sm mt-2">잠시만 기다려주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
