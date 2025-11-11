# Careerly v2 - Development Guide

## 📁 API 클라이언트 디렉토리 구조

```
lib/api/
├── clients/          # REST, GraphQL, SSE 클라이언트
├── services/         # API 서비스 함수 (auth, search, user, discover)
├── hooks/            # React Query 훅
│   ├── queries/      # 데이터 조회
│   └── mutations/    # 데이터 변경
├── auth/             # 토큰 관리 (server/client)
├── types/            # 타입 정의
├── interceptors/     # 에러 처리, 재시도
└── index.ts          # 통합 export
```

## 🔑 API 클라이언트 사용 필수

**모든 API 호출은 반드시 `lib/api`의 클라이언트를 사용해야 합니다.**

```typescript
// ✅ Good - React Query 훅 사용
import { useSearch, useLogin } from '@/lib/api';
const { data } = useSearch(query);

// ✅ Good - 서비스 함수 직접 사용
import { searchCareer } from '@/lib/api';
const result = await searchCareer(query);

// ❌ Bad - 직접 fetch/axios 사용 금지
const res = await fetch('/api/search'); // Don't do this!
```

### 이유
- 자동 인증 토큰 주입
- 401 에러 시 자동 토큰 갱신
- 전역 에러 처리 및 토스트 알림
- React Query 캐싱 및 최적화
- 타입 안정성 보장

## 🔐 인증

### HttpOnly Cookie 기반 인증
- 토큰은 httpOnly 쿠키에 저장 (XSS 방어)
- 401 에러 시 자동으로 토큰 갱신 시도
- 갱신 실패 시 자동으로 `/login`으로 리다이렉트

### 사용법

```typescript
// 로그인
import { useLogin } from '@/lib/api';
const login = useLogin();
login.mutate({ email, password });

// 로그아웃
import { useLogout } from '@/lib/api';
const logout = useLogout();
logout.mutate();

// 현재 사용자 정보
import { useCurrentUser } from '@/lib/api';
const { data: user } = useCurrentUser();
```

## ⚠️ 전역 에러 처리

### 자동 처리
- 모든 API 에러는 자동으로 토스트 알림 표시
- 네트워크 에러, 서버 에러 모두 포함
- 개발 환경에서는 콘솔에 상세 로그

### 토스트 비활성화 (필요 시)

```typescript
const { data } = useSearch(query, {
  meta: { showToast: false }, // 토스트 표시 안함
});

// 또는 서비스 함수 사용 시
try {
  await searchCareer(query);
} catch (error) {
  // 커스텀 에러 처리
  handleApiError(error, { showToast: false });
}
```

### 컴포넌트 레벨 에러 처리

```typescript
const { data, error } = useSearch(query);

if (error) {
  return <ErrorComponent error={error} />;
}
```

## 📝 환경 변수

`.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=https://staging-gateway.careerly.co.kr
NEXT_PUBLIC_GRAPH_API_HOST=https://graph-staging.careerly.co.kr/graphql
```

## 🚫 금지 사항

1. ❌ `fetch`, `axios` 직접 사용 금지
2. ❌ 인증 토큰 수동 관리 금지
3. ❌ API 에러 개별 처리 지양 (전역 처리 활용)
4. ❌ `lib/api` 외부에서 API 클라이언트 생성 금지

## ✅ 권장 사항

1. ✅ React Query 훅 사용 (캐싱, 자동 재시도)
2. ✅ 타입 import 시 `@/lib/api`에서 가져오기
3. ✅ SSE 사용 시 `withAuth: true` 옵션 활용
4. ✅ 상세 문서는 `lib/api/README.md` 참조
