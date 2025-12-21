/**
 * Comments API 타입 정의
 */

/**
 * 댓글 정보
 */
export interface Comment {
  id: number;
  post_id: number;
  parentcommentid: number;
  depth: number;
  user_id: number;
  author_name: string;
  author_profile_id?: number;
  author_image_url?: string;
  author_headline?: string;
  content: string;
  ispostwriter: number;
  isdeleted: number;
  like_count: number;
  is_liked: boolean;
  createdat: string;
  updatedat: string;
}

/**
 * 댓글 생성 요청
 */
export interface CommentCreateRequest {
  post_id: number;
  parentcommentid?: number;
  content: string;
}

/**
 * 댓글 수정 요청
 */
export interface CommentUpdateRequest {
  content: string;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedCommentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Comment[];
}
