/**
 * Somoon Recruits API 타입 정의
 * recruits.somoon.ai:8000/data API
 */

/**
 * 콘텐츠 타입
 */
export type RecruitsContentType = 'blog' | 'lecture' | 'book';

/**
 * 콘텐츠 추가 정보
 */
export interface RecruitsContentAdditionalInfo {
  /** 콘텐츠 이미지 URL */
  image_url?: string;
  /** 저자 */
  author?: string;
  /** 가격 (도서) */
  price?: number | null;
  /** 출판사 (도서) */
  publisher?: string;
  /** 출판일 (도서) */
  published_date?: string | null;
}

/**
 * 콘텐츠 아이템
 */
export interface RecruitsContent {
  /** 콘텐츠 ID */
  id: number;
  /** 제목 */
  title: string;
  /** 콘텐츠 타입 */
  content_type: RecruitsContentType;
  /** 회사 sign */
  company_sign: string;
  /** 회사명 */
  company_title: string;
  /** 회사 로고 이미지 URL */
  company_image: string;
  /** 생성일 (YYYY-MM-DD) */
  created_at: string;
  /** 콘텐츠 URL */
  url: string;
  /** 요약 (분석된 경우) */
  summary?: string;
  /** 추가 정보 (이미지, 저자 등) */
  additional_info?: RecruitsContentAdditionalInfo;
}

/**
 * 콘텐츠 메인 조회 응답
 */
export interface RecruitsContentsMainResponse {
  contents: RecruitsContent[];
  total_count: number;
}

/**
 * 콘텐츠 메인 조회 파라미터
 */
export interface GetRecruitsContentsParams {
  /** 콘텐츠 타입 (필수): blog, lecture, book */
  content_type: RecruitsContentType;
  /** 시작일 (YYYY-MM-DD) */
  created_start?: string;
  /** 종료일 (YYYY-MM-DD) */
  created_end?: string;
  /** 회사 필터 (all 또는 쉼표로 구분된 회사 sign) */
  company?: string;
  /** 날짜 제한 없이 전체 조회 여부 */
  fetch_all?: boolean;
  /** 최대 조회 개수 (기본값: 100, 최대: 1000) */
  limit?: number;
}

/**
 * 직무 카테고리
 */
export type RecruitsJobCategory =
  | 'FRONTEND'
  | 'BACKEND'
  | 'AI'
  | 'ANDROID'
  | 'IOS'
  | 'DEVOPS'
  | 'GAME'
  | 'DATA_ANALYST'
  | 'PM'
  | 'DESIGN'
  | 'MARKETING'
  | 'BUSINESS';

/**
 * 채용공고 분석 속성 (jobs_attributes)
 */
export interface RecruitsJobAttributes {
  /** 직무 카테고리 */
  job_category?: RecruitsJobCategory;
  /** AI 관련 여부 */
  is_ai_related?: boolean;
  /** 필요 경력 */
  experience_level?: string;
  /** 필요 스킬 */
  required_skills?: string[];
  /** 우대 스킬 */
  preferred_skills?: string[];
  /** 업무 내용 요약 */
  job_summary?: string;
  /** 자격 요건 */
  qualifications?: string[];
  /** AI 카테고리 (ai-core, ai-enabled, traditional) */
  ai_category?: 'ai-core' | 'ai-enabled' | 'traditional';
}

/**
 * 채용공고 아이템
 */
export interface RecruitsJob {
  /** 채용공고 ID */
  id: number;
  /** 제목 */
  title: string;
  /** URL */
  url: string;
  /** 생성일 */
  created_at: string;
  /** 수정일 */
  updated_at: string;
  /** 회사명 */
  company_title: string;
  /** 분석된 채용공고 속성 */
  jobs_attributes?: RecruitsJobAttributes;
  /** 분석 완료 시간 */
  analyzed_at?: string;
}

/**
 * 회사별 채용공고 검색 파라미터
 */
export interface SearchCompaniesJobsParams {
  /** 쉼표로 구분된 회사 코드 목록 (예: toss,kakao,naver) */
  company_signs: string;
  /** 검색 키워드 */
  query?: string;
  /** 직무 카테고리 목록 */
  categories?: RecruitsJobCategory[];
  /** 페이지 번호 (기본값: 1) */
  page?: number;
  /** 페이지 크기 (기본값: 10) */
  size?: number;
  /** 진행중인 채용공고 여부 (최근 2일 이내 업데이트된 공고) */
  in_progress?: boolean;
  /** 시작일 (YYYY-MM-DD) */
  start_date?: string;
  /** 종료일 (YYYY-MM-DD) */
  end_date?: string;
}

/**
 * 채용공고 검색 결과 아이템
 */
export interface RecruitsSearchJobItem {
  id: number;
  title: string;
  url: string;
  created_at: string;
  updated_at: string;
  company_title: string;
  company_sign: string;
  company_image?: string;
  jobs_attributes?: RecruitsJobAttributes;
  summary?: string | null;
  full_summary?: string | null;
  job_category?: string | null;
}

