# E2E Testing Guide

Careerly 프론트엔드 E2E 테스트 가이드입니다.

## Quick Start

```bash
# 1. Playwright 브라우저 설치 (최초 1회)
npx playwright install chromium

# 2. 테스트 실행
pnpm test:e2e
```

## 테스트 실행 명령어

```bash
# 전체 테스트 실행
pnpm test:e2e

# 브라우저 보면서 실행
pnpm test:e2e:headed

# UI 모드 (디버깅에 유용)
pnpm test:e2e:ui

# 디버그 모드 (breakpoint 지원)
pnpm test:e2e:debug

# 리포트 보기
pnpm test:e2e:report

# 특정 파일만 실행
pnpm test:e2e e2e/auth.spec.ts

# 특정 테스트 이름 패턴
pnpm test:e2e -g "should login"
```

## 테스트 구조

```
e2e/
├── auth.spec.ts          # 인증 플로우 테스트
├── community.spec.ts     # 커뮤니티 페이지 테스트
├── api-health.spec.ts    # API 헬스체크
├── fixtures/
│   └── test-data.ts      # 테스트 데이터
└── reports/
    └── template.html     # 리포트 템플릿
```

## 테스트 항목

### 1. 인증 플로우 (`auth.spec.ts`)

| 테스트 | 설명 |
|--------|------|
| 로그인 모달 열기 | 로그인 버튼 클릭 시 모달 표시 확인 |
| 로그인 성공 | 올바른 자격증명으로 로그인 |
| 로그인 실패 | 잘못된 자격증명 시 에러 처리 |
| 회원가입 폼 | 회원가입 폼 필드 표시 확인 |
| 로그아웃 | 로그아웃 후 로그인 버튼 재표시 |

### 2. 커뮤니티 페이지 (`community.spec.ts`)

| 테스트 | 설명 |
|--------|------|
| 페이지 로드 | `/community` URL 접근 확인 |
| 피드 카드 표시 | 게시물 목록 렌더링 확인 |
| 탭 필터 | Posts/Questions 탭 전환 |
| 무한 스크롤 | 스크롤 시 추가 로드 |
| 상세 Drawer | 게시물 클릭 시 상세 열기 |
| API 응답 | Posts API 정상 호출 확인 |

### 3. API 헬스체크 (`api-health.spec.ts`)

| 테스트 | 설명 |
|--------|------|
| Posts API | `GET /api/v1/posts/` 응답 확인 |
| Questions API | `GET /api/v1/questions/` 응답 확인 |
| Auth API | 인증 API 동작 확인 |
| Console Errors | 페이지 로드 시 콘솔 에러 없음 확인 |

## 테스트 데이터

`e2e/fixtures/test-data.ts`에서 테스트용 계정 정보 관리:

```typescript
export const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
};

export const newUser = {
  email: `newuser_${Date.now()}@test.com`,
  name: '테스트유저',
  password: 'Test1234!',
};
```

## 환경 설정

### 로컬 개발

```bash
# 1. 프론트엔드 서버 실행
pnpm dev

# 2. 백엔드 서버 실행 (별도 터미널)
# Django 서버가 localhost:8000에서 실행 중이어야 함

# 3. 테스트 실행
pnpm test:e2e
```

### CI 환경

`playwright.config.ts`에서 자동으로 서버 시작:

```typescript
webServer: {
  command: 'pnpm dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
}
```

## 디버깅

### 실패한 테스트 디버깅

```bash
# 디버그 모드
pnpm test:e2e:debug

# 특정 테스트만 디버그
pnpm test:e2e --debug e2e/auth.spec.ts
```

### 스크린샷 & 비디오

실패한 테스트는 자동으로 스크린샷과 비디오 저장:

```
test-results/
└── {test-name}-chromium/
    ├── test-failed-1.png
    └── video.webm
```

### Trace Viewer

```bash
npx playwright show-trace test-results/{test-name}/trace.zip
```

## 새 테스트 추가

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/my-page');
    await page.waitForLoadState('networkidle');

    // 요소 찾기
    const button = page.locator('button', { hasText: '클릭' });
    await button.click();

    // 검증
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

## MCP 방식 테스트 (대안)

Claude Code에서 Chrome DevTools MCP를 사용한 탐색적 테스트도 가능:

```bash
# Claude Code에서 슬래시 커맨드 실행
/e2e-test
```

### Playwright vs MCP 비교

| | Playwright | MCP 방식 |
|---|------------|----------|
| 용도 | 반복적인 회귀 테스트 | 탐색적 테스트 |
| 속도 | 빠름 | 느림 |
| CI/CD | 연동 가능 | 불가 |
| 유연성 | 낮음 (셀렉터 고정) | 높음 (AI 판단) |
| 추천 | 안정화된 기능 | 새 기능 검증 |

## 문제 해결

### Playwright 브라우저 설치 오류

```bash
npx playwright install chromium --with-deps
```

### 타임아웃 에러

`playwright.config.ts`에서 조정:

```typescript
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

### 셀렉터 찾기

```bash
# Codegen으로 셀렉터 자동 생성
npx playwright codegen http://localhost:3000
```
