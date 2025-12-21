/**
 * GA4 Event Tracking Utilities
 *
 * 이 파일은 GA4 이벤트 트래킹을 위한 유틸리티 함수들을 제공합니다.
 * 모든 이벤트는 gtag() 함수를 통해 전송됩니다.
 */

// GA4 Measurement ID
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-J6XDPVCN0G';

// gtag 타입 정의
type GtagCommand = 'config' | 'event' | 'set';

interface GtagEventParams {
  [key: string]: string | number | boolean | undefined | null;
}

declare global {
  interface Window {
    gtag?: (
      command: GtagCommand,
      targetOrEventName: string,
      params?: GtagEventParams
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * gtag 함수가 존재하는지 확인
 */
function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * GA4 User-ID 설정 (로그인 시 1회 호출)
 */
export function setUserId(userId: string): void {
  if (!isGtagAvailable()) return;

  window.gtag?.('config', GA_ID, {
    user_id: userId,
  });
}

/**
 * User-ID 초기화 (로그아웃 시)
 */
export function clearUserId(): void {
  if (!isGtagAvailable()) return;

  window.gtag?.('config', GA_ID, {
    user_id: undefined,
  });
}

/**
 * 커스텀 이벤트 전송
 */
export function trackEvent(
  eventName: string,
  params?: GtagEventParams
): void {
  if (!isGtagAvailable()) return;

  window.gtag?.('event', eventName, params);
}

// ============================================
// 인증 이벤트
// ============================================

type AuthMethod = 'email' | 'google' | 'linkedin' | 'apple' | 'kakao';

/**
 * 회원가입 퍼널 시작점 측정
 */
export function trackSignupStart(method: AuthMethod): void {
  trackEvent('signup_start', { method });
}

/**
 * 로그아웃 (세션 분석)
 */
export function trackLogout(sessionDuration: number): void {
  trackEvent('logout', { session_duration: sessionDuration });
}

// ============================================
// 게시글 이벤트
// ============================================

type SourceFeed = 'home' | 'search' | 'profile' | 'notification' | 'discover';

/**
 * 피드 노출 측정 (IntersectionObserver 기반)
 */
export function trackPostImpression(
  postId: string,
  authorId: string,
  feedPosition: number
): void {
  trackEvent('post_impression', {
    post_id: postId,
    author_id: authorId,
    feed_position: feedPosition,
  });
}

/**
 * 게시글 상세 조회 (CTR 계산용)
 */
export function trackPostDetailView(
  postId: string,
  authorId: string,
  sourceFeed: SourceFeed
): void {
  trackEvent('post_detail_view', {
    post_id: postId,
    author_id: authorId,
    source_feed: sourceFeed,
  });
}

type EntryPoint = 'community' | 'profile' | 'fab';

/**
 * 게시글 작성 퍼널 시작점
 */
export function trackPostCreateStart(entryPoint: EntryPoint): void {
  trackEvent('post_create_start', { entry_point: entryPoint });
}

// ============================================
// Q&A 이벤트
// ============================================

/**
 * Q&A 노출 측정
 */
export function trackQuestionImpression(
  questionId: string,
  feedPosition: number
): void {
  trackEvent('question_impression', {
    question_id: questionId,
    feed_position: feedPosition,
  });
}

/**
 * Q&A 상세 조회
 */
export function trackQuestionDetailView(
  questionId: string,
  sourceFeed: SourceFeed
): void {
  trackEvent('question_detail_view', {
    question_id: questionId,
    source_feed: sourceFeed,
  });
}

// ============================================
// 소셜 이벤트
// ============================================

type ContentType = 'post' | 'question';
type ShareMethod = 'copy_link' | 'native_share' | 'email';

/**
 * 바이럴 계수 측정 (공유)
 */
export function trackContentShare(
  contentType: ContentType,
  contentId: string,
  shareMethod: ShareMethod
): void {
  trackEvent('content_share', {
    content_type: contentType,
    content_id: contentId,
    share_method: shareMethod,
  });
}

// ============================================
// 프로필 이벤트
// ============================================

/**
 * 프로필 조회 트래픽 분석
 */
export function trackProfileView(
  profileUserId: string,
  isOwnProfile: boolean
): void {
  trackEvent('profile_view', {
    profile_user_id: profileUserId,
    is_own_profile: isOwnProfile,
  });
}

// ============================================
// AI 검색 이벤트
// ============================================

/**
 * AI 검색 시작
 */
export function trackAISearchStart(query: string): void {
  trackEvent('ai_search_start', { query });
}

/**
 * AI 검색 완료
 */
export function trackAISearchComplete(
  query: string,
  responseTime: number,
  sourceCount: number
): void {
  trackEvent('ai_search_complete', {
    query,
    response_time: responseTime,
    source_count: sourceCount,
  });
}

/**
 * AI 결과 출처 클릭
 */
export function trackAISourceClick(sourceUrl: string, position: number): void {
  trackEvent('ai_source_click', {
    source_url: sourceUrl,
    position,
  });
}

/**
 * AI 후속 질문 클릭
 */
export function trackAIFollowupClick(query: string): void {
  trackEvent('ai_followup_click', { query });
}

/**
 * AI 답변 북마크
 */
export function trackAIBookmark(threadId: string): void {
  trackEvent('ai_bookmark', { thread_id: threadId });
}

/**
 * AI 답변 공유
 */
export function trackAIShare(
  threadId: string,
  shareMethod: 'copy_link' | 'native_share'
): void {
  trackEvent('ai_share', {
    thread_id: threadId,
    share_method: shareMethod,
  });
}

/**
 * AI 답변 피드백 (좋아요/싫어요)
 */
export function trackAIFeedback(
  messageId: string,
  isLiked: boolean,
  hasDetailText: boolean = false
): void {
  trackEvent('ai_feedback', {
    message_id: messageId,
    is_liked: isLiked,
    feedback_type: isLiked ? 'positive' : 'negative',
    has_detail: hasDetailText,
  });
}

// ============================================
// 페이지 이벤트
// ============================================

type PageType = 'home' | 'search' | 'community' | 'profile' | 'discover' | 'settings' | 'bookmarks';

/**
 * 페이지 뷰 (체류시간 측정 기반)
 */
export function trackPageView(pageType: PageType, pagePath: string): void {
  trackEvent('page_view', {
    page_type: pageType,
    page_path: pagePath,
  });
}
