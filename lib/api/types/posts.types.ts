/**
 * Posts API 타입 정의
 */

import type { User } from './rest.types';

/**
 * 게시물 타입 enum
 */
export enum PostType {
  GENERAL = 0,
  NOTICE = 1,
  EVENT = 2,
  AI_CHAT_SESSION = 10, // AI 대화 세션 포스트
}

/**
 * 게시물 상세 정보
 */
export interface Post {
  id: number;
  userid: number;
  author: User | null; // 삭제된 사용자의 경우 null 가능
  title: string | null; // DB에 NULL 데이터가 있을 수 있음
  description: string;
  descriptionhtml: string;
  posttype: PostType;
  articleid: number | null;
  isdeleted: number;
  createdat: string;
  updatedat: string;
  comment_count?: number;
  like_count: number;
  save_count: number;
  view_count: number;
  repost_count: number;
  is_liked: boolean;
  is_saved: boolean;
  is_reposted: boolean;
  images?: string[];
  chat_session_id?: string; // AI 대화 세션 ID (posttype=10일 때 사용)
}

/**
 * 게시물 목록 조회
 */
export interface PostListItem {
  id: number;
  userid: number;
  author: User | null; // 삭제된 사용자의 경우 null 가능
  title: string | null; // DB에 NULL 데이터가 있을 수 있음
  description: string;
  descriptionhtml?: string;
  posttype: PostType;
  isdeleted: number;
  createdat: string;
  updatedat: string;
  comment_count: number;
  like_count: number;
  save_count: number;
  view_count: number;
  repost_count: number;
  is_liked: boolean;
  is_saved: boolean;
  is_reposted: boolean;
  images?: string[];
  chat_session_id?: string; // AI 대화 세션 ID (posttype=10일 때 사용)
}

/**
 * 게시물 생성 요청
 */
export interface PostCreateRequest {
  title?: string;
  description: string;
  descriptionhtml?: string;
  posttype?: PostType;
  articleid?: number;
  images?: string[];
}

/**
 * 게시물 수정 요청
 */
export interface PostUpdateRequest {
  title?: string;
  description?: string;
  descriptionhtml?: string;
  posttype?: PostType;
  articleid?: number;
}

/**
 * 이미지 업로드 응답
 */
export interface ImageUploadResponse {
  success: boolean;
  image_url: string;
  image_id: number;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedPostResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostListItem[];
}

/**
 * 좋아요한 사용자 정보
 */
export interface LikerUser {
  id: number;
  profile_id: number | null;
  name: string | null;
  image_url: string | null;
  small_image_url: string | null;
  headline: string | null;
}

/**
 * 좋아요한 사용자 항목
 */
export interface Liker {
  id: number;
  user: LikerUser | null;
  createdat?: string;
}

/**
 * 좋아요한 사용자 목록 페이지네이션 응답
 */
export interface PaginatedLikersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Liker[];
}
