/**
 * Somoon API 타입 정의
 */

/**
 * Somoon 콘텐츠 타입
 */
export type SomoonContentType = 'book' | 'blog' | 'course' | 'job' | 'news' | 'video';

/**
 * Somoon 추가 정보
 */
export interface SomoonAdditionalInfo {
  /** 가격 */
  price: number | null;
  /** 저자 */
  author: string | null;
  /** 이미지 URL */
  image_url: string | null;
  /** 출판사 */
  publisher: string | null;
  /** 출판일 */
  published_date: string | null;
}

/**
 * Somoon 분석 JSON
 */
export interface SomoonAnalysisJson {
  /** 요약 (한 줄 요약 포함) */
  요약: string;
  /** 직군 목록 */
  직군: string[];
  /** 키워드 목록 */
  키워드: string[];
  /** 관련 기술 스택 */
  관련기술: string[];
  /** 긴 글 요약 (상세 요약) */
  긴글요약: string;
  /** 독자 대상 (경력 수준) */
  독자대상: string[];
  /** 주요 주제 */
  주요주제: string;
  /** 콘텐츠 유형 */
  콘텐츠_유형: string;
  /** 사용하는 언어 및 프레임워크 */
  사용하는_언어_및_프레임워크: string[];
}

/**
 * Somoon 분석 정보
 */
export interface SomoonAnalysis {
  /** 분석 ID */
  id: number;
  /** 콘텐츠 타입 */
  content_type: string | null;
  /** 분석 JSON */
  analysis_json: SomoonAnalysisJson;
  /** 생성일 */
  created_at: string;
  /** 수정일 */
  updated_at: string;
}

/**
 * Somoon 회사 정보
 */
export interface SomoonCompanyInfo {
  /** 회사 ID */
  id: number;
  /** 회사명 */
  name: string;
  /** 회사 기호 */
  sign: string;
  /** 로고 URL */
  logo_url: string | null;
}

/**
 * Somoon Daily Content 아이템
 */
export interface SomoonDailyContent {
  /** 콘텐츠 ID */
  id: number;
  /** 제목 */
  title: string;
  /** URL */
  url: string;
  /** 콘텐츠 타입 */
  content_type: SomoonContentType;
  /** 콘텐츠 타입 표시명 */
  content_type_display: string;
  /** 소스 */
  source: string;
  /** 회사명 */
  company: string;
  /** 카테고리 */
  category: string;
  /** 태그 목록 */
  tags: string[];
  /** 생성일 */
  created_at: string;
  /** 수정일 */
  updated_at: string;
  /** 추가 정보 */
  additional_info: SomoonAdditionalInfo;
  /** 분석 정보 */
  analysis: SomoonAnalysis;
  /** 회사 정보 */
  company_info: SomoonCompanyInfo;
}

/**
 * Somoon 페이지네이션 응답
 */
export interface SomoonPaginatedResponse<T> {
  /** 전체 아이템 수 */
  count: number;
  /** 다음 페이지 URL */
  next: string | null;
  /** 이전 페이지 URL */
  previous: string | null;
  /** 결과 목록 */
  results: T[];
}

/**
 * Daily Contents 조회 파라미터
 */
export interface GetDailyContentsParams {
  /** 페이지 번호 */
  page?: number;
  /** 페이지당 아이템 수 */
  page_size?: number;
}

/**
 * Somoon Job 아이템
 */
export interface SomoonJobItem {
  /** Job ID */
  id: number;
  /** 제목 */
  title: string;
  /** URL */
  url: string;
  /** 콘텐츠 타입 */
  content_type: 'job';
  /** 콘텐츠 타입 표시명 */
  content_type_display: string;
  /** 소스 */
  source: string;
  /** 회사명 */
  company: string;
  /** 카테고리 */
  category: string;
  /** 태그 목록 */
  tags: string[];
  /** 생성일 */
  created_at: string;
  /** 수정일 */
  updated_at: string;
  /** 추가 정보 */
  additional_info: SomoonAdditionalInfo;
  /** 분석 정보 */
  analysis: SomoonAnalysis;
  /** 회사 정보 */
  company_info: SomoonCompanyInfo;
}

/**
 * Daily Jobs 조회 파라미터
 */
export interface GetDailyJobsParams {
  /** 페이지 번호 */
  page?: number;
  /** 페이지당 아이템 수 */
  page_size?: number;
}
