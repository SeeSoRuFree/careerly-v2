/**
 * Block API 타입 정의
 */

import type { User } from './rest.types';

/**
 * 차단 응답
 */
export interface BlockResponse {
  success: boolean;
  blocked: boolean;
  message: string;
}

/**
 * 차단 해제 응답
 */
export interface UnblockResponse {
  success: boolean;
  blocked: boolean;
  message: string;
}

/**
 * 차단 상태 확인 응답
 */
export interface IsBlockedResponse {
  blocked: boolean;
}

/**
 * 차단된 사용자 정보
 */
export interface BlockedUser {
  id: number;
  blockinguserid: number;
  blockeduserid: number;
  blocked_user: User;
  createdat: string;
}

/**
 * 차단 목록 페이지네이션 응답
 */
export interface PaginatedBlockedUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlockedUser[];
}
