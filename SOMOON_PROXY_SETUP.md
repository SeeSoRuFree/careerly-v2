# Somoon API CORS 해결 - Next.js 프록시 설정

## 변경 사항 요약

### 1. Next.js 프록시 설정 추가
**파일**: `/Users/goalle/vibework/careerly/careerly-v2/next.config.mjs`

`rewrites()` 함수 추가:
```javascript
async rewrites() {
  return [
    {
      source: '/api/somoon/:path*',
      destination: 'https://somoon.ai/api/:path*',
    },
  ];
}
```

**동작 방식**:
- 브라우저 → `http://localhost:3001/api/somoon/v1/contents/daily/`
- Next.js 서버 → `https://somoon.ai/api/v1/contents/daily/` (프록시)
- CORS 우회 (same-origin 요청)

### 2. API Config 기본값 변경
**파일**: `/Users/goalle/vibework/careerly/careerly-v2/lib/api/config.ts`

```typescript
// Before
SOMOON_API_URL: process.env.NEXT_PUBLIC_SOMOON_API_URL || 'https://somoon.ai',

// After  
SOMOON_API_URL: process.env.NEXT_PUBLIC_SOMOON_API_URL || '/api/somoon',
```

### 3. Somoon 클라이언트 주석 업데이트
**파일**: `/Users/goalle/vibework/careerly/careerly-v2/lib/api/clients/somoon-client.ts`

주석을 업데이트하여 프록시 사용을 명시:
```typescript
/**
 * Somoon API 클라이언트
 * - Base URL: /api/somoon (Next.js proxy to https://somoon.ai)
 * - CSRF 토큰 자동 주입
 */
```

## 영향받는 서비스

### Contents Service
**파일**: `/Users/goalle/vibework/careerly/careerly-v2/lib/api/services/contents.service.ts`

- `getDailyContents()` 함수가 somoonClient 사용
- 엔드포인트: `/api/v1/contents/daily/`
- 프록시 후 실제 요청: `https://somoon.ai/api/v1/contents/daily/`

## 환경 변수 (선택사항)

`.env.local`에 프로덕션용 설정을 추가할 수 있습니다:

```bash
# 개발 환경: 로컬 프록시 사용 (기본값)
# NEXT_PUBLIC_SOMOON_API_URL=/api/somoon

# 프로덕션: 직접 호출 또는 다른 프록시 사용
# NEXT_PUBLIC_SOMOON_API_URL=https://your-proxy.com/somoon
```

## 테스트 방법

1. 개발 서버 재시작:
   ```bash
   cd /Users/goalle/vibework/careerly/careerly-v2
   npm run dev
   ```

2. Discover 페이지 접속:
   ```
   http://localhost:3001/discover
   ```

3. 브라우저 개발자 도구 → Network 탭 확인:
   - Request URL: `http://localhost:3001/api/somoon/v1/contents/daily/`
   - Status: `200 OK`
   - CORS 에러 없음

## 주의사항

1. **X-CSRFToken 헤더**: 프록시를 통해 그대로 전달됨
2. **개발 서버 재시작**: 환경 변수나 next.config.mjs 변경 시 필수
3. **서버 사이드 전용**: rewrites는 서버 사이드에서만 동작
4. **CSRF 토큰**: 환경 변수 `NEXT_PUBLIC_SOMOON_CSRF_TOKEN` 필요 시 설정

## 문제 해결

### CORS 에러가 여전히 발생하는 경우

1. 개발 서버 재시작 확인
2. 브라우저 캐시 클리어
3. Network 탭에서 Request URL이 `/api/somoon/...`인지 확인
4. 환경 변수 `NEXT_PUBLIC_SOMOON_API_URL` 미설정 확인

### 404 에러 발생 시

1. rewrites 설정 확인
2. 엔드포인트 경로 확인 (`/api/v1/...` 형태)
3. Somoon API 서버 상태 확인

## 참고 자료

- [Next.js Rewrites 문서](https://nextjs.org/docs/api-reference/next.config.js/rewrites)
- Somoon API 클라이언트: `/Users/goalle/vibework/careerly/careerly-v2/lib/api/clients/somoon-client.ts`
- Contents 서비스: `/Users/goalle/vibework/careerly/careerly-v2/lib/api/services/contents.service.ts`
