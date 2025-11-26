/**
 * RESTful API 타입 정의
 */

/**
 * 공통 API 응답 타입
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 검색 파라미터
 */
export interface SearchParams extends PaginationParams {
  query: string;
  filters?: Record<string, unknown>;
}

/**
 * 인증 관련 타입
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  password_confirm: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

/**
 * OAuth 인증 관련 타입
 */
export type OAuthProvider = 'google' | 'apple' | 'kakao';

export interface OAuthLoginRequest {
  provider: OAuthProvider;
}

export interface OAuthLoginResponse {
  authUrl: string;
}

export interface OAuthCallbackRequest {
  provider: OAuthProvider;
  code: string;
  state?: string;
}

/**
 * 사용자 타입
 */
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  image_url?: string;
  headline?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 검색 결과 타입 (기존 타입 호환)
 */
export interface SearchResult {
  query: string;
  results: SearchResultItem[];
  total: number;
  suggestions?: string[];
}

export interface SearchResultItem {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'post' | 'question';
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * 발견 피드 타입
 */
export interface DiscoverFeed {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
  createdAt: string;
}

export interface DiscoverFeedResponse {
  feeds: DiscoverFeed[];
  hasNext: boolean;
}
