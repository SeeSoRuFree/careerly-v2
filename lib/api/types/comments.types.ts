/**
 * Comments API 타입 정의
 */

/**
 * 댓글 정보
 */
export interface Comment {
  id: number;
  postid: number;
  parentcommentid: number;
  depth: number;
  userid: number;
  author_name: string;
  content: string;
  ispostwriter: number;
  isdeleted: number;
  createdat: string;
  updatedat: string;
}

/**
 * 댓글 생성 요청
 */
export interface CommentCreateRequest {
  postid: number;
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
