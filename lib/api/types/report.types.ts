/**
 * Report API 타입 정의
 */

/**
 * 신고할 콘텐츠 타입
 */
export const CONTENT_TYPE = {
  PROFILE: 0,
  POST: 1,
  QUESTION: 2,
  POLL: 3,
  COMMENT: 4,
  ANSWER: 5,
  POLL_COMMENT: 6,
} as const;

export type ContentType = typeof CONTENT_TYPE[keyof typeof CONTENT_TYPE];

/**
 * 신고 요청
 */
export interface ReportRequest {
  content_type: ContentType;
  content_id: number;
}

/**
 * 신고 응답
 */
export interface ReportResponse {
  success: boolean;
  reported: boolean;
  message: string;
}
