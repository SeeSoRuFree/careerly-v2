# Backend Cookie Authentication - 배포 가이드

## 작업 배경

기존에는 Next.js 프론트엔드 서버에서 httpOnly 쿠키를 관리했습니다. 하지만 프로덕션 환경에서 프론트엔드(`app.careerly.co.kr`)와 백엔드(`v2.careerly.co.kr`)가 서로 다른 서브도메인을 사용하게 되면서, **크로스 도메인 쿠키 공유**를 위해 백엔드에서 직접 쿠키를 설정하도록 변경했습니다.

### 변경 전
```
Browser → Next.js Server (쿠키 설정) → Django Backend
```

### 변경 후
```
Browser → Django Backend (쿠키 설정)
         ↑
         credentials: 'include'로 직접 호출
```

## 백엔드 변경사항

### 1. 새로운 미들웨어 추가
- **파일**: `core/middleware/cookie_auth.py`
- **역할**: 쿠키의 `accessToken`을 읽어서 `Authorization: Bearer <token>` 헤더로 변환
- **위치**: MIDDLEWARE에서 CorsMiddleware 다음, AuthenticationMiddleware 이전

### 2. 로그인/로그아웃 응답에 쿠키 설정
- **파일**: `api/views/auth.py`
- **함수**: `set_auth_cookies()` - 로그인/토큰갱신 시 쿠키 설정
- **엔드포인트**:
  - `POST /api/v1/auth/login/` - 쿠키와 함께 토큰 반환
  - `POST /api/v1/auth/logout/` - 쿠키 삭제
  - `POST /api/v1/auth/refresh/` - 쿠키 갱신

---

## 배포 환경변수

### 필수 추가 항목

```bash
# 쿠키 도메인 - 프론트/백엔드 서브도메인 공유
# 앞에 점(.)을 붙여야 모든 서브도메인에서 쿠키 접근 가능
COOKIE_DOMAIN=.careerly.co.kr

# HTTPS 환경에서는 반드시 true
COOKIE_SECURE=true

# 크로스사이트 요청 허용 (프론트/백엔드 도메인이 다를 경우 필수)
# SameSite=None은 Secure=true와 함께 사용해야 함
COOKIE_SAMESITE=none
```

### CORS 설정 확인

```bash
# 프론트엔드 도메인을 CORS 허용 목록에 추가
CORS_ALLOWED_ORIGINS=https://dev.careerly.co.kr
```

---

## 환경별 설정 예시

### 로컬 개발 환경
```bash
COOKIE_DOMAIN=
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 스테이징/프로덕션 환경
```bash
COOKIE_DOMAIN=.careerly.co.kr
COOKIE_SECURE=true
COOKIE_SAMESITE=none
CORS_ALLOWED_ORIGINS=https://dev.careerly.co.kr
```

---

## 설정 위치

| 설정 | 파일 위치 |
|------|----------|
| 쿠키 설정 | `config/settings/base.py` (299-307 라인) |
| 미들웨어 | `core/middleware/cookie_auth.py` |
| 로그인/로그아웃 | `api/views/auth.py` |

---

## 주의사항

1. **도메인 일치**: 프론트엔드(`dev.careerly.co.kr`)와 백엔드(`v2.careerly.co.kr`)는 같은 루트 도메인의 서브도메인이므로 `.careerly.co.kr` 쿠키 공유 가능
2. **HTTPS 필수**: `SameSite=None`은 반드시 `Secure=true`와 함께 사용
3. **CORS 설정**: `credentials: 'include'` 요청을 받으려면 CORS에서 해당 도메인 허용 필요

---

## 테스트 방법

```bash
# 1. 로그인 - 쿠키가 Set-Cookie 헤더에 포함되는지 확인
curl -X POST https://v2.careerly.co.kr/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' \
  -c cookies.txt -v

# 2. 인증 확인 - 쿠키만으로 인증되는지 확인
curl https://v2.careerly.co.kr/api/v1/users/me/ \
  -b cookies.txt

# 3. 로그아웃 - 쿠키가 삭제되는지 확인
curl -X POST https://v2.careerly.co.kr/api/v1/auth/logout/ \
  -b cookies.txt -c cookies.txt -v
```
