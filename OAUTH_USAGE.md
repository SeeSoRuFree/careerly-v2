# OAuth 인증 시스템 사용 가이드

백엔드 API를 사용한 OAuth 인증 시스템이 구현되었습니다.

## 지원 OAuth 제공자

- Google
- Apple
- Kakao

## 주요 특징

- onboarding 없이 바로 가입 (추가 정보는 나중에 수집)
- 기존 이메일 회원가입과 공존
- HttpOnly 쿠키 기반 토큰 관리
- 자동 에러 처리 및 토스트 알림

## API 엔드포인트

백엔드 API는 다음과 같이 구성되어 있습니다:

- `GET /api/v1/auth/{provider}/login/` - OAuth 인증 URL 받기
- `POST /api/v1/auth/{provider}/callback/` - OAuth 콜백 처리 (code 전달)

## 사용 방법

### 1. OAuth 로그인 버튼 컴포넌트

```typescript
'use client';

import { useOAuthLogin } from '@/lib/api';
import type { OAuthProvider } from '@/lib/api';

export function OAuthLoginButtons() {
  const oauthLogin = useOAuthLogin();

  const handleOAuthLogin = (provider: OAuthProvider) => {
    oauthLogin.mutate(provider);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => handleOAuthLogin('google')}
        disabled={oauthLogin.isPending}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <GoogleIcon />
        구글로 계속하기
      </button>

      <button
        onClick={() => handleOAuthLogin('kakao')}
        disabled={oauthLogin.isPending}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] text-[#000000] rounded-lg hover:bg-[#FDD835]"
      >
        <KakaoIcon />
        카카오로 계속하기
      </button>

      <button
        onClick={() => handleOAuthLogin('apple')}
        disabled={oauthLogin.isPending}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900"
      >
        <AppleIcon />
        Apple로 계속하기
      </button>
    </div>
  );
}
```

### 2. OAuth 콜백 페이지

OAuth 제공자가 사용자를 리다이렉트하는 페이지입니다.

```typescript
// app/auth/[provider]/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOAuthCallback } from '@/lib/api';
import type { OAuthProvider } from '@/lib/api';

interface OAuthCallbackPageProps {
  params: {
    provider: OAuthProvider;
  };
}

export default function OAuthCallbackPage({ params }: OAuthCallbackPageProps) {
  const searchParams = useSearchParams();
  const oauthCallback = useOAuthCallback();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      oauthCallback.mutate({
        provider: params.provider,
        code,
        ...(state && { state }),
      });
    } else {
      // 에러 처리
      console.error('OAuth code not found');
      window.location.href = '/login';
    }
  }, [searchParams, params.provider, oauthCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
        <p className="mt-4 text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}
```

### 3. 로그인 페이지 통합 예시

```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useLogin, useOAuthLogin } from '@/lib/api';
import type { OAuthProvider } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = useLogin();
  const oauthLogin = useOAuthLogin();

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  const handleOAuthLogin = (provider: OAuthProvider) => {
    oauthLogin.mutate(provider);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-6">로그인</h1>

      {/* OAuth 로그인 */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => handleOAuthLogin('google')}
          disabled={oauthLogin.isPending}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          구글로 계속하기
        </button>

        <button
          onClick={() => handleOAuthLogin('kakao')}
          disabled={oauthLogin.isPending}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] text-[#000000] rounded-lg hover:bg-[#FDD835]"
        >
          카카오로 계속하기
        </button>

        <button
          onClick={() => handleOAuthLogin('apple')}
          disabled={oauthLogin.isPending}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900"
        >
          Apple로 계속하기
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">또는</span>
        </div>
      </div>

      {/* 이메일 로그인 */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {login.isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
```

## OAuth 플로우

1. **사용자가 OAuth 버튼 클릭**
   - `useOAuthLogin()` 훅 사용
   - `oauthLogin.mutate('google')` 호출

2. **백엔드에서 OAuth URL 받기**
   - `GET /api/v1/auth/google/login/` 호출
   - 백엔드가 OAuth 인증 URL 반환

3. **OAuth 제공자로 리다이렉트**
   - `window.location.href = authUrl`
   - 사용자가 OAuth 제공자에서 인증

4. **콜백 URL로 리턴**
   - OAuth 제공자가 `/auth/google/callback?code=xxx` 로 리다이렉트

5. **백엔드에 code 전달**
   - `useOAuthCallback()` 훅 사용
   - `POST /api/v1/auth/google/callback/` 호출
   - `{ code: 'xxx' }` 전달

6. **로그인 완료**
   - 백엔드가 토큰 및 사용자 정보 반환
   - HttpOnly 쿠키에 토큰 저장
   - 메인 페이지로 자동 리다이렉트

## 에러 처리

모든 에러는 자동으로 처리됩니다:

- 토스트 알림으로 에러 메시지 표시
- OAuth 로그인 실패 시 로그인 페이지로 리다이렉트
- 네트워크 에러, 서버 에러 모두 포함

커스텀 에러 처리가 필요한 경우:

```typescript
const oauthLogin = useOAuthLogin({
  onError: (error) => {
    // 커스텀 에러 처리
    console.error('OAuth 에러:', error);
  },
});
```

## 타입 안전성

모든 타입이 정의되어 있어 TypeScript 지원이 완벽합니다:

```typescript
import type {
  OAuthProvider,
  OAuthLoginResponse,
  OAuthCallbackRequest,
  LoginResponse,
} from '@/lib/api';

// 'google' | 'apple' | 'kakao'
const provider: OAuthProvider = 'google';
```

## 주의 사항

1. **Callback URL 설정**
   - 각 OAuth 제공자의 개발자 콘솔에서 콜백 URL 등록 필요
   - 예: `https://yourdomain.com/auth/google/callback`

2. **HTTPS 필수**
   - 프로덕션 환경에서는 HTTPS 필수
   - 로컬 개발 시에는 localhost 허용

3. **State 파라미터**
   - CSRF 방지를 위해 state 파라미터 사용 권장
   - 백엔드에서 state 검증 구현 필요

4. **토큰 관리**
   - HttpOnly 쿠키 사용으로 XSS 공격 방어
   - 자동 토큰 갱신 지원
