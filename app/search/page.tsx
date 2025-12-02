'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { Loader2, Search, Sparkles, Database, Globe, FileText, CheckCircle2 } from 'lucide-react';
import { streamChatMessage } from '@/lib/api/services/chat.service';
import type { SSEStatusStep, SSECompleteEvent, ChatCitation } from '@/lib/api';
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

// 상태 step에 따른 아이콘과 메시지 매핑
const STATUS_CONFIG: Record<SSEStatusStep, {
  icon: React.ReactNode;
  defaultMessage: string;
  description: string;
}> = {
  intent: {
    icon: <Sparkles className="h-5 w-5" />,
    defaultMessage: '질문을 분석하고 있어요',
    description: '어떤 정보가 필요한지 파악 중...',
  },
  searching: {
    icon: <Search className="h-5 w-5" />,
    defaultMessage: '관련 자료를 검색하고 있어요',
    description: '커리어리와 소문 데이터에서 검색 중...',
  },
  generating: {
    icon: <Sparkles className="h-5 w-5" />,
    defaultMessage: '답변을 작성하고 있어요',
    description: '수집한 정보를 바탕으로 답변 생성 중...',
  },
};

// 에이전트 활동 표시 컴포넌트
interface AgentActivityProps {
  status: { step: SSEStatusStep; message: string } | null;
  sources: string[];
  isStreaming: boolean;
  streamingContent: string;
}

