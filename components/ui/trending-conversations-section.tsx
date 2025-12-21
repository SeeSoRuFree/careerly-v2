'use client';

import * as React from 'react';
import { Sparkles, TrendingUp, ChevronRight, User, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTrendingSessions } from '@/lib/api';
import {
  TrendingConversationCard,
  TrendingConversationCardSkeleton,
  type TrendingConversation,
} from './trending-conversation-card';

interface TrendingConversationsSectionProps {
  className?: string;
  onQuestionClick?: (query: string) => void;
  onLike?: (id: string) => void;
  onAuthorClick?: (authorId: string) => void;
}

export function TrendingConversationsSection({
  className,
  onQuestionClick,
  onLike,
  onAuthorClick,
}: TrendingConversationsSectionProps) {
  // API 데이터 조회 (limit=4)
  const { data, isLoading, error } = useTrendingSessions(4);

  // 에러 처리 (전역 에러 핸들러가 처리하지만, UI에서 별도 처리 필요 시)
  if (error && !isLoading) {
    // 에러 발생 시 섹션을 렌더링하지 않거나 에러 상태 표시
    return null;
  }

  // API 응답을 컴포넌트 타입으로 변환
  const conversations: TrendingConversation[] = data?.results || [];
  return (
    <section className={cn('w-full', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">사람들은 이런 질문을 했어요</h2>
            <p className="text-sm text-slate-500">커리어리 회원들의 인기 질문을 확인해보세요</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
          더보기
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Conversation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <TrendingConversationCardSkeleton />
            <TrendingConversationCardSkeleton />
            <TrendingConversationCardSkeleton />
            <TrendingConversationCardSkeleton />
          </>
        ) : (
          conversations.map((conversation) => (
            <TrendingConversationCard
              key={conversation.id}
              conversation={conversation}
              onLike={onLike}
              onAuthorClick={onAuthorClick}
            />
          ))
        )}
      </div>
    </section>
  );
}

// Suggested Questions as Chips (alternative simpler version)
export const SUGGESTED_QUESTIONS = [
  '연봉 협상 팁',
  '이직 준비 방법',
  '포트폴리오 작성법',
  '면접 질문',
  '개발자 성장 로드맵',
  'AI 시대 커리어',
  'AI 시대 커리어 (프롬프트)',
];

// 개인화 질문 목록 (자동 개인화 - 기존)
export const PERSONALIZED_QUESTIONS = ['AI 시대 커리어'];

// 프롬프트 기반 질문 목록 (새로 추가)
export const PROMPT_BASED_QUESTIONS = ['AI 시대 커리어 (프롬프트)'];

interface SuggestedQuestionsProps {
  questions?: string[];
  onQuestionClick?: (query: string, isPersonalized?: boolean) => void;
  onPromptBasedClick?: (query: string) => void;
  className?: string;
}

export function SuggestedQuestions({
  questions = SUGGESTED_QUESTIONS,
  onQuestionClick,
  onPromptBasedClick,
  className,
}: SuggestedQuestionsProps) {
  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)}>
      {questions.map((question) => {
        const isPersonalized = PERSONALIZED_QUESTIONS.includes(question);
        const isPromptBased = PROMPT_BASED_QUESTIONS.includes(question);

        // 프롬프트 기반 버튼
        if (isPromptBased) {
          return (
            <button
              key={question}
              onClick={() => onPromptBasedClick?.(question)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full',
                'bg-white border text-sm font-medium',
                'border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400',
                'transition-all duration-200'
              )}
            >
              <Edit className="h-3.5 w-3.5 text-blue-500" />
              {question}
            </button>
          );
        }

        // 개인화 버튼 (기존)
        return (
          <button
            key={question}
            onClick={() => onQuestionClick?.(question, isPersonalized)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full',
              'bg-white border text-sm font-medium',
              isPersonalized
                ? 'border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400'
                : 'border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700',
              'transition-all duration-200'
            )}
          >
            {isPersonalized ? (
              <User className="h-3.5 w-3.5 text-purple-500" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-teal-500" />
            )}
            {question}
            {isPersonalized && (
              <span className="text-xs text-purple-400 ml-1">(내 프로필 기반)</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
