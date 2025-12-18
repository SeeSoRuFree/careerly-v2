'use client';

import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useChatSessionWithFallback } from '@/lib/api';
import type { ChatCitation } from '@/lib/api';
import { cn } from '@/lib/utils';

// 컴포넌트 import
import { SearchQueryHeader } from '@/components/ui/search-query-header';
import { ThreadActionBar } from '@/components/ui/thread-action-bar';
import { AnswerResponsePanel } from '@/components/ui/answer-response-panel';
import { CitationSourceList, type CitationSource } from '@/components/ui/citation-source-list';
import { RelatedQueriesSection, type RelatedQuery } from '@/components/ui/related-queries-section';
import { SuggestedFollowUpInput } from '@/components/ui/suggested-follow-up-input';
import { ViewModeToggle, type ViewMode } from '@/components/ui/view-mode-toggle';
import { SearchResultItem } from '@/components/ui/search-result-item';
import { CommunityShareCTA } from '@/components/ui/community-share-cta';

// Mock Related Queries
const MOCK_RELATED_QUERIES: RelatedQuery[] = [
  {
    id: 'rq1',
    queryText: '프론트엔드 개발자 경력별 평균 연봉과 연봉 협상 전략은?',
    href: '/search?q=프론트엔드+개발자+연봉+협상',
  },
  {
    id: 'rq2',
    queryText: 'React vs Vue.js 2024년 기준 어떤 프레임워크를 선택해야 할까요?',
    href: '/search?q=React+vs+Vue+2024',
  },
  {
    id: 'rq3',
    queryText: '채용 담당자가 주목하는 프론트엔드 포트폴리오 작성법',
    href: '/search?q=프론트엔드+포트폴리오+작성법',
  },
];

