'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { Loader2, Search, Sparkles, Database, Globe, FileText, CheckCircle2, LogIn, User, Wrench, Brain, Cpu, XCircle, Clock } from 'lucide-react';
import { streamChatMessage } from '@/lib/api/services/chat.service';
import type { SSEStatusStep, SSECompleteEvent, ChatCitation, SSEAgentProgressEvent, AgentProgressStatus } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useStore } from '@/hooks/useStore';

// 컴포넌트 import
import { SearchQueryHeader } from '@/components/ui/search-query-header';
import { ThreadActionBar } from '@/components/ui/thread-action-bar';
import { AnswerResponsePanel } from '@/components/ui/answer-response-panel';
import { CitationSourceList, type CitationSource } from '@/components/ui/citation-source-list';
import { RelatedQueriesSection, type RelatedQuery } from '@/components/ui/related-queries-section';
import { SuggestedFollowUpInput } from '@/components/ui/suggested-follow-up-input';
import { ViewModeToggle, type ViewMode } from '@/components/ui/view-mode-toggle';
import { SearchResultItem } from '@/components/ui/search-result-item';

// 상태 step에 따른 아이콘 매핑
const STATUS_ICONS: Record<SSEStatusStep, React.ReactNode> = {
  intent: <Sparkles className="h-4 w-4" />,
  routing: <Brain className="h-4 w-4" />,
  searching: <Search className="h-4 w-4" />,
  generating: <Sparkles className="h-4 w-4" />,
};

// 에이전트 카드 최소 표시 시간 (ms)
const AGENT_MIN_DISPLAY_TIME = 2500;

// 에이전트 아이콘 매핑
const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  database: Database,
  'file-text': FileText,
  globe: Globe,
  user: User,
  wrench: Wrench,
  brain: Brain,
  cpu: Cpu,
};

// 기본 아이콘
const DEFAULT_AGENT_ICON = Cpu;

// 상태 히스토리 아이템 타입
interface StatusHistoryItem {
  id: string;
  step: SSEStatusStep;
  message: string;
  timestamp: number;
}

// 에이전트 진행 상태 타입
interface AgentProgressItem {
  agent_type: string;
  agent_name: string;
  agent_description?: string;
  icon: string;
  color: string;
  status: AgentProgressStatus;
  execution_time_ms?: number;
  error?: string | null;
  is_fallback?: boolean;
  started_at: number;
  completed_at?: number;
}

// 에이전트 진행 상태 패널 Props
interface AgentProgressPanelProps {
  agents: Map<string, AgentProgressItem>;
  isStreaming: boolean;
}