function AgentActivityIndicator({ status, sources, isStreaming, streamingContent }: AgentActivityProps) {
  if (!isStreaming && !status) return null;

  // 검색 완료 후 답변 생성 중일 때
  const isGenerating = status?.step === 'generating' || streamingContent.length > 0;

  // 데이터 소스 분류
  const careerlyCount = sources.filter(s => s.includes('careerly')).length;
  const somoonCount = sources.filter(s => s.includes('somoon') || s.includes('document')).length;
  const webCount = sources.filter(s => !s.includes('careerly') && !s.includes('somoon') && !s.includes('document')).length;

  // isStreaming이 true인데 status가 아직 없으면 기본 상태 표시
  const showInitialState = isStreaming && !status && !streamingContent;

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
      {/* 초기 상태 - 에이전트 시작 중 */}
      {showInitialState && (
        <div className="flex items-start gap-4 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-blue-100">
            <Sparkles className="h-5 w-5 text-teal-600 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900">AI 에이전트를 시작하고 있어요</p>
            <p className="text-sm text-slate-500 mt-0.5">
              잠시만 기다려주세요, 질문을 분석하고 있습니다...
            </p>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
        </div>
      )}

      {/* 메인 상태 표시 */}
      {status && !streamingContent && (
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full",
            status.step === 'intent' && "bg-purple-100 text-purple-600",
            status.step === 'searching' && "bg-blue-100 text-blue-600",
            status.step === 'generating' && "bg-teal-100 text-teal-600"
          )}>
            {STATUS_CONFIG[status.step]?.icon}
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900">
              {status.message || STATUS_CONFIG[status.step]?.defaultMessage}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              {STATUS_CONFIG[status.step]?.description}
            </p>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      )}

      {/* 데이터 소스 진행 상황 - 초기 상태 또는 검색 중일 때 표시 */}
      {(showInitialState || status?.step === 'searching' || sources.length > 0) && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          {/* 커리어리 데이터 */}
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg transition-all",
            careerlyCount > 0 ? "bg-teal-50 border border-teal-200" : "bg-slate-50 border border-slate-100"
          )}>
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              careerlyCount > 0 ? "bg-teal-100 text-teal-600" : "bg-slate-200 text-slate-400"
            )}>
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs font-medium",
                careerlyCount > 0 ? "text-teal-700" : "text-slate-500"
              )}>
                커리어리
              </p>
              {careerlyCount > 0 ? (
                <p className="text-sm font-semibold text-teal-600">{careerlyCount}개 발견</p>
              ) : (showInitialState || status?.step === 'searching') ? (
                <p className="text-xs text-slate-400 animate-pulse">검색 대기 중...</p>
              ) : (
                <p className="text-xs text-slate-400">-</p>
              )}
            </div>
            {careerlyCount > 0 && (
              <CheckCircle2 className="h-4 w-4 text-teal-500 flex-shrink-0" />
            )}
          </div>

          {/* 소문 데이터 */}
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg transition-all",
            somoonCount > 0 ? "bg-purple-50 border border-purple-200" : "bg-slate-50 border border-slate-100"
          )}>
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              somoonCount > 0 ? "bg-purple-100 text-purple-600" : "bg-slate-200 text-slate-400"
            )}>
              <Database className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs font-medium",
                somoonCount > 0 ? "text-purple-700" : "text-slate-500"
              )}>
                소문 RAG
              </p>
              {somoonCount > 0 ? (
                <p className="text-sm font-semibold text-purple-600">{somoonCount}개 발견</p>
              ) : (showInitialState || status?.step === 'searching') ? (
                <p className="text-xs text-slate-400 animate-pulse">검색 대기 중...</p>
              ) : (
                <p className="text-xs text-slate-400">-</p>
              )}
            </div>
            {somoonCount > 0 && (
              <CheckCircle2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
            )}
          </div>

          {/* 웹 검색 */}
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg transition-all",
            webCount > 0 ? "bg-blue-50 border border-blue-200" : "bg-slate-50 border border-slate-100"
          )}>
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              webCount > 0 ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-400"
            )}>
              <Globe className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs font-medium",
                webCount > 0 ? "text-blue-700" : "text-slate-500"
              )}>
                웹 검색
              </p>
              {webCount > 0 ? (
                <p className="text-sm font-semibold text-blue-600">{webCount}개 발견</p>
              ) : (showInitialState || status?.step === 'searching') ? (
                <p className="text-xs text-slate-400 animate-pulse">검색 대기 중...</p>
              ) : (
                <p className="text-xs text-slate-400">-</p>
              )}
            </div>
            {webCount > 0 && (
              <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
        </div>
      )}

      {/* 답변 생성 중 표시 */}
      {streamingContent && (
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-teal-700">답변을 작성하고 있어요</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse delay-100" />
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse delay-200" />
          </div>
        </div>
      )}
    </div>
  );
}

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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('answer');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [followUpValue, setFollowUpValue] = useState('');

  // Streaming State
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingSources, setStreamingSources] = useState<string[]>([]);
  const [streamStatus, setStreamStatus] = useState<{
    step: SSEStatusStep;
    message: string;
  } | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 완료된 답변 저장
  const [completedAnswer, setCompletedAnswer] = useState<string>('');
  const [completedSources, setCompletedSources] = useState<string[]>([]);
  const [completedMetadata, setCompletedMetadata] = useState<SSECompleteEvent | null>(null);

  // Cleanup ref
  const cleanupRef = useRef<(() => void) | null>(null);
  // 이미 요청 중인 쿼리 추적 (중복 요청 방지)
  const currentQueryRef = useRef<string | null>(null);
  // isStreaming을 ref로도 추적 (useCallback 의존성 문제 해결)
  const isStreamingRef = useRef(false);

  // 스트리밍 시작 함수
  const startStreaming = useCallback((queryText: string, existingSessionId?: string | null) => {
    const trimmedQuery = queryText.trim();
    if (!trimmedQuery) return;

    // 중복 요청 방지 (같은 쿼리로 이미 요청 중인 경우)
    if (currentQueryRef.current === trimmedQuery && isStreamingRef.current) {
      return;
    }

    // 이전 스트림 정리
    cleanupRef.current?.();
    currentQueryRef.current = trimmedQuery;

    // 상태 초기화
    isStreamingRef.current = true;
    setIsStreaming(true);
    setStreamingContent('');
    setStreamingSources([]);
    setStreamStatus(null);
    setError(null);
    setCompletedAnswer('');
    setCompletedSources([]);
    setCompletedMetadata(null);

    // 스트림 시작
    const cleanup = streamChatMessage(queryText.trim(), existingSessionId ?? null, {
      onStatus: (step, message) => {
        setStreamStatus({ step, message });
      },
      onToken: (token) => {
        setStreamStatus(null);
        setStreamingContent((prev) => prev + token);
      },
      onSources: (sources) => {
        setStreamingSources(sources);
      },
      onComplete: (metadata: SSECompleteEvent) => {
        // 최종 답변 저장
        // 1. streamingContent가 있으면 그것을 사용 (token 스트리밍 방식)
        // 2. 없으면 metadata.answer 사용 (complete에서 전체 답변 전송 방식)
        setStreamingContent((currentContent) => {
          const finalAnswer = currentContent || metadata.answer || '';
          if (finalAnswer) {
            setCompletedAnswer(finalAnswer);
          }
          return '';
        });

        setCompletedSources(streamingSources);
        setCompletedMetadata(metadata);

        // 세션 ID 업데이트
        if (metadata.session_id) {
          setSessionId(metadata.session_id);
        }

        setStreamStatus(null);
        isStreamingRef.current = false;
        setIsStreaming(false);
        cleanupRef.current = null;
        currentQueryRef.current = null;
      },
      onError: (errorMsg) => {
        console.error('Streaming error:', errorMsg);
        setError(errorMsg);
        setStreamStatus(null);
        setStreamingContent('');
        isStreamingRef.current = false;
        setIsStreaming(false);
        cleanupRef.current = null;
        currentQueryRef.current = null;
      },
    });

    cleanupRef.current = cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 쿼리 변경 시 스트리밍 시작
  useEffect(() => {
    if (!query || query.trim().length === 0) return;
    startStreaming(query);

    return () => {
      cleanupRef.current?.();
      // cleanup 시 상태 초기화 (React Strict Mode 대응)
      currentQueryRef.current = null;
      isStreamingRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // 핸들러들
  const handleEdit = () => {
    console.log('Edit query');
  };

  const handleShare = () => {
    console.log('Share thread');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleExport = () => {
    console.log('Export thread');
  };

  const handleRewrite = () => {
    if (query) {
      startStreaming(query, sessionId);
    }
  };

  const handleRetry = () => {
    if (query) {
      startStreaming(query, sessionId);
    }
  };

  const handleFollowUpSubmit = () => {
    if (!followUpValue.trim()) return;
    router.push(`/search?q=${encodeURIComponent(followUpValue.trim())}`);
    setFollowUpValue('');
  };

  const handleRelatedQueryClick = (relatedQuery: RelatedQuery) => {
    router.push(`/search?q=${encodeURIComponent(relatedQuery.queryText)}`);
  };

  // 표시할 답변 (스트리밍 중이면 스트리밍 컨텐츠, 아니면 완료된 답변)
  const displayAnswer = streamingContent || completedAnswer;
  const displaySources = streamingSources.length > 0 ? streamingSources : completedSources;

  // Citations 변환
  const citationSources: CitationSource[] = displaySources.map((url, index) => ({
    id: `citation-${index + 1}`,
    title: extractTitleFromUrl(url),
    href: url,
    faviconUrl: undefined,
  }));

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">검색어를 입력해주세요.</p>
      </div>
    );
  }

  const isLoading = isStreaming && !streamingContent;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* SearchQueryHeader */}
        <SearchQueryHeader
          queryText={query}
          onEdit={handleEdit}
          className="mb-3 border-b-0"
        />

        {/* 컨트롤 바 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {/* 스트리밍 상태 표시 배지 */}
            {isStreaming && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span className="text-xs font-medium text-teal-700">AI 답변 생성 중</span>
              </div>
            )}
          </div>

          {/* 우측: ViewModeToggle + ThreadActionBar */}
          <div className="flex items-center gap-3">
            <ViewModeToggle
              mode={viewMode}
              onChange={setViewMode}
            />
            <ThreadActionBar
              onShare={handleShare}
              onBookmark={handleBookmark}
              onExport={handleExport}
              onRewrite={handleRewrite}
              isBookmarked={isBookmarked}
            />
          </div>
        </div>

        {/* 에이전트 활동 표시 */}
        <AgentActivityIndicator
          status={streamStatus}
          sources={displaySources}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
        />

        {/* 에러 표시 */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 메인 컨텐츠 */}
        <div className="space-y-6">
          {viewMode === 'answer' && (
            <>
              {/* 스트리밍 중인 답변 또는 완료된 답변 */}
              {streamingContent ? (
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                    {streamingContent}
                    <span className="inline-block w-0.5 h-5 bg-teal-500 animate-pulse ml-0.5 align-text-bottom" />
                  </div>
                </div>
              ) : completedAnswer ? (
                <AnswerResponsePanel
                  answerHtml={completedAnswer}
                  loading={false}
                  error={undefined}
                  onRetry={handleRetry}
                  className="border-0 shadow-none bg-transparent p-0"
                />
              ) : isLoading ? (
                <div className="py-8 text-center text-slate-500">
                  {/* 로딩은 AgentActivityIndicator에서 처리 */}
                </div>
              ) : null}

              {/* CitationSourceList */}
              {!isStreaming && completedAnswer && citationSources.length > 0 && (
                <div className="py-4 border-t border-slate-200">
                  <CitationSourceList sources={citationSources} />
                </div>
              )}
            </>
          )}

          {/* Sources 모드 */}
          {viewMode === 'sources' && !isStreaming && completedAnswer && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                검색 결과 ({citationSources.length}개)
              </h2>
              {citationSources.map((source) => (
                <SearchResultItem
                  key={source.id}
                  title={source.title}
                  snippet=""
                  href={source.href}
                  faviconUrl={source.faviconUrl}
                />
              ))}
            </div>
          )}

          {/* RelatedQueriesSection */}
          {!isStreaming && completedAnswer && (
            <div className="py-6 border-t border-slate-200">
              <RelatedQueriesSection
                relatedQueries={MOCK_RELATED_QUERIES}
                onQueryClick={handleRelatedQueryClick}
              />
            </div>
          )}

          {/* SuggestedFollowUpInput */}
          {!isStreaming && completedAnswer && (
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
          )}
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-500" />
          <p className="text-slate-500">검색 중...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
