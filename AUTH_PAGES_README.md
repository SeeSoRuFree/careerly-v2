# 인증 페이지 구현 완료

## 생성된 페이지

### 1. 회원가입 페이지 (`/signup`)
**파일 경로**: `/Users/goalle/vibework/careerly/careerly-v2/app/signup/page.tsx`

**기능**:
- 이메일 회원가입 폼 (이메일, 이름, 비밀번호, 비밀번호 확인)
- 소셜 로그인 버튼 (구글, 애플, 카카오)
- react-hook-form + zod로 폼 검증
- 기존 `useSignup`, `initiateOAuthLogin` 훅 사용

**폼 검증 규칙**:
- 이메일: 필수, 이메일 형식
- 이름: 필수, 최소 2자
- 비밀번호: 필수, 최소 8자, 영문 대소문자 + 숫자 포함
- 비밀번호 확인: 비밀번호와 일치

### 2. 로그인 페이지 (`/login`)
**파일 경로**: `/Users/goalle/vibework/careerly/careerly-v2/app/login/page.tsx`

**기능**:
- 이메일 로그인 폼 (이메일, 비밀번호)
- 소셜 로그인 버튼 (구글, 애플, 카카오)
- react-hook-form + zod로 폼 검증
- 기존 `useLogin`, `initiateOAuthLogin` 훅 사용

**폼 검증 규칙**:
- 이메일: 필수, 이메일 형식
- 비밀번호: 필수

### 3. OAuth 콜백 페이지 (`/auth/callback`)
**파일 경로**: `/Users/goalle/vibework/careerly/careerly-v2/app/auth/callback/page.tsx`

**기능**:
- OAuth 인증 후 리다이렉트 처리
- URL 파라미터에서 code, state, provider 추출
- `useOAuthCallback` 훅으로 백엔드 인증 처리
- 에러 발생 시 로그인 페이지로 리다이렉트

## 사용된 컴포넌트

- `Button` - 버튼 컴포넌트 (variants: outline, coral)
- `Input` - 입력 필드
- `Label` - 레이블
- `Card` - 카드 레이아웃
- `Separator` - 구분선
- `Spinner` - 로딩 스피너

## 사용된 API 훅

### Auth Mutations
- `useSignup()` - 회원가입
- `useLogin()` - 로그인
- `useOAuthCallback()` - OAuth 콜백 처리

### Auth Services
- `initiateOAuthLogin(provider)` - OAuth 인증 URL 가져오기

## 디자인 특징

- 깔끔하고 현대적인 디자인
- 반응형 레이아웃 (모바일 지원)
- 일관된 색상 체계 (Slate, Coral)
- 폼 에러 메시지 표시
- 로딩 상태 처리
- 소셜 로그인 아이콘 SVG 포함

## OAuth 플로우

1. 사용자가 소셜 로그인 버튼 클릭
2. `initiateOAuthLogin(provider)` 호출로 인증 URL 가져오기
3. 사용자를 OAuth 제공자 페이지로 리다이렉트
4. 인증 완료 후 `/auth/callback?code=...&provider=...&state=...`로 리다이렉트
5. 콜백 페이지에서 `useOAuthCallback()` 훅으로 백엔드 처리
6. 성공 시 메인 페이지로 이동, 실패 시 로그인 페이지로 이동

## 설치된 패키지

```bash
npm install @hookform/resolvers
```

## 타입 안전성

- TypeScript로 작성
- Zod 스키마로 런타임 검증
- 모든 API 타입은 `@/lib/api`에서 import

## 다음 단계

1. 비밀번호 재설정 페이지 추가 (선택 사항)
2. 이메일 인증 페이지 추가 (선택 사항)
3. OAuth 제공자별 redirect_uri 설정 확인
4. 실제 OAuth 앱 등록 및 클라이언트 ID 설정