/**
 * 채용공고 검색 응답 (search/companies)
 */
export interface RecruitsSearchJobsResponse {
  data: RecruitsSearchJobItem[];
  current_page: number;
  total_count: number;
}

/**
 * 키워드 검색 파라미터 (search/keyword)
 */
export interface SearchJobsByKeywordParams {
  /** 검색 키워드 (전체 검색 시 '*') */
  query: string;
  /** 페이지 번호 (필수) */
  page: number;
  /** 페이지 크기 */
  size?: number;
  /** 시작일 (YYYY-MM-DD) */
  start_date?: string;
  /** 종료일 (YYYY-MM-DD) */
  end_date?: string;
  /** 진행중인 공고만 */
  poststatus?: boolean;
}

/**
 * 키워드 검색 응답 (search/keyword)
 */
export interface RecruitsKeywordSearchResponse {
  data: RecruitsSearchJobItem[];
  current_page: number;
  total_count: number;
}

/**
 * 트렌드 리포트 응답
 */
export interface RecruitsTrendReportResponse {
  /** 리포트 제목 */
  title?: string;
  /** 요약 통계 */
  summary_stats?: {
    new_companies?: number;
    new_articles?: number;
    new_courses?: number;
    total_jobs_today?: number;
  };
  /** 리포트 내용 */
  report_content?: string;
  /** 생성 시간 */
  generated_at?: string;
  /** 분석 대상 날짜 */
  target_date?: string;
  /** 브리핑 목록 (job_category 없을 시) */
  briefings?: Array<{
    job_category: string;
    briefing: string;
    actual_data_date: string;
    job_count: number;
    job_change: number;
    created_at: string;
    updated_at: string;
  }>;
  /** 브리핑 내용 (단일 조회 시) */
  briefing?: string;
  /** 실제 데이터 날짜 (단일 조회 시) */
  actual_data_date?: string;
  /** 채용공고 수 (단일 조회 시) */
  job_count?: number;
  /** 전날 대비 변화 (단일 조회 시) */
  job_change?: number;
}

/**
 * 트렌드 리포트 조회 파라미터
 */
export interface GetTrendReportParams {
  /** 조회할 날짜 (YYYY-MM-DD 형식) */
  date?: string;
  /** 직군 카테고리 */
  job_category?: string;
}

/**
 * 회사 정보
 */
export interface RecruitsCompanyInfo {
  sign: string;
  name: string;
  thumbnail_image: string;
  company_type: string;
  interest_by_admin: boolean;
}

/**
 * 회사 정보 조회 응답
 */
export type RecruitsCompanyInfoResponse = RecruitsCompanyInfo[];

/**
 * 콘텐츠 랭킹 아이템
 */
export interface RecruitsContentRanking {
  company_sign: string;
  company_name: string;
  count: number;
  monthly_change?: number;
}

/**
 * 콘텐츠 랭킹 응답
 */
export interface RecruitsContentRankingResponse {
  rankings: RecruitsContentRanking[];
}

// ============================================
// V2 Main API Types (search/v2/main)
// ============================================

/**
 * V2 Main API - 일별 통계 (새 API 구조)
 */
export interface RecruitsV2DailyJobStats {
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 국내 채용공고 수 */
  domestic: number;
  /** 글로벌 채용공고 수 */
  global_jobs: number;
  /** 전체 채용공고 수 */
  total: number;
}

/**
 * V2 Main API 응답 (search/v2/main) - 통계 전용
 */
export interface RecruitsV2MainResponse {
  /** 전체 회사 수 */
  company_count: number;
  /** 전체 진행중인 채용공고 수 */
  open_jobs_count: number;
  /** 일별 채용공고 통계 (최근 8일) */
  daily_company_jobs: RecruitsV2DailyJobStats[];
}

// ============================================
// V2 Jobs List API Types (search/v2/jobs_list)
// ============================================

/**
 * V2 Jobs List API - 채용공고 아이템
 */
export interface RecruitsV2JobItem {
  /** 채용공고 ID */
  id: number;
  /** 제목 */
  title: string;
  /** URL */
  url: string;
  /** AI 요약 (빈 문자열일 수 있음) */
  summary: string;
  /** 생성일 (YYYY-MM-DD) */
  created_at: string;
}

/**
 * V2 Jobs List API - 회사별 채용공고 그룹
 */
export interface RecruitsV2CompanyJobGroup {
  /** 회사명 */
  company_name: string;
  /** 회사 sign */
  company_sign: string;
  /** 회사 로고 이미지 URL */
  company_image: string;
  /** 위치 (local 또는 global) */
  location: 'local' | 'global';
  /** 해당 회사의 채용공고 수 */
  job_count: number;
  /** 채용공고 목록 */
  jobs: RecruitsV2JobItem[];
}

/**
 * V2 Jobs List API - 페이지네이션 정보
 */
export interface RecruitsV2Pagination {
  /** 현재 페이지 번호 */
  page: number;
  /** 페이지당 아이템 수 */
  page_size: number;
  /** 전체 페이지 수 */
  total_pages: number;
  /** 전체 아이템 수 */
  total_count: number;
}