function SessionContent() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('answer');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [followUpValue, setFollowUpValue] = useState('');

  // 세션 조회 (인증 API 먼저 시도 → 실패 시 공개 API fallback)
  const { data: session, isLoading, error } = useChatSessionWithFallback(
    sessionId,
    { retry: false }
  );

  // 핸들러들
  const handleShare = () => {
    // 공유 기능은 ThreadActionBar에서 처리
    console.log('Share thread');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShareToCommunity = () => {
    // 공유 성공 시 세션 데이터 리프레시 (shared_post_id 업데이트)
    // React Query가 자동으로 캐시를 업데이트할 것이므로 별도 처리 불필요
  };

  const handleFollowUpSubmit = () => {
    if (!followUpValue.trim()) return;
    router.push(`/search?q=${encodeURIComponent(followUpValue.trim())}`);
    setFollowUpValue('');
  };

  const handleRelatedQueryClick = (relatedQuery: RelatedQuery) => {
    router.push(`/search?q=${encodeURIComponent(relatedQuery.queryText)}`);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-500" />
        <p className="text-slate-500">세션 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error || !session) {
    const isAuthError = error?.message?.includes('401') || error?.message?.includes('인증');
    const isNotFound = error?.message?.includes('404') || error?.message?.includes('찾을 수 없');

    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className={cn(
            "p-6 rounded-lg border",
            isAuthError ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
          )}>
            <div className="flex items-start gap-3">
              <AlertCircle className={cn(
                "h-6 w-6 flex-shrink-0 mt-0.5",
                isAuthError ? "text-amber-600" : "text-red-600"
              )} />
              <div className="flex-1">
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  isAuthError ? "text-amber-900" : "text-red-900"
                )}>
                  {isNotFound ? '세션을 찾을 수 없습니다' : isAuthError ? '로그인이 필요합니다' : '오류가 발생했습니다'}
                </h3>
                <p className={cn(
                  "text-sm mb-4",
                  isAuthError ? "text-amber-700" : "text-red-700"
                )}>
                  {error?.message || '세션 정보를 불러올 수 없습니다.'}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium text-white rounded-md transition-colors",
                    isAuthError ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 첫 번째 메시지 (사용자 질문)와 두 번째 메시지 (AI 답변) 추출
  const userMessage = session.messages.find(m => m.role === 'user');
  const assistantMessage = session.messages.find(m => m.role === 'assistant');

  if (!userMessage || !assistantMessage) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">유효하지 않은 세션입니다.</p>
      </div>
    );
  }

  const query = userMessage.content;
  const answer = assistantMessage.content;
  const sources = assistantMessage.sources?.all || [];

  // Citations 변환
  const citationSources: CitationSource[] = sources.map((url, index) => ({
    id: `citation-${index + 1}`,
    title: extractTitleFromUrl(url),
    href: url,
    faviconUrl: undefined,
  }));

  // 커뮤니티 공유 상태 확인
  const isSharedToCommunity = !!session.shared_post_id;
  const sharedPostId = session.shared_post_id;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* SearchQueryHeader */}
        <SearchQueryHeader
          queryText={query}
          className="mb-3 border-b-0"
        />

        {/* 컨트롤 바 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {/* 세션 정보 표시 */}
            <div className="text-xs text-slate-500">
              {new Date(session.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* 우측: ViewModeToggle + ThreadActionBar */}
          <div className="flex items-center gap-3">
            <ViewModeToggle
              mode={viewMode}
              onChange={setViewMode}
            />
            <ThreadActionBar
              sessionId={sessionId}
              isPublic={session.is_public}
              onShare={handleShare}
              onShareToCommunity={handleShareToCommunity}
              onBookmark={handleBookmark}
              isBookmarked={isBookmarked}
              isSharedToCommunity={isSharedToCommunity}
            />
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="space-y-6">
          {viewMode === 'answer' && (
            <>
              {/* 답변 */}
              <AnswerResponsePanel
                answerHtml={answer}
                loading={false}
                error={undefined}
                className="border-0 shadow-none bg-transparent p-0"
                messageId={assistantMessage.id}
                currentFeedback={assistantMessage.is_liked}
              />

              {/* CitationSourceList */}
              {citationSources.length > 0 && (
                <div className="py-4 border-t border-slate-200">
                  <CitationSourceList sources={citationSources} />
                </div>
              )}

              {/* 커뮤니티 공유 CTA */}
              <div className="py-6 border-t border-slate-200">
                <CommunityShareCTA
                  sessionId={sessionId}
                  isShared={isSharedToCommunity}
                  sharedPostId={sharedPostId}
                  onShareSuccess={handleShareToCommunity}
                />
              </div>
            </>
          )}

          {/* Sources 모드 */}
          {viewMode === 'sources' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                검색 결과 ({citationSources.length}개)
              </h2>
              {citationSources.map((source) => (
                <SearchResultItem
                  key={source.id}
                  title={source.title}
                  snippet=""
                  href={source.href || ''}
                  faviconUrl={source.faviconUrl}
                />
              ))}
            </div>
          )}

          {/* RelatedQueriesSection */}
          <div className="py-6 border-t border-slate-200">
            <RelatedQueriesSection
              relatedQueries={MOCK_RELATED_QUERIES}
              onQueryClick={handleRelatedQueryClick}
            />
          </div>

          {/* SuggestedFollowUpInput */}
          <div className="py-6 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              추가 질문하기
            </h3>
            <SuggestedFollowUpInput
              value={followUpValue}
              onChange={(value) => setFollowUpValue(value)}
              onSubmit={handleFollowUpSubmit}
              placeholder="더 궁금한 점이 있으신가요?"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// URL에서 제목 추출 헬퍼 함수
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');

    if (hostname.includes('careerly')) {
      return 'Careerly 아티클';
    }

    return hostname
      .split('.')
      .slice(0, -1)
      .join('.')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Reference';
  } catch {
    return 'Reference';
  }
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-500" />
          <p className="text-slate-500">로딩 중...</p>
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
