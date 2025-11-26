/**
 * Questions & Answers API 타입 정의
 */

/**
 * 작성자 정보
 */
export interface Author {
  id: number;
  name: string;
  email: string;
  image_url: string | null;
  headline: string | null;
}

/**
 * 답변 정보
 */
export interface Answer {
  id: number;
  questionid: number;
  userid: number;
  author: Author | null;
  content: string;
  isdeleted: number;
  createdat: string;
  updatedat: string;
}

/**
 * 질문 상세 정보
 */
export interface Question {
  id: number;
  userid: number;
  author: Author | null;
  title: string;
  description: string;
  status: number;
  ispublic: number;
  isfiltered: number;
  isdeleted: number;
  answers: Answer[];
  createdat: string;
  updatedat: string;
}

/**
 * 질문 목록 아이템
 */
export interface QuestionListItem {
  id: number;
  userid: number;
  author: Author | null;
  title: string;
  description: string;
  status: number;
  answer_count: number;
  answers: Answer[];
  ispublic: number;
  createdat: string;
  updatedat: string;
}

/**
 * 질문 생성 요청
 */
export interface QuestionCreateRequest {
  title: string;
  description: string;
  ispublic?: number;
}

/**
 * 질문 수정 요청
 */
export interface QuestionUpdateRequest {
  title?: string;
  description?: string;
  ispublic?: number;
  status?: number;
}

/**
 * 답변 생성 요청
 */
export interface AnswerCreateRequest {
  questionid: number;
  content: string;
}

/**
 * 답변 수정 요청
 */
export interface AnswerUpdateRequest {
  content: string;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedQuestionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: QuestionListItem[];
}

export interface PaginatedAnswerResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Answer[];
}