// 개별 에이전트 카드 컴포넌트
function AgentCard({ agent }: { agent: AgentProgressItem }) {
  const IconComponent = AGENT_ICONS[agent.icon] || DEFAULT_AGENT_ICON;
  const isRunning = agent.status === 'running';
  const isSuccess = agent.status === 'success';
  const isFailed = agent.status === 'failed' || agent.status === 'timeout';

  // 실행 시간 포맷팅
  const formatExecutionTime = (ms?: number) => {
    if (!ms) return null;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}초`;
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2',
        isRunning && 'border-2 shadow-md',
        isSuccess && 'border-slate-200 bg-slate-50/50',
        isFailed && 'border-red-200 bg-red-50/50',
        isRunning && 'border-teal-300 bg-gradient-to-br from-teal-50 to-white shadow-teal-100'
      )}
      style={{
        borderColor: isRunning && agent.color ? agent.color : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 영역 */}
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 transition-all',
            isRunning && 'animate-pulse',
            isSuccess && 'bg-teal-100',
            isFailed && 'bg-red-100',
            isRunning && 'bg-gradient-to-br from-white to-teal-50 shadow-sm'
          )}
          style={{
            backgroundColor: isRunning && agent.color ? `${agent.color}15` : undefined,
          }}
        >
          {isRunning && (
            <Loader2
              className="h-5 w-5 animate-spin"
              style={{ color: agent.color || '#0D9488' }}
            />
          )}
          {isSuccess && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
          {isFailed && <XCircle className="h-5 w-5 text-red-600" />}
        </div>

        {/* 내용 영역 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={cn(
                  'h-4 w-4 flex-shrink-0',
                  isSuccess && 'text-slate-500',
                  isFailed && 'text-red-500'
                )}
                style={{ color: isRunning && agent.color ? agent.color : undefined }}
              >
                <IconComponent className="w-full h-full" />
              </div>
              <h4
                className={cn(
                  'text-sm font-semibold truncate',
                  isSuccess && 'text-slate-700',
                  isFailed && 'text-red-700',
                  isRunning && 'text-teal-900'
                )}
              >
                {agent.agent_name}
              </h4>
              {agent.is_fallback && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 flex-shrink-0">
                  대체
                </span>
              )}
            </div>

            {/* 상태 표시 */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isSuccess && agent.execution_time_ms && (
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatExecutionTime(agent.execution_time_ms)}
                </span>
              )}
              {isRunning && (
                <div className="flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-teal-500 animate-pulse" />
                  <span className="inline-block w-1 h-1 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="inline-block w-1 h-1 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>

          {/* 설명 */}
          {agent.agent_description && (
            <p
              className={cn(
                'text-xs mt-1.5',
                isSuccess && 'text-slate-500',
                isFailed && 'text-red-600',
                isRunning && 'text-teal-700'
              )}
            >
              {agent.agent_description}
            </p>
          )}

          {/* 에러 메시지 */}
          {isFailed && agent.error && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {agent.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// 에이전트 진행 상태 패널
function AgentProgressPanel({ agents, isStreaming }: AgentProgressPanelProps) {
  const agentList = Array.from(agents.values());

  if (agentList.length === 0) return null;

  const runningCount = agentList.filter(a => a.status === 'running').length;
  const successCount = agentList.filter(a => a.status === 'success').length;
  const failedCount = agentList.filter(a => a.status === 'failed' || a.status === 'timeout').length;

  return (
    <div
      className="mb-6 rounded-xl border border-teal-200 bg-gradient-to-br from-white to-teal-50/30 shadow-sm overflow-hidden"
      role="region"
      aria-live="polite"
      aria-label="AI 에이전트 진행 상태"
    >
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100">
              <Brain className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-teal-900">
                AI 에이전트가 정보를 수집하고 있어요
              </h3>
              <p className="text-xs text-teal-600">
                {runningCount > 0 && `${runningCount}개 실행 중`}
                {runningCount > 0 && successCount > 0 && ' · '}
                {successCount > 0 && `${successCount}개 완료`}
                {failedCount > 0 && ` · ${failedCount}개 실패`}
              </p>
            </div>
          </div>

          {/* 전체 진행률 */}
          {isStreaming && (
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 에이전트 카드 목록 */}
      <div className="p-4 space-y-3">
        {agentList.map((agent) => (
          <AgentCard key={agent.agent_type} agent={agent} />
        ))}
      </div>
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
  const openLoginModal = useStore((state) => state.openLoginModal);

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
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  // Agent Progress State
  const [agentProgress, setAgentProgress] = useState<Map<string, AgentProgressItem>>(new Map());

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
  // 에이전트 완료 지연을 위한 타이머 ref
  const agentCompletionTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

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

    // 에이전트 완료 타이머 클리어
    agentCompletionTimersRef.current.forEach((timer) => clearTimeout(timer));
    agentCompletionTimersRef.current.clear();

    // 상태 초기화
    isStreamingRef.current = true;
    setIsStreaming(true);
    setStreamingContent('');
    setStreamingSources([]);
    setStreamStatus(null);
    setStatusHistory([]);
    setError(null);
    setCompletedAnswer('');
    setCompletedSources([]);
    setCompletedMetadata(null);
    setAgentProgress(new Map());

    // 스트림 시작
    const cleanup = streamChatMessage(queryText.trim(), existingSessionId ?? null, {
      onStatus: (step, message) => {
        setStreamStatus({ step, message });
        // 상태 히스토리에 추가 (중복 방지)
        setStatusHistory((prev) => {
          // 같은 step과 message가 이미 있으면 추가하지 않음
          const exists = prev.some(item => item.step === step && item.message === message);
          if (exists) return prev;
          return [...prev, {
            id: `${step}-${Date.now()}`,
            step,
            message,
            timestamp: Date.now(),
          }];
        });
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
      onError: (errorMsg, errorCode) => {
        console.error('Streaming error:', errorMsg, 'Code:', errorCode);

        // 401 에러 시 로그인 모달 열기
        if (errorCode === '401') {
          openLoginModal();
          setError({
            message: '로그인이 필요합니다. 로그인 후 다시 시도해주세요.',
            code: errorCode
          });
        } else {
          setError({ message: errorMsg, code: errorCode });
        }

        setStreamStatus(null);
        setStreamingContent('');
        isStreamingRef.current = false;
        setIsStreaming(false);
        cleanupRef.current = null;
        currentQueryRef.current = null;
      },
      onAgentProgress: (data: SSEAgentProgressEvent) => {
        if (data.type === 'start') {
          // 에이전트 시작
          setAgentProgress((prev) => {
            const newMap = new Map(prev);
            newMap.set(data.agent_type, {
              agent_type: data.agent_type,
              agent_name: data.agent_name,
              agent_description: data.agent_description,
              icon: data.icon || 'cpu',
              color: data.color || '#0D9488',
              status: data.status,
              is_fallback: data.is_fallback || false,
              started_at: Date.now(),
            });
            return newMap;
          });
        } else if (data.type === 'complete') {
          // 에이전트 완료 - 최소 표시 시간 적용
          setAgentProgress((prev) => {
            const existing = prev.get(data.agent_type);
            if (!existing) return prev;

            const elapsedTime = Date.now() - existing.started_at;
            const remainingTime = AGENT_MIN_DISPLAY_TIME - elapsedTime;

            // 완료 상태 업데이트 함수
            const updateCompletion = () => {
              setAgentProgress((current) => {
                const currentAgent = current.get(data.agent_type);
                if (!currentAgent) return current;
                const updatedMap = new Map(current);
                updatedMap.set(data.agent_type, {
                  ...currentAgent,
                  status: data.status,
                  execution_time_ms: data.execution_time_ms,
                  error: data.error,
                  completed_at: Date.now(),
                });
                return updatedMap;
              });
              agentCompletionTimersRef.current.delete(data.agent_type);
            };

            if (remainingTime > 0) {
              // 최소 표시 시간까지 지연
              const timer = setTimeout(updateCompletion, remainingTime);
              agentCompletionTimersRef.current.set(data.agent_type, timer);
            } else {
              // 즉시 완료 처리
              const newMap = new Map(prev);
              newMap.set(data.agent_type, {
                ...existing,
                status: data.status,
                execution_time_ms: data.execution_time_ms,
                error: data.error,
                completed_at: Date.now(),
              });
              return newMap;
            }

            return prev;
          });
        }
      },
    });

    cleanupRef.current = cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openLoginModal]);

  // 쿼리 변경 시 스트리밍 시작
  useEffect(() => {
    if (!query || query.trim().length === 0) return;
    startStreaming(query);

    return () => {
      cleanupRef.current?.();
      // 에이전트 완료 타이머 클리어
      agentCompletionTimersRef.current.forEach((timer) => clearTimeout(timer));
      agentCompletionTimersRef.current.clear();
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

        {/* 에이전트 진행 상태 표시 */}
        <AgentProgressPanel
          agents={agentProgress}
          isStreaming={isStreaming}
        />

        {/* 에러 표시 */}
        {error && (
          <div className={cn(
            "mb-6 p-4 rounded-lg border",
            error.code === '401'
              ? "bg-amber-50 border-amber-200"
              : "bg-red-50 border-red-200"
          )}>
            <div className="flex items-start gap-3">
              {error.code === '401' && (
                <LogIn className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={cn(
                  "text-sm",
                  error.code === '401' ? "text-amber-700" : "text-red-700"
                )}>
                  {error.message}
                </p>
                <div className="mt-3 flex gap-2">
                  {error.code === '401' ? (
                    <button
                      onClick={openLoginModal}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      로그인
                    </button>
                  ) : (
                    <button
                      onClick={handleRetry}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                      다시 시도
                    </button>
                  )}
                </div>
              </div>
            </div>
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
                  href={source.href || ''}
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
