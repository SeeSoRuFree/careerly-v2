# Careerly v2 API Client

통합 API 클라이언트 라이브러리

## 📋 목차

- [개요](#개요)
- [구조](#구조)
- [시작하기](#시작하기)
- [사용 예시](#사용-예시)
- [API 문서](#api-문서)

## 개요

Careerly v2의 API 클라이언트는 RESTful API와 GraphQL API를 모두 지원하며, React Query와 통합되어 강력한 데이터 페칭 및 캐싱 기능을 제공합니다.

### 주요 기능

- ✅ RESTful & GraphQL 통합 지원
- ✅ HttpOnly Cookie 기반 인증
- ✅ 자동 토큰 갱신 (401 에러 시)
- ✅ React Query 통합 (캐싱, 재시도 등)
- ✅ TypeScript 완전 지원
- ✅ 전역 에러 처리 및 토스트 알림
- ✅ SSE (Server-Sent Events) 지원
- ✅ 자동 재시도 및 로깅

## 구조

```
lib/api/
├── clients/              # HTTP, GraphQL, SSE 클라이언트
├── services/             # API 서비스 레이어
├── hooks/                # React Query 훅
│   ├── queries/          # 데이터 조회 훅
│   └── mutations/        # 데이터 변경 훅
├── auth/                 # 인증 관련 유틸리티
├── types/                # 타입 정의
├── interceptors/         # 에러 처리, 재시도 등
├── config.ts             # API 설정
└── index.ts              # 공개 API Export
```

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
NEXT_PUBLIC_API_BASE_URL=https://staging-gateway.careerly.co.kr
NEXT_PUBLIC_GRAPH_API_HOST=https://graph-staging.careerly.co.kr/graphql
NEXT_PUBLIC_API_TIMEOUT=10000
AUTH_SECRET=your-secret-key
```

### 2. 패키지 설치

필요한 패키지는 이미 설치되어 있습니다:

- `axios` - HTTP 클라이언트
- `graphql` & `graphql-request` - GraphQL 클라이언트
- `@tanstack/react-query` - 데이터 페칭 및 캐싱
- `zod` - 런타임 타입 검증
- `sonner` - 토스트 알림

## 사용 예시

### RESTful API 사용

#### 1. React Query 훅 사용 (권장)

```typescript
'use client';

import { useSearch } from '@/lib/api';

function SearchPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, error } = useSearch(query);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return <div>{data?.answer}</div>;
}
```

#### 2. 서비스 직접 호출

```typescript
import { searchCareer } from '@/lib/api';

async function handleSearch(query: string) {
  try {
    const result = await searchCareer(query);
    console.log(result);
  } catch (error) {
    console.error('검색 실패:', error);
  }
}
```

### GraphQL API 사용

```typescript
import { useGraphQL } from '@/lib/api';

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading } = useGraphQL(
    ['user', userId],
    `
      query GetUser($userId: String!) {
        user(id: $userId) {
          id
          name
          email
        }
      }
    `,
    { userId }
  );

  return <div>{data?.user.name}</div>;
}
```

### 인증

#### 로그인

```typescript
import { useLogin } from '@/lib/api';

function LoginForm() {
  const login = useLogin();

  const handleSubmit = (email: string, password: string) => {
    login.mutate({ email, password });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### 로그아웃

```typescript
import { useLogout } from '@/lib/api';

function LogoutButton() {
  const logout = useLogout();

  return (
    <button onClick={() => logout.mutate()}>
      로그아웃
    </button>
  );
}
```

#### 현재 사용자 정보

```typescript
import { useCurrentUser } from '@/lib/api';

function UserMenu() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <div>로딩 중...</div>;
  if (!user) return <div>로그인이 필요합니다.</div>;

  return <div>{user.name}</div>;
}
```

### SSE (Server-Sent Events)

```typescript
import { useSSE } from '@/hooks/useSSE';

function StreamingSearch() {
  const { isConnected, messages } = useSSE({
    url: '/api/search/stream',
    enabled: true,
    withAuth: true, // 인증 토큰 포함
    onMessage: (message) => {
      console.log('New message:', message);
    },
    onComplete: () => {
      console.log('Stream completed');
    },
  });

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>{msg.content}</div>
      ))}
    </div>
  );
}
```

### 에러 처리

#### 전역 에러 처리 (자동)

기본적으로 모든 API 에러는 자동으로 토스트 알림으로 표시됩니다.

#### 컴포넌트 레벨 에러 처리

```typescript
import { useSearch } from '@/lib/api';

function SearchPage() {
  const { data, error } = useSearch(query, {
    // 토스트 알림 비활성화
    meta: { showToast: false },
  });

  if (error) {
    // 커스텀 에러 처리
    return <ErrorComponent error={error} />;
  }

  return <Results data={data} />;
}
```

### Mutation 사용

```typescript
import { useUpdateProfile, useUploadAvatar } from '@/lib/api';

function ProfileSettings() {
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const handleUpdate = (data: Partial<User>) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        console.log('프로필 업데이트 성공');
      },
    });
  };

  const handleFileUpload = (file: File) => {
    uploadAvatar.mutate(file);
  };

  return (
    <form>
      <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
      <button onClick={() => handleUpdate({ name: 'New Name' })}>
        저장
      </button>
    </form>
  );
}
```

## API 문서

### 주요 훅

#### 검색

- `useSearch(query)` - 검색 수행
- `useSearchGraphQL(query)` - GraphQL 검색
- `useTrendingKeywords()` - 트렌딩 키워드
- `useSearchHistory()` - 검색 기록
- `useSearchAutocomplete(query)` - 자동완성

#### 사용자

- `useCurrentUser()` - 현재 사용자
- `useUserProfile(userId)` - 사용자 프로필
- `useUpdateProfile()` - 프로필 업데이트
- `useFollowUser()` - 팔로우
- `useUnfollowUser()` - 언팔로우

#### 발견 (Discover)

- `useDiscoverFeeds()` - 피드 목록
- `useDiscoverFeed(feedId)` - 피드 상세
- `useTrendingFeeds()` - 인기 피드
- `useBookmarkedFeeds()` - 북마크한 피드
- `useLikeFeed()` - 좋아요
- `useBookmarkFeed()` - 북마크

#### 인증

- `useLogin()` - 로그인
- `useLogout()` - 로그아웃
- `useSignup()` - 회원가입

### 서비스 함수

모든 훅에는 대응하는 서비스 함수가 있습니다:

```typescript
import {
  searchCareer,
  getUserProfile,
  getDiscoverFeeds,
  login,
  // ... 등등
} from '@/lib/api';
```

### 타입

```typescript
import type {
  User,
  SearchResult,
  DiscoverFeed,
  ApiError,
  // ... 등등
} from '@/lib/api';
```

## 환경 설정

### 개발 환경

개발 환경에서는 다음 기능이 자동으로 활성화됩니다:

- API 요청/응답 로깅
- 에러 상세 정보 출력
- API 설정 검증

### 프로덕션 환경

프로덕션 환경에서는:

- HTTPS 강제
- Secure Cookie 사용
- 로깅 비활성화

## 문제 해결

### 401 Unauthorized 에러

토큰이 만료되면 자동으로 갱신을 시도합니다. 갱신이 실패하면 로그인 페이지로 리다이렉트됩니다.

### CORS 에러

`next.config.mjs`에서 API 도메인을 허용 목록에 추가하세요.

### 타입 에러

타입이 맞지 않으면 `lib/api/types/` 디렉토리의 타입 정의를 확인하세요.

## 기여

새로운 API 엔드포인트를 추가하려면:

1. `lib/api/services/` 에 서비스 함수 추가
2. `lib/api/hooks/` 에 React Query 훅 추가
3. `lib/api/types/` 에 타입 정의 추가
4. `lib/api/index.ts` 에서 export

## 라이선스

MIT
