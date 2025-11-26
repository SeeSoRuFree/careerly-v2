/**
 * 프로필 관련 API 타입 정의
 * API 응답 구조: /api/v1/profiles/{id}/ 및 /api/v1/users/{id}/profile/
 */

/**
 * 경력 정보
 */
export interface Career {
  id: number;
  type: string;
  company: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: number;
  url: string | null;
  display_sequence: number;
}

/**
 * 학력 정보
 */
export interface Education {
  id: number;
  type: string;
  institute: string;
  major: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: number;
  url: string | null;
  display_sequence: number;
}

/**
 * 스킬 정보
 */
export interface ProfileSkill {
  id: number;
  skill_id: number;
  name: string;
  category: string;
  second_category: string | null;
  display_sequence: number;
}

/**
 * 사이트/링크 정보
 */
export interface ProfileSite {
  id: number;
  name: string;
  url: string;
  description: string | null;
  display_sequence: number;
}

/**
 * 경력 기간 정보
 */
export interface CareerDuration {
  id: number;
  total_career_duration_months: number;
  career_year: number;
  has_career: number;
}

/**
 * 프로필 상세 정보 (API 응답)
 */
export interface ProfileDetail {
  id: number;
  name: string;
  image_url: string | null;
  headline: string | null;
  description: string | null;
  long_description: string | null;
  links: string | null;
  hashtags: string | null;
  open_to_work_status: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  careers: Career[];
  educations: Education[];
  skills: ProfileSkill[];
  sites: ProfileSite[];
  career_duration: CareerDuration | null;
}

/**
 * 프로필 요약 정보 (리스트용)
 */
export interface ProfileSummary {
  id: number;
  name: string;
  image_url: string | null;
  headline: string | null;
  user_id: number;
}

/**
 * 프로필 업데이트 요청
 */
export interface ProfileUpdateRequest {
  name?: string;
  headline?: string;
  description?: string;
  long_description?: string;
  open_to_work_status?: string;
}

/**
 * 경력 생성/수정 요청
 */
export interface CareerRequest {
  type: string;
  company: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  url?: string;
}

/**
 * 학력 생성/수정 요청
 */
export interface EducationRequest {
  type: string;
  institute: string;
  major: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  url?: string;
}
