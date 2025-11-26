# Backend OAuth API 구현 가이드

> Django + DRF 환경에서 Google, Kakao, Apple OAuth 2.0 인증 구현 가이드

## 목차

1. [OAuth 2.0 인증 플로우](#oauth-20-인증-플로우)
2. [API 엔드포인트 스펙](#api-엔드포인트-스펙)
3. [Django 구현](#django-구현)
4. [환경 변수 설정](#환경-변수-설정)
5. [프론트엔드 연동](#프론트엔드-연동)
6. [보안 고려사항](#보안-고려사항)
7. [테스트](#테스트)

---

## OAuth 2.0 인증 플로우

### 전체 흐름도

```
┌─────────────┐          ┌─────────────┐          ┌──────────────┐
│             │          │             │          │              │
│  Frontend   │          │   Backend   │          │  OAuth       │
│  (Next.js)  │          │  (Django)   │          │  Provider    │
│             │          │             │          │  (G/K/A)     │
└──────┬──────┘          └──────┬──────┘          └──────┬───────┘
       │                        │                        │
       │ 1. GET /auth/{provider}/login/                  │
       │ ─────────────────────>│                        │
       │                        │                        │
       │ 2. {auth_url, state}   │                        │
       │ <─────────────────────│                        │
       │                        │                        │
       │ 3. Redirect to auth_url                        │
       │ ──────────────────────────────────────────────>│
       │                        │                        │
       │                        │  4. User Login & Consent
       │                        │                        │
       │ 5. Redirect with code  │                        │
       │ <──────────────────────────────────────────────│
       │                        │                        │
       │ 6. POST /auth/{provider}/callback/             │
       │    {code, state}       │                        │
       │ ─────────────────────>│                        │
       │                        │ 7. Exchange code       │
       │                        │ ─────────────────────>│
       │                        │                        │
       │                        │ 8. Access token        │
       │                        │ <─────────────────────│
       │                        │                        │
       │                        │ 9. Get user info       │
       │                        │ ─────────────────────>│
       │                        │                        │
       │                        │ 10. User data          │
       │                        │ <─────────────────────│
       │                        │                        │
       │ 11. {user, tokens}     │                        │
       │    (JWT access/refresh)│                        │
       │ <─────────────────────│                        │
       │                        │                        │
```

### 단계별 설명

1. **OAuth URL 요청**: 프론트엔드가 백엔드에 OAuth URL 요청
2. **OAuth URL 반환**: 백엔드가 provider별 OAuth URL과 state 값 생성하여 반환
3. **OAuth 페이지로 리다이렉트**: 프론트엔드가 사용자를 OAuth provider 로그인 페이지로 리다이렉트
4. **사용자 인증**: 사용자가 OAuth provider에서 로그인 및 동의
5. **Authorization Code 반환**: OAuth provider가 authorization code와 함께 콜백 URL로 리다이렉트
6. **콜백 요청**: 프론트엔드가 받은 code와 state를 백엔드로 전송
7. **토큰 교환**: 백엔드가 authorization code를 access token으로 교환
8. **Access Token 수신**: OAuth provider로부터 access token 수신
9. **사용자 정보 요청**: Access token으로 사용자 정보 요청
10. **사용자 정보 수신**: OAuth provider로부터 사용자 정보 수신
11. **JWT 토큰 발급**: 백엔드가 자체 JWT 토큰(access, refresh) 발급하여 반환

### Provider별 특징

#### Google OAuth 2.0
- **Authorization Endpoint**: `https://accounts.google.com/o/oauth2/v2/auth`
- **Token Endpoint**: `https://oauth2.googleapis.com/token`
- **User Info Endpoint**: `https://www.googleapis.com/oauth2/v2/userinfo`
- **Scope**: `openid email profile`
- **User Info 필드**: `id`, `email`, `name`, `picture`

#### Kakao OAuth 2.0
- **Authorization Endpoint**: `https://kauth.kakao.com/oauth/authorize`
- **Token Endpoint**: `https://kauth.kakao.com/oauth/token`
- **User Info Endpoint**: `https://kapi.kakao.com/v2/user/me`
- **Response Type**: `code`
- **User Info 필드**: `id`, `kakao_account.email`, `kakao_account.profile.nickname`

#### Apple OAuth 2.0
- **Authorization Endpoint**: `https://appleid.apple.com/auth/authorize`
- **Token Endpoint**: `https://appleid.apple.com/auth/token`
- **Response Type**: `code id_token`
- **Response Mode**: `form_post`
- **Scope**: `name email`
- **특이사항**: JWT 방식, Client Secret 동적 생성 필요

---

## API 엔드포인트 스펙

### 1. OAuth URL 생성

**Endpoint**: `GET /api/v1/auth/{provider}/login/`

**설명**: OAuth 로그인 URL을 생성하고 반환합니다.

**Path Parameters**:
- `provider` (string, required): OAuth 제공자 (`google`, `kakao`, `apple`)

**Query Parameters**:
- `redirect_uri` (string, optional): OAuth 콜백 후 리다이렉트될 프론트엔드 URL
  - 기본값: `http://localhost:3000/auth/callback` (개발)
  - 프로덕션: `https://careerly.com/auth/callback`

**Response** (200 OK):
```json
{
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=xxx&redirect_uri=xxx&response_type=code&scope=openid%20email%20profile&state=xxx",
  "state": "random_state_string_for_csrf_protection",
  "provider": "google"
}
```

**Error Responses**:

400 Bad Request - 지원하지 않는 provider:
```json
{
  "error": "지원하지 않는 OAuth 제공자입니다.",
  "supported_providers": ["google", "kakao", "apple"]
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:8000/api/v1/auth/google/login/" \
  -H "Content-Type: application/json"
```

---

### 2. OAuth 콜백 처리

**Endpoint**: `POST /api/v1/auth/{provider}/callback/`

**설명**: OAuth authorization code를 처리하고 JWT 토큰을 발급합니다.

**Path Parameters**:
- `provider` (string, required): OAuth 제공자 (`google`, `kakao`, `apple`)

**Request Body**:
```json
{
  "code": "authorization_code_from_oauth_provider",
  "state": "state_value_from_login_request",
  "redirect_uri": "http://localhost:3000/auth/callback"
}
```

**Response** (200 OK) - 기존 사용자 로그인:
```json
{
  "user": {
    "id": 123,
    "name": "홍길동",
    "email": "hong@example.com",
    "phone": null,
    "created_at": "2025-01-13T10:30:00Z",
    "updated_at": "2025-01-13T10:30:00Z"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "is_new_user": false
}
```

**Response** (201 Created) - 신규 사용자 자동 회원가입:
```json
{
  "user": {
    "id": 456,
    "name": "김철수",
    "email": "kim@example.com",
    "phone": null,
    "created_at": "2025-01-15T14:20:00Z",
    "updated_at": "2025-01-15T14:20:00Z"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "is_new_user": true
}
```

**Error Responses**:

400 Bad Request - 필수 파라미터 누락:
```json
{
  "error": "code와 state는 필수입니다."
}
```

400 Bad Request - state 불일치 (CSRF 공격 방지):
```json
{
  "error": "유효하지 않은 state 값입니다."
}
```

401 Unauthorized - OAuth 토큰 교환 실패:
```json
{
  "error": "OAuth 인증에 실패했습니다.",
  "detail": "Invalid authorization code"
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/google/callback/" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "4/0AY0e-g7xxxxxxxxxxx",
    "state": "random_state_string",
    "redirect_uri": "http://localhost:3000/auth/callback"
  }'
```

---

## Django 구현

### 디렉토리 구조

```
careerly-v2-api/
├── api/
│   ├── views/
│   │   ├── __init__.py
│   │   ├── auth.py          # 기존 인증 (register, login)
│   │   └── oauth.py         # 새로 추가: OAuth 인증
│   ├── serializers/
│   │   ├── __init__.py
│   │   ├── user.py          # 기존 User 시리얼라이저
│   │   └── oauth.py         # 새로 추가: OAuth 시리얼라이저
│   ├── services/
│   │   ├── __init__.py
│   │   └── oauth_providers.py  # OAuth provider 로직
│   ├── utils/
│   │   ├── __init__.py
│   │   └── state_manager.py    # State 관리 유틸리티
│   ├── urls.py
│   └── models/
│       └── users.py         # 기존 Users 모델
└── config/
    └── settings/
        └── base.py
```

---

### 1. OAuth Provider 서비스 클래스

**파일**: `api/services/oauth_providers.py`

```python
"""
OAuth Provider Services

Handles OAuth 2.0 authentication flow for Google, Kakao, and Apple.
Each provider has its own class implementing a common interface.
"""
import requests
import secrets
import time
import jwt
from urllib.parse import urlencode
from typing import Dict, Optional, Tuple
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed


class BaseOAuthProvider:
    """
    Base class for OAuth providers.

    All provider classes should inherit from this and implement:
    - get_authorization_url()
    - exchange_code_for_token()
    - get_user_info()
    """

    provider_name: str = None

    def __init__(self):
        if not self.provider_name:
            raise NotImplementedError("provider_name must be set")

    def generate_state(self) -> str:
        """Generate random state for CSRF protection"""
        return secrets.token_urlsafe(32)

    def get_authorization_url(self, redirect_uri: str, state: str) -> str:
        """Generate OAuth authorization URL"""
        raise NotImplementedError

    def exchange_code_for_token(self, code: str, redirect_uri: str) -> str:
        """Exchange authorization code for access token"""
        raise NotImplementedError

    def get_user_info(self, access_token: str) -> Dict:
        """Get user information using access token"""
        raise NotImplementedError


class GoogleOAuthProvider(BaseOAuthProvider):
    """Google OAuth 2.0 Provider"""

    provider_name = 'google'

    # OAuth endpoints
    AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
    TOKEN_URL = 'https://oauth2.googleapis.com/token'
    USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

    def __init__(self):
        super().__init__()
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET

    def get_authorization_url(self, redirect_uri: str, state: str) -> str:
        """
        Generate Google OAuth authorization URL.

        Args:
            redirect_uri: Frontend callback URL
            state: CSRF protection token

        Returns:
            Full authorization URL with all required parameters
        """
        params = {
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': 'openid email profile',
            'state': state,
            'access_type': 'offline',  # Get refresh token
            'prompt': 'consent'  # Always show consent screen
        }
        return f"{self.AUTH_URL}?{urlencode(params)}"

    def exchange_code_for_token(self, code: str, redirect_uri: str) -> str:
        """
        Exchange authorization code for access token.

        Args:
            code: Authorization code from Google
            redirect_uri: Must match the one used in authorization

        Returns:
            Access token string

        Raises:
            AuthenticationFailed: If token exchange fails
        """
        data = {
            'code': code,
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        }

        try:
            response = requests.post(self.TOKEN_URL, data=data, timeout=10)
            response.raise_for_status()
            token_data = response.json()
            return token_data['access_token']
        except requests.RequestException as e:
            raise AuthenticationFailed(f"Google 토큰 교환 실패: {str(e)}")

    def get_user_info(self, access_token: str) -> Dict:
        """
        Get user information from Google.

        Args:
            access_token: Valid Google access token

        Returns:
            Dictionary with normalized user info:
            {
                'provider_id': str,
                'email': str,
                'name': str,
                'picture': str (optional)
            }

        Raises:
            AuthenticationFailed: If user info request fails
        """
        headers = {'Authorization': f'Bearer {access_token}'}

        try:
            response = requests.get(self.USER_INFO_URL, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()

            return {
                'provider_id': str(data['id']),
                'email': data['email'],
                'name': data.get('name', ''),
                'picture': data.get('picture')
            }
        except requests.RequestException as e:
            raise AuthenticationFailed(f"Google 사용자 정보 조회 실패: {str(e)}")


class KakaoOAuthProvider(BaseOAuthProvider):
    """Kakao OAuth 2.0 Provider"""

    provider_name = 'kakao'

    # OAuth endpoints
    AUTH_URL = 'https://kauth.kakao.com/oauth/authorize'
    TOKEN_URL = 'https://kauth.kakao.com/oauth/token'
    USER_INFO_URL = 'https://kapi.kakao.com/v2/user/me'

    def __init__(self):
        super().__init__()
        self.client_id = settings.KAKAO_REST_API_KEY
        self.client_secret = settings.KAKAO_CLIENT_SECRET  # Optional for Kakao

    def get_authorization_url(self, redirect_uri: str, state: str) -> str:
        """Generate Kakao OAuth authorization URL"""
        params = {
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'state': state
        }
        return f"{self.AUTH_URL}?{urlencode(params)}"

    def exchange_code_for_token(self, code: str, redirect_uri: str) -> str:
        """Exchange Kakao authorization code for access token"""
        data = {
            'grant_type': 'authorization_code',
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'code': code
        }

        # Add client_secret if available (optional for Kakao)
        if self.client_secret:
            data['client_secret'] = self.client_secret

        try:
            response = requests.post(self.TOKEN_URL, data=data, timeout=10)
            response.raise_for_status()
            token_data = response.json()
            return token_data['access_token']
        except requests.RequestException as e:
            raise AuthenticationFailed(f"Kakao 토큰 교환 실패: {str(e)}")

    def get_user_info(self, access_token: str) -> Dict:
        """Get user information from Kakao"""
        headers = {'Authorization': f'Bearer {access_token}'}

        try:
            response = requests.get(self.USER_INFO_URL, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()

            kakao_account = data.get('kakao_account', {})
            profile = kakao_account.get('profile', {})

            return {
                'provider_id': str(data['id']),
                'email': kakao_account.get('email'),
                'name': profile.get('nickname', ''),
                'picture': profile.get('profile_image_url')
            }
        except requests.RequestException as e:
            raise AuthenticationFailed(f"Kakao 사용자 정보 조회 실패: {str(e)}")


class AppleOAuthProvider(BaseOAuthProvider):
    """Apple OAuth 2.0 Provider (Sign in with Apple)"""

    provider_name = 'apple'

    # OAuth endpoints
    AUTH_URL = 'https://appleid.apple.com/auth/authorize'
    TOKEN_URL = 'https://appleid.apple.com/auth/token'

    def __init__(self):
        super().__init__()
        self.client_id = settings.APPLE_SERVICE_ID
        self.team_id = settings.APPLE_TEAM_ID
        self.key_id = settings.APPLE_KEY_ID
        self.private_key = settings.APPLE_PRIVATE_KEY

    def _generate_client_secret(self) -> str:
        """
        Generate Apple client secret (JWT).

        Apple requires a JWT as client_secret, signed with your private key.
        The JWT must be regenerated periodically (max 6 months validity).

        Returns:
            JWT string to use as client_secret
        """
        headers = {
            'kid': self.key_id,
            'alg': 'ES256'
        }

        payload = {
            'iss': self.team_id,
            'iat': int(time.time()),
            'exp': int(time.time()) + 3600 * 24 * 180,  # 6 months
            'aud': 'https://appleid.apple.com',
            'sub': self.client_id
        }

        return jwt.encode(payload, self.private_key, algorithm='ES256', headers=headers)

    def get_authorization_url(self, redirect_uri: str, state: str) -> str:
        """Generate Apple OAuth authorization URL"""
        params = {
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code id_token',
            'response_mode': 'form_post',
            'scope': 'name email',
            'state': state
        }
        return f"{self.AUTH_URL}?{urlencode(params)}"

    def exchange_code_for_token(self, code: str, redirect_uri: str) -> str:
        """Exchange Apple authorization code for access token"""
        client_secret = self._generate_client_secret()

        data = {
            'client_id': self.client_id,
            'client_secret': client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        }

        try:
            response = requests.post(self.TOKEN_URL, data=data, timeout=10)
            response.raise_for_status()
            token_data = response.json()

            # Apple returns id_token (JWT) instead of separate user info endpoint
            id_token = token_data['id_token']
            return id_token
        except requests.RequestException as e:
            raise AuthenticationFailed(f"Apple 토큰 교환 실패: {str(e)}")

    def get_user_info(self, id_token: str) -> Dict:
        """
        Decode Apple id_token to get user information.

        Note: Apple doesn't provide a separate user info endpoint.
        User data is embedded in the id_token JWT.
        """
        try:
            # Decode without verification for now (add verification in production)
            # In production, verify with Apple's public keys
            decoded = jwt.decode(id_token, options={"verify_signature": False})

            return {
                'provider_id': decoded['sub'],
                'email': decoded.get('email'),
                'name': '',  # Apple doesn't always provide name in token
                'email_verified': decoded.get('email_verified', False)
            }
        except jwt.DecodeError as e:
            raise AuthenticationFailed(f"Apple ID 토큰 디코딩 실패: {str(e)}")


# Provider factory
def get_oauth_provider(provider_name: str) -> BaseOAuthProvider:
    """
    Factory function to get OAuth provider instance.

    Args:
        provider_name: 'google', 'kakao', or 'apple'

    Returns:
        Provider instance

    Raises:
        ValueError: If provider is not supported
    """
    providers = {
        'google': GoogleOAuthProvider,
        'kakao': KakaoOAuthProvider,
        'apple': AppleOAuthProvider
    }

    provider_class = providers.get(provider_name.lower())
    if not provider_class:
        raise ValueError(f"지원하지 않는 OAuth 제공자입니다: {provider_name}")

    return provider_class()
```

---

### 2. State 관리 유틸리티

**파일**: `api/utils/state_manager.py`

```python
"""
OAuth State Management

Manages CSRF protection state tokens using Django cache.
State tokens expire after 10 minutes.
"""
from django.core.cache import cache
from typing import Optional
import secrets


class OAuthStateManager:
    """
    Manages OAuth state tokens for CSRF protection.

    State tokens are stored in cache with 10-minute expiration.
    Each state is used only once and deleted after validation.
    """

    CACHE_PREFIX = 'oauth_state'
    EXPIRATION = 600  # 10 minutes

    @classmethod
    def generate_state(cls, provider: str) -> str:
        """
        Generate and store a new state token.

        Args:
            provider: OAuth provider name

        Returns:
            Random state token string
        """
        state = secrets.token_urlsafe(32)
        cache_key = f"{cls.CACHE_PREFIX}:{state}"
        cache.set(cache_key, provider, cls.EXPIRATION)
        return state

    @classmethod
    def validate_state(cls, state: str, expected_provider: str) -> bool:
        """
        Validate and consume a state token.

        Args:
            state: State token to validate
            expected_provider: Expected OAuth provider

        Returns:
            True if valid, False otherwise

        Note:
            State is deleted after validation (one-time use)
        """
        cache_key = f"{cls.CACHE_PREFIX}:{state}"
        stored_provider = cache.get(cache_key)

        if stored_provider is None:
            return False

        # Delete state after use (one-time token)
        cache.delete(cache_key)

        return stored_provider == expected_provider
```

---

### 3. OAuth Serializers

**파일**: `api/serializers/oauth.py`

```python
"""
OAuth Serializers

Request/response serializers for OAuth endpoints.
"""
from rest_framework import serializers


class OAuthLoginResponseSerializer(serializers.Serializer):
    """Response serializer for OAuth login URL endpoint"""
    auth_url = serializers.URLField(help_text='OAuth authorization URL')
    state = serializers.CharField(help_text='CSRF protection state token')
    provider = serializers.CharField(help_text='OAuth provider name')


class OAuthCallbackRequestSerializer(serializers.Serializer):
    """Request serializer for OAuth callback endpoint"""
    code = serializers.CharField(
        required=True,
        help_text='Authorization code from OAuth provider'
    )
    state = serializers.CharField(
        required=True,
        help_text='State token from login request'
    )
    redirect_uri = serializers.URLField(
        required=False,
        help_text='Redirect URI used in authorization request'
    )


class OAuthCallbackResponseSerializer(serializers.Serializer):
    """Response serializer for OAuth callback endpoint"""
    user = serializers.DictField(help_text='User information')
    tokens = serializers.DictField(help_text='JWT access and refresh tokens')
    is_new_user = serializers.BooleanField(help_text='Whether user was just created')
```

**파일**: `api/serializers/__init__.py` (업데이트)

```python
"""
API Serializers

Exports all serializers for easy import.
"""
from .user import UserSerializer, UserRegistrationSerializer
from .oauth import (
    OAuthLoginResponseSerializer,
    OAuthCallbackRequestSerializer,
    OAuthCallbackResponseSerializer
)
from .post import PostListSerializer, PostDetailSerializer, PostCreateUpdateSerializer
from .comment import CommentSerializer, CommentCreateSerializer
from .question import (
    QuestionListSerializer,
    QuestionDetailSerializer,
    QuestionCreateUpdateSerializer,
    AnswerSerializer,
    AnswerCreateUpdateSerializer,
)

__all__ = [
    # User
    'UserSerializer',
    'UserRegistrationSerializer',
    # OAuth
    'OAuthLoginResponseSerializer',
    'OAuthCallbackRequestSerializer',
    'OAuthCallbackResponseSerializer',
    # Post
    'PostListSerializer',
    'PostDetailSerializer',
    'PostCreateUpdateSerializer',
    # Comment
    'CommentSerializer',
    'CommentCreateSerializer',
    # Question & Answer
    'QuestionListSerializer',
    'QuestionDetailSerializer',
    'QuestionCreateUpdateSerializer',
    'AnswerSerializer',
    'AnswerCreateUpdateSerializer',
]
```

---

### 4. OAuth Views

**파일**: `api/views/oauth.py`

```python
"""
OAuth Authentication Views

Handles OAuth 2.0 login flow for Google, Kakao, and Apple.
Supports automatic user registration for new users.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.db import transaction
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

from api.models import Users
from api.serializers import (
    UserSerializer,
    OAuthLoginResponseSerializer,
    OAuthCallbackRequestSerializer,
    OAuthCallbackResponseSerializer
)
from api.services.oauth_providers import get_oauth_provider
from api.utils.state_manager import OAuthStateManager


@extend_schema(
    tags=['OAuth Authentication'],
    summary='Get OAuth Login URL',
    description='''
    Generate OAuth authorization URL for the specified provider.

    **Supported Providers:**
    - `google`: Google OAuth 2.0
    - `kakao`: Kakao OAuth 2.0
    - `apple`: Sign in with Apple

    **Flow:**
    1. Frontend calls this endpoint
    2. Backend returns OAuth URL and state token
    3. Frontend redirects user to OAuth URL
    4. User authenticates with provider
    5. Provider redirects back with authorization code
    6. Frontend calls callback endpoint with code

    **CSRF Protection:**
    - State token is generated and stored server-side
    - Must be validated in callback request
    - Expires after 10 minutes
    ''',
    parameters=[
        OpenApiParameter(
            name='provider',
            type=str,
            location=OpenApiParameter.PATH,
            description='OAuth provider (google, kakao, apple)',
            required=True,
            enum=['google', 'kakao', 'apple']
        ),
        OpenApiParameter(
            name='redirect_uri',
            type=str,
            location=OpenApiParameter.QUERY,
            description='Frontend callback URL (optional)',
            required=False
        )
    ],
    responses={
        200: OAuthLoginResponseSerializer,
        400: OpenApiExample(
            'Invalid Provider',
            value={'error': '지원하지 않는 OAuth 제공자입니다.'}
        )
    },
    examples=[
        OpenApiExample(
            'Google Login',
            value={
                'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth?...',
                'state': 'random_state_token',
                'provider': 'google'
            }
        )
    ]
)
@api_view(['GET'])
@permission_classes([AllowAny])
def oauth_login(request, provider):
    """
    Generate OAuth authorization URL.

    Args:
        provider: OAuth provider name (google, kakao, apple)

    Query Params:
        redirect_uri: Frontend callback URL (optional)

    Returns:
        OAuth authorization URL and state token
    """
    try:
        # Get OAuth provider instance
        oauth_provider = get_oauth_provider(provider)

        # Get redirect URI from query params or use default
        redirect_uri = request.GET.get('redirect_uri')
        if not redirect_uri:
            # Default redirect URI based on environment
            if settings.DEBUG:
                redirect_uri = 'http://localhost:3000/auth/callback'
            else:
                redirect_uri = f"{settings.FRONTEND_URL}/auth/callback"

        # Generate state token for CSRF protection
        state = OAuthStateManager.generate_state(provider)

        # Generate authorization URL
        auth_url = oauth_provider.get_authorization_url(redirect_uri, state)

        return Response({
            'auth_url': auth_url,
            'state': state,
            'provider': provider
        })

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@extend_schema(
    tags=['OAuth Authentication'],
    summary='OAuth Callback Handler',
    description='''
    Process OAuth callback and issue JWT tokens.

    **Flow:**
    1. Validate state token (CSRF protection)
    2. Exchange authorization code for access token
    3. Fetch user info from OAuth provider
    4. Find or create user in database
    5. Generate JWT tokens (access + refresh)
    6. Return user data and tokens

    **Auto Registration:**
    - New users are automatically registered
    - Email from OAuth provider is used
    - Name from OAuth provider is used (if available)
    - No additional onboarding required

    **JWT Tokens:**
    - Access token lifetime: 60 minutes
    - Refresh token lifetime: 24 hours
    - Tokens include user ID and email
    ''',
    parameters=[
        OpenApiParameter(
            name='provider',
            type=str,
            location=OpenApiParameter.PATH,
            description='OAuth provider (google, kakao, apple)',
            required=True,
            enum=['google', 'kakao', 'apple']
        )
    ],
    request=OAuthCallbackRequestSerializer,
    responses={
        200: OAuthCallbackResponseSerializer,
        201: OAuthCallbackResponseSerializer,
        400: OpenApiExample(
            'Invalid State',
            value={'error': '유효하지 않은 state 값입니다.'}
        ),
        401: OpenApiExample(
            'OAuth Failed',
            value={'error': 'OAuth 인증에 실패했습니다.'}
        )
    },
    examples=[
        OpenApiExample(
            'Callback Request',
            value={
                'code': '4/0AY0e-g7xxxxxxxxxxx',
                'state': 'random_state_token',
                'redirect_uri': 'http://localhost:3000/auth/callback'
            },
            request_only=True
        ),
        OpenApiExample(
            'Success Response',
            value={
                'user': {
                    'id': 123,
                    'name': '홍길동',
                    'email': 'hong@example.com',
                    'phone': None,
                    'created_at': '2025-01-15T10:30:00Z',
                    'updated_at': '2025-01-15T10:30:00Z'
                },
                'tokens': {
                    'access': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    'refresh': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                'is_new_user': False
            }
        )
    ]
)
@api_view(['POST'])
@permission_classes([AllowAny])
def oauth_callback(request, provider):
    """
    Handle OAuth callback and create/login user.

    Args:
        provider: OAuth provider name (google, kakao, apple)

    Request Body:
        - code: Authorization code from OAuth provider
        - state: State token from login request
        - redirect_uri: Redirect URI used in authorization

    Returns:
        User data and JWT tokens (200 for existing, 201 for new user)
    """
    # Validate request data
    serializer = OAuthCallbackRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    code = serializer.validated_data['code']
    state = serializer.validated_data['state']
    redirect_uri = serializer.validated_data.get('redirect_uri')

    # Use default redirect URI if not provided
    if not redirect_uri:
        if settings.DEBUG:
            redirect_uri = 'http://localhost:3000/auth/callback'
        else:
            redirect_uri = f"{settings.FRONTEND_URL}/auth/callback"

    # Validate state token (CSRF protection)
    if not OAuthStateManager.validate_state(state, provider):
        return Response(
            {'error': '유효하지 않은 state 값입니다.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Get OAuth provider instance
        oauth_provider = get_oauth_provider(provider)

        # Exchange code for access token
        access_token = oauth_provider.exchange_code_for_token(code, redirect_uri)

        # Get user info from OAuth provider
        user_info = oauth_provider.get_user_info(access_token)

        # Validate required fields
        if not user_info.get('email'):
            return Response(
                {'error': 'OAuth 제공자로부터 이메일을 받을 수 없습니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find or create user
        user, is_new_user = _get_or_create_oauth_user(
            email=user_info['email'],
            name=user_info.get('name', ''),
            provider=provider,
            provider_id=user_info['provider_id']
        )

        # Generate JWT tokens
        refresh = RefreshToken()
        refresh['userid'] = user.id
        refresh['email'] = user.email

        response_data = {
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'is_new_user': is_new_user
        }

        # Return 201 for new users, 200 for existing users
        response_status = status.HTTP_201_CREATED if is_new_user else status.HTTP_200_OK
        return Response(response_data, status=response_status)

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': 'OAuth 인증에 실패했습니다.', 'detail': str(e)},
            status=status.HTTP_401_UNAUTHORIZED
        )


def _get_or_create_oauth_user(email: str, name: str, provider: str, provider_id: str):
    """
    Find existing user by email or create new user.

    Business Logic:
    1. Check if user exists with this email (soft-deleted users excluded)
    2. If exists, return existing user
    3. If not exists, create new user with OAuth info

    Args:
        email: User email from OAuth provider
        name: User name from OAuth provider
        provider: OAuth provider name
        provider_id: User ID from OAuth provider

    Returns:
        Tuple of (user, is_new_user)

    Note:
        Uses PROFILE database for user storage.
        Transaction ensures atomic create operation.
    """
    # Try to find existing user by email
    try:
        user = Users.objects.using('profile').get(
            email=email,
            deleted_at__isnull=True
        )
        return user, False

    except Users.DoesNotExist:
        # Create new user
        with transaction.atomic(using='profile'):
            user = Users(
                email=email,
                name=name or email.split('@')[0],  # Use email prefix if name not provided
                password='',  # OAuth users don't have password
                phone=None
            )
            user.save(using='profile')
            return user, True
```

---

### 5. URL Configuration

**파일**: `api/urls.py` (업데이트)

```python
"""
API URL Configuration

Routes for all API endpoints.
"""
from django.urls import path
from api.views import auth, oauth, post, comment, question, company

app_name = 'api'

urlpatterns = [
    # Authentication (기존)
    path('v1/auth/register/', auth.register, name='register'),
    path('v1/auth/login/', auth.login, name='login'),

    # OAuth Authentication (새로 추가)
    path('v1/auth/<str:provider>/login/', oauth.oauth_login, name='oauth-login'),
    path('v1/auth/<str:provider>/callback/', oauth.oauth_callback, name='oauth-callback'),

    # ... 기존 엔드포인트들
]
```

---

### 6. Settings Configuration

**파일**: `config/settings/base.py` (추가 설정)

```python
# OAuth Provider Settings
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')

KAKAO_REST_API_KEY = os.getenv('KAKAO_REST_API_KEY', '')
KAKAO_CLIENT_SECRET = os.getenv('KAKAO_CLIENT_SECRET', '')  # Optional

APPLE_SERVICE_ID = os.getenv('APPLE_SERVICE_ID', '')
APPLE_TEAM_ID = os.getenv('APPLE_TEAM_ID', '')
APPLE_KEY_ID = os.getenv('APPLE_KEY_ID', '')
APPLE_PRIVATE_KEY = os.getenv('APPLE_PRIVATE_KEY', '').replace('\\n', '\n')

# Frontend URL for OAuth redirect
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Cache for OAuth state tokens
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# JWT Settings (기존 설정 유지)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    # ... 기존 설정
}
```

---

## 환경 변수 설정

### .env 파일

**파일**: `.env`

```bash
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NEWS_NAME=news
DB_PROFILE_NAME=profile
DB_AUTH_NAME=auth
DB_NOTIFICATION_NAME=notification

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx

# Kakao OAuth
KAKAO_REST_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
KAKAO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Apple OAuth
APPLE_SERVICE_ID=com.careerly.service
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMG...\n-----END PRIVATE KEY-----
```

### OAuth Provider 설정 가이드

#### Google OAuth 설정

1. **Google Cloud Console** 접속: https://console.cloud.google.com/
2. **프로젝트 생성** 또는 기존 프로젝트 선택
3. **API 및 서비스 > 사용자 인증 정보** 메뉴로 이동
4. **사용자 인증 정보 만들기 > OAuth 클라이언트 ID** 선택
5. **애플리케이션 유형**: 웹 애플리케이션
6. **승인된 리디렉션 URI 추가**:
   - 개발: `http://localhost:3000/auth/callback`
   - 프로덕션: `https://careerly.com/auth/callback`
7. **클라이언트 ID**와 **클라이언트 보안 비밀** 복사하여 `.env`에 저장

#### Kakao OAuth 설정

1. **Kakao Developers** 접속: https://developers.kakao.com/
2. **내 애플리케이션** 메뉴에서 애플리케이션 생성
3. **앱 설정 > 요약 정보**에서 **REST API 키** 확인
4. **제품 설정 > 카카오 로그인** 활성화
5. **Redirect URI 등록**:
   - 개발: `http://localhost:3000/auth/callback`
   - 프로덕션: `https://careerly.com/auth/callback`
6. **동의 항목**에서 **이메일**, **프로필 정보** 필수 동의 설정
7. **REST API 키** 복사하여 `.env`에 저장
8. (선택) **보안 > Client Secret** 생성하여 `.env`에 저장

#### Apple OAuth 설정

1. **Apple Developer** 접속: https://developer.apple.com/
2. **Certificates, Identifiers & Profiles** 메뉴로 이동
3. **Identifiers > App IDs** 생성
4. **Sign in with Apple** 기능 활성화
5. **Services ID** 생성:
   - Identifier: `com.careerly.service`
   - Return URLs 설정: `https://careerly.com/auth/callback`
6. **Keys** 메뉴에서 새 키 생성:
   - **Sign in with Apple** 활성화
   - Key ID 저장
   - `.p8` 파일 다운로드 (한 번만 가능!)
7. **Team ID** 확인 (우측 상단 계정 정보)
8. `.p8` 파일 내용을 `.env`의 `APPLE_PRIVATE_KEY`에 저장 (줄바꿈은 `\n`으로)

---

## 필요한 라이브러리

### requirements.txt 추가

**파일**: `requirements/base.txt` (추가)

```txt
# 기존 패키지
Django==5.0.1
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
mysqlclient==2.2.1
python-dotenv==1.0.0
django-cors-headers==4.3.1
drf-spectacular==0.27.0

# OAuth 관련 추가 패키지
requests==2.31.0          # HTTP 요청
PyJWT==2.8.0             # JWT 인코딩/디코딩 (Apple용)
cryptography==41.0.7     # JWT 암호화 (Apple ES256)
```

### 설치 명령어

```bash
# 개발 환경
pip install -r requirements/local.txt

# 프로덕션 환경
pip install -r requirements/production.txt
```

---

## 프론트엔드 연동

### Next.js 연동 예시

**파일**: `app/auth/oauth/[provider]/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function OAuthLoginPage() {
  const router = useRouter()
  const params = useParams()
  const provider = params.provider as string

  useEffect(() => {
    async function initiateOAuth() {
      try {
        // 1. Backend에서 OAuth URL 가져오기
        const response = await fetch(
          `http://localhost:8000/api/v1/auth/${provider}/login/`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error('OAuth URL 생성 실패')
        }

        const data = await response.json()

        // 2. State를 localStorage에 저장 (콜백에서 검증용)
        localStorage.setItem('oauth_state', data.state)
        localStorage.setItem('oauth_provider', data.provider)

        // 3. OAuth 페이지로 리다이렉트
        window.location.href = data.auth_url

      } catch (error) {
        console.error('OAuth 로그인 실패:', error)
        router.push('/auth/login?error=oauth_failed')
      }
    }

    initiateOAuth()
  }, [provider, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">로그인 중...</h2>
        <p className="text-gray-600">
          {provider} 계정으로 로그인하고 있습니다.
        </p>
      </div>
    </div>
  )
}
```

**파일**: `app/auth/callback/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function handleOAuthCallback() {
      try {
        // 1. URL에서 파라미터 추출
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (!code || !state) {
          throw new Error('OAuth 파라미터 누락')
        }

        // 2. localStorage에서 state 검증
        const savedState = localStorage.getItem('oauth_state')
        const provider = localStorage.getItem('oauth_provider')

        if (state !== savedState) {
          throw new Error('State 불일치 - CSRF 공격 가능성')
        }

        // 3. Backend 콜백 엔드포인트 호출
        const response = await fetch(
          `http://localhost:8000/api/v1/auth/${provider}/callback/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              state,
              redirect_uri: `${window.location.origin}/auth/callback`,
            }),
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'OAuth 인증 실패')
        }

        const data = await response.json()

        // 4. JWT 토큰 저장
        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)

        // 5. State 정리
        localStorage.removeItem('oauth_state')
        localStorage.removeItem('oauth_provider')

        // 6. 메인 페이지로 리다이렉트
        if (data.is_new_user) {
          router.push('/onboarding') // 신규 사용자
        } else {
          router.push('/') // 기존 사용자
        }

      } catch (error) {
        console.error('OAuth 콜백 처리 실패:', error)
        router.push('/auth/login?error=oauth_callback_failed')
      }
    }

    handleOAuthCallback()
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">로그인 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  )
}
```

### 로그인 버튼 컴포넌트

**파일**: `components/auth/OAuthButtons.tsx`

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function OAuthButtons() {
  const router = useRouter()

  const handleOAuthLogin = (provider: 'google' | 'kakao' | 'apple') => {
    router.push(`/auth/oauth/${provider}`)
  }

  return (
    <div className="space-y-3">
      {/* Google 로그인 */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthLogin('google')}
      >
        <img src="/icons/google.svg" alt="Google" className="w-5 h-5 mr-2" />
        Google로 계속하기
      </Button>

      {/* Kakao 로그인 */}
      <Button
        variant="outline"
        className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black"
        onClick={() => handleOAuthLogin('kakao')}
      >
        <img src="/icons/kakao.svg" alt="Kakao" className="w-5 h-5 mr-2" />
        카카오로 계속하기
      </Button>

      {/* Apple 로그인 */}
      <Button
        variant="outline"
        className="w-full bg-black hover:bg-gray-800 text-white"
        onClick={() => handleOAuthLogin('apple')}
      >
        <img src="/icons/apple.svg" alt="Apple" className="w-5 h-5 mr-2" />
        Apple로 계속하기
      </Button>
    </div>
  )
}
```

---

## 보안 고려사항

### 1. State 파라미터 사용 (CSRF 방지)

**목적**: OAuth 콜백 요청이 실제 우리가 시작한 요청인지 확인

**구현**:
- Backend에서 랜덤 state 토큰 생성
- Django cache에 10분간 저장
- 콜백에서 state 검증 후 즉시 삭제 (one-time use)

**코드**:
```python
# State 생성 (oauth_login)
state = OAuthStateManager.generate_state(provider)

# State 검증 (oauth_callback)
if not OAuthStateManager.validate_state(state, provider):
    return Response({'error': '유효하지 않은 state'}, status=400)
```

### 2. HTTPS 필수 (프로덕션)

**목적**: 중간자 공격 방지, 토큰 탈취 방지

**설정**:
```python
# config/settings/production.py
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
```

### 3. JWT 토큰 보안

**Access Token**:
- 수명: 60분 (짧게 유지)
- 저장: localStorage (XSS 위험 있음) 또는 메모리 (권장)
- HttpOnly 쿠키 사용 고려

**Refresh Token**:
- 수명: 24시간
- 저장: HttpOnly 쿠키 (권장) 또는 secure storage
- Rotation 구현 권장

**설정**:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,  # Refresh token rotation
    'BLACKLIST_AFTER_ROTATION': True,  # 사용된 refresh token 블랙리스트
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': settings.SECRET_KEY,
}
```

### 4. Rate Limiting

**목적**: Brute force 공격 방지

**구현** (django-ratelimit 사용):
```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST')
@api_view(['POST'])
def oauth_callback(request, provider):
    # ... 기존 코드
```

### 5. 환경 변수 보안

**절대 금지**:
- `.env` 파일을 git에 커밋
- 코드에 하드코딩

**권장**:
- `.gitignore`에 `.env` 추가
- 프로덕션에서는 환경 변수 또는 AWS Secrets Manager 사용

**.gitignore**:
```
.env
.env.local
.env.production
```

### 6. Apple Private Key 보안

**주의사항**:
- `.p8` 파일은 한 번만 다운로드 가능
- 절대 공개 저장소에 업로드 금지
- 프로덕션에서는 환경 변수 또는 secrets manager 사용

**환경 변수 설정**:
```bash
# 줄바꿈을 \n으로 변환
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGTAgEAM...\n-----END PRIVATE KEY-----"
```

**코드에서 복원**:
```python
private_key = settings.APPLE_PRIVATE_KEY.replace('\\n', '\n')
```

### 7. 사용자 이메일 검증

**이슈**: OAuth provider가 이메일 검증을 했는지 확인

**구현**:
```python
# Google: 항상 검증됨
# Kakao: 이메일 선택 동의 가능 (None일 수 있음)
# Apple: email_verified 필드 확인

if not user_info.get('email'):
    return Response(
        {'error': 'OAuth 제공자로부터 이메일을 받을 수 없습니다.'},
        status=400
    )
```

### 8. CORS 설정

**목적**: 허용된 프론트엔드에서만 API 호출 가능

**설정**:
```python
# config/settings/base.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # 개발
    'https://careerly.com',   # 프로덕션
]

CORS_ALLOW_CREDENTIALS = True

# OAuth 관련 헤더 허용
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

---

## 테스트

### Unit Tests

**파일**: `api/tests/test_oauth.py`

```python
"""
OAuth Authentication Tests

Tests for OAuth login flow.
"""
import json
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from api.models import Users
from api.services.oauth_providers import GoogleOAuthProvider, KakaoOAuthProvider
from api.utils.state_manager import OAuthStateManager


class OAuthLoginTests(TestCase):
    """Tests for OAuth login URL generation"""

    def setUp(self):
        self.client = APIClient()

    def test_google_oauth_login_url(self):
        """Test Google OAuth URL generation"""
        url = reverse('api:oauth-login', kwargs={'provider': 'google'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('auth_url', response.data)
        self.assertIn('state', response.data)
        self.assertEqual(response.data['provider'], 'google')
        self.assertIn('accounts.google.com', response.data['auth_url'])

    def test_kakao_oauth_login_url(self):
        """Test Kakao OAuth URL generation"""
        url = reverse('api:oauth-login', kwargs={'provider': 'kakao'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('kauth.kakao.com', response.data['auth_url'])

    def test_invalid_provider(self):
        """Test invalid OAuth provider"""
        url = reverse('api:oauth-login', kwargs={'provider': 'invalid'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class OAuthCallbackTests(TestCase):
    """Tests for OAuth callback handling"""

    databases = ['profile']

    def setUp(self):
        self.client = APIClient()

        # Clean up test users
        Users.objects.using('profile').filter(
            email__in=['test@google.com', 'test@kakao.com']
        ).delete()

    def tearDown(self):
        # Clean up
        Users.objects.using('profile').filter(
            email__in=['test@google.com', 'test@kakao.com']
        ).delete()

    @patch('api.services.oauth_providers.requests.post')
    @patch('api.services.oauth_providers.requests.get')
    def test_google_callback_new_user(self, mock_get, mock_post):
        """Test Google OAuth callback with new user"""
        # Mock token exchange
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {'access_token': 'mock_access_token'}
        )

        # Mock user info
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                'id': '12345',
                'email': 'test@google.com',
                'name': 'Test User',
                'picture': 'https://example.com/photo.jpg'
            }
        )

        # Generate valid state
        state = OAuthStateManager.generate_state('google')

        # Call callback endpoint
        url = reverse('api:oauth-callback', kwargs={'provider': 'google'})
        data = {
            'code': 'mock_auth_code',
            'state': state,
            'redirect_uri': 'http://localhost:3000/auth/callback'
        }
        response = self.client.post(url, data, format='json')

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertTrue(response.data['is_new_user'])
        self.assertEqual(response.data['user']['email'], 'test@google.com')

        # Verify user created
        user = Users.objects.using('profile').get(email='test@google.com')
        self.assertIsNotNone(user)

    @patch('api.services.oauth_providers.requests.post')
    @patch('api.services.oauth_providers.requests.get')
    def test_google_callback_existing_user(self, mock_get, mock_post):
        """Test Google OAuth callback with existing user"""
        # Create existing user
        existing_user = Users(
            email='test@google.com',
            name='Existing User',
            password=''
        )
        existing_user.save(using='profile')

        # Mock token exchange
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {'access_token': 'mock_access_token'}
        )

        # Mock user info
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                'id': '12345',
                'email': 'test@google.com',
                'name': 'Test User',
                'picture': 'https://example.com/photo.jpg'
            }
        )

        # Generate valid state
        state = OAuthStateManager.generate_state('google')

        # Call callback endpoint
        url = reverse('api:oauth-callback', kwargs={'provider': 'google'})
        data = {
            'code': 'mock_auth_code',
            'state': state,
            'redirect_uri': 'http://localhost:3000/auth/callback'
        }
        response = self.client.post(url, data, format='json')

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_new_user'])
        self.assertEqual(response.data['user']['id'], existing_user.id)

    def test_callback_invalid_state(self):
        """Test callback with invalid state (CSRF protection)"""
        url = reverse('api:oauth-callback', kwargs={'provider': 'google'})
        data = {
            'code': 'mock_auth_code',
            'state': 'invalid_state',
            'redirect_uri': 'http://localhost:3000/auth/callback'
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class StateManagerTests(TestCase):
    """Tests for OAuth state management"""

    def test_generate_state(self):
        """Test state generation"""
        state = OAuthStateManager.generate_state('google')

        self.assertIsNotNone(state)
        self.assertGreater(len(state), 20)

    def test_validate_state_success(self):
        """Test state validation success"""
        state = OAuthStateManager.generate_state('google')
        is_valid = OAuthStateManager.validate_state(state, 'google')

        self.assertTrue(is_valid)

    def test_validate_state_wrong_provider(self):
        """Test state validation with wrong provider"""
        state = OAuthStateManager.generate_state('google')
        is_valid = OAuthStateManager.validate_state(state, 'kakao')

        self.assertFalse(is_valid)

    def test_validate_state_invalid(self):
        """Test state validation with invalid state"""
        is_valid = OAuthStateManager.validate_state('invalid_state', 'google')

        self.assertFalse(is_valid)

    def test_state_one_time_use(self):
        """Test that state can only be used once"""
        state = OAuthStateManager.generate_state('google')

        # First validation should succeed
        is_valid_1 = OAuthStateManager.validate_state(state, 'google')
        self.assertTrue(is_valid_1)

        # Second validation should fail (already used)
        is_valid_2 = OAuthStateManager.validate_state(state, 'google')
        self.assertFalse(is_valid_2)
```

### 테스트 실행

```bash
# 전체 테스트 실행
python manage.py test api.tests.test_oauth

# 특정 테스트 클래스 실행
python manage.py test api.tests.test_oauth.OAuthCallbackTests

# 특정 테스트 메서드 실행
python manage.py test api.tests.test_oauth.OAuthCallbackTests.test_google_callback_new_user

# Coverage와 함께 실행
coverage run --source='api' manage.py test api.tests.test_oauth
coverage report
```

---

## 체크리스트

### Backend 구현
- [ ] OAuth provider 서비스 클래스 작성 (`oauth_providers.py`)
- [ ] State 관리 유틸리티 작성 (`state_manager.py`)
- [ ] OAuth serializers 작성 (`oauth.py`)
- [ ] OAuth views 작성 (`oauth.py`)
- [ ] URL 라우팅 설정 (`urls.py`)
- [ ] Settings에 OAuth 설정 추가 (`base.py`)
- [ ] 환경 변수 설정 (`.env`)

### OAuth Provider 설정
- [ ] Google OAuth 클라이언트 생성
- [ ] Kakao OAuth 앱 생성
- [ ] Apple Sign in 설정
- [ ] Redirect URI 등록 (각 provider)
- [ ] 환경 변수에 credentials 저장

### 보안
- [ ] State 파라미터 구현 (CSRF 방지)
- [ ] HTTPS 설정 (프로덕션)
- [ ] JWT 토큰 설정 (수명, rotation)
- [ ] Rate limiting 설정
- [ ] CORS 설정
- [ ] `.env` 파일을 `.gitignore`에 추가

### 테스트
- [ ] Unit tests 작성
- [ ] Integration tests 작성
- [ ] Manual testing (Postman)
- [ ] 프론트엔드 연동 테스트

### 배포
- [ ] 프로덕션 환경 변수 설정
- [ ] 프로덕션 Redirect URI 등록
- [ ] HTTPS 인증서 설정
- [ ] 모니터링 설정

---

## 추가 개선 사항

### 1. OAuth User 모델 추가 (선택사항)

사용자가 여러 OAuth provider로 로그인할 수 있도록 지원:

```python
# api/models/oauth_accounts.py
class OAuthAccount(models.Model):
    """OAuth 계정 연동 정보"""
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='oauth_accounts')
    provider = models.CharField(max_length=20)  # google, kakao, apple
    provider_id = models.CharField(max_length=255)  # Provider의 user ID
    access_token = models.TextField(blank=True)  # 선택적 저장
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'oauth_accounts'
        unique_together = ('provider', 'provider_id')
```

### 2. Refresh Token Rotation

보안 강화를 위한 refresh token rotation:

```python
SIMPLE_JWT = {
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

INSTALLED_APPS += ['rest_framework_simplejwt.token_blacklist']
```

### 3. 소셜 로그인 연동 끊기

```python
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def disconnect_oauth(request, provider):
    """OAuth 연동 해제"""
    try:
        account = OAuthAccount.objects.get(
            user=request.user,
            provider=provider
        )
        account.delete()
        return Response({'message': f'{provider} 연동이 해제되었습니다.'})
    except OAuthAccount.DoesNotExist:
        return Response(
            {'error': '연동된 계정이 없습니다.'},
            status=404
        )
```

### 4. 프로필 이미지 자동 저장

OAuth provider에서 제공하는 프로필 이미지 자동 저장:

```python
import requests
from django.core.files.base import ContentFile

def save_profile_image(user, image_url):
    """OAuth provider의 프로필 이미지 저장"""
    if not image_url:
        return

    try:
        response = requests.get(image_url, timeout=5)
        if response.status_code == 200:
            user.profile_image.save(
                f'oauth_{user.id}.jpg',
                ContentFile(response.content),
                save=True
            )
    except Exception as e:
        # 이미지 저장 실패는 무시 (critical하지 않음)
        pass
```

---

## 트러블슈팅

### 문제 1: "Invalid redirect_uri"

**원인**: OAuth provider에 등록된 redirect URI와 요청의 redirect URI가 불일치

**해결**:
1. OAuth provider 콘솔에서 등록된 redirect URI 확인
2. 프론트엔드 callback URL이 정확히 일치하는지 확인
3. HTTP vs HTTPS 확인
4. 포트 번호 확인 (개발 환경)

### 문제 2: "State mismatch"

**원인**: State 토큰이 만료되었거나 캐시에서 찾을 수 없음

**해결**:
1. State 유효 시간 확인 (기본 10분)
2. Django cache 설정 확인
3. 동일한 브라우저/세션에서 요청하는지 확인

### 문제 3: Apple OAuth "Invalid client_secret"

**원인**: Apple private key가 잘못되었거나 JWT 생성 실패

**해결**:
1. `.p8` 파일 내용이 정확한지 확인
2. `\n` 줄바꿈이 올바르게 변환되었는지 확인
3. Team ID, Key ID, Service ID가 정확한지 확인
4. Private key 재생성 (Apple Developer 콘솔)

### 문제 4: CORS 에러

**원인**: CORS 설정이 프론트엔드 origin을 허용하지 않음

**해결**:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # 개발
    'https://careerly.com',   # 프로덕션
]
CORS_ALLOW_CREDENTIALS = True
```

---

## 참고 자료

### 공식 문서
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Kakao OAuth 2.0 Documentation](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Apple Sign in Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [SimpleJWT Documentation](https://django-rest-framework-simplejwt.readthedocs.io/)

### OAuth 2.0 스펙
- [RFC 6749: OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749)
- [RFC 6750: OAuth 2.0 Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-01-15 | 초안 작성 |

---

**작성자**: Backend Development Team
**최종 업데이트**: 2025-01-15