/**
 * V2 Jobs List API 요청 파라미터 (search/v2/jobs_list)
 */
export interface GetV2JobsListParams {
  /** 날짜 (YYYY-MM-DD 형식, 기본값: 오늘) */
  date?: string;
  /** 페이지 번호 (기본값: 1) */
  page?: number;
  /** 페이지당 채용공고 개수 (기본값: 50, 최대: 100) */
  page_size?: number;
  /** 대상 ('local': 국내 회사만, 'global': 글로벌 회사만, 기본값: 'local') */
  target?: 'local' | 'global';
  /** 회사 필터 (company_sign으로 필터링, 쉼표로 구분 가능) */
  company?: string;
}

/**
 * V2 Jobs List API 응답 (search/v2/jobs_list)
 */
export interface RecruitsV2JobsListResponse {
  /** 전체 채용공고 수 */
  total_count: number;
  /** 페이지네이션 정보 */
  pagination: RecruitsV2Pagination;
  /** 회사별 채용공고 목록 */
  jobs: RecruitsV2CompanyJobGroup[];
}

// ============================================
// Legacy Types (하위 호환성)
// ============================================

/**
 * @deprecated Use RecruitsV2DailyJobStats instead
 * V2 Main API - 일별 통계 (레거시)
 */
export interface RecruitsV2DailyStat {
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 해당 날짜의 채용공고 수 */
  count: number;
}

/**
 * @deprecated Use RecruitsV2CompanyJobCount instead
 * V2 Main API - 회사별 채용공고 데이터 (레거시)
 */
export interface RecruitsV2CompanyJobsData {
  /** 회사명 */
  company_title: string;
  /** 회사 sign */
  company_sign: string;
  /** 회사 로고 이미지 URL */
  company_image: string;
  /** 채용공고 목록 */
  jobs: RecruitsV2JobItem[];
  /** 위치 (글로벌/국내) */
  location?: string;
}

/**
 * @deprecated
 * V2 Main API - 회사별 채용공고 맵 (레거시)
 */
export type RecruitsV2CompanyJobsMap = Record<string, RecruitsV2CompanyJobsData>;

/**
 * @deprecated
 * V2 Main API - 일별 회사별 채용공고 (레거시)
 */
export interface RecruitsV2DailyCompanyJobs {
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 글로벌 기업 채용공고 (company_sign을 key로 하는 객체) */
  global_company_jobs: RecruitsV2CompanyJobsMap;
  /** 국내 기업 채용공고 (company_sign을 key로 하는 객체) */
  domestic_company_jobs: RecruitsV2CompanyJobsMap;
}

// ============================================
// Jobs/Contents ID Search API Types
// ============================================

/**
 * 채용공고 상세 정보 (search?ids=xxx)
 */
export interface RecruitsJobDetail {
  /** 채용공고 ID */
  id: number;
  /** 제목 */
  title: string;
  /** URL */
  url: string;
  /** 생성일 */
  created_at: string;
  /** 수정일 */
  updated_at: string;
  /** 회사명 */
  company_title: string;
  /** 회사 sign */
  company_sign: string;
  /** 회사 로고 이미지 URL */
  company_image?: string;
  /** AI 요약 */
  summary?: string | null;
  /** AI 상세 요약 */
  full_summary?: string | null;
  /** 직무 카테고리 */
  job_category?: string | null;
  /** 분석된 채용공고 속성 */
  jobs_attributes?: RecruitsJobAttributes;
}

/**
 * 채용공고 ID 검색 응답 (search?ids=xxx)
 */
export interface RecruitsJobsByIdsResponse {
  data: RecruitsJobDetail[];
  current_page: number;
  total_count: number;
}

/**
 * 콘텐츠 상세 정보 (search/contents_ids?ids=xxx)
 */
export interface RecruitsContentDetail {
  /** 콘텐츠 ID */
  id: number;
  /** 제목 */
  title: string;
  /** URL */
  url: string;
  /** 콘텐츠 타입 (blog, lecture, book) */
  content_type: RecruitsContentType;
  /** 소스 */
  source?: string | null;
  /** 전체 콘텐츠 내용 */
  content?: string;
  /** 카테고리 */
  category?: string;
  /** 태그 목록 */
  tags?: string[];
  /** 생성일 */
  created_at: string;
  /** 추가 정보 (이미지, 저자 등) */
  additional_info?: RecruitsContentAdditionalInfo | null;
  /** 회사명 */
  company_title: string;
  /** 회사 sign */
  company_sign: string;
  /** 회사 로고 이미지 URL */
  company_image: string;
  /** AI 요약 */
  summary?: string;
  /** AI 상세 요약 */
  full_summary?: string;
}

/**
 * 콘텐츠 ID 검색 응답 (search/contents_ids?ids=xxx)
 */
export interface RecruitsContentsByIdsResponse {
  data: RecruitsContentDetail[];
  current_page: number;
  total_count: number;
}
