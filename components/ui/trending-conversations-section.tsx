'use client';

import * as React from 'react';
import { Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TrendingConversationCard,
  TrendingConversationCardSkeleton,
  type TrendingConversation,
} from './trending-conversation-card';

// Mock data for development
export const MOCK_TRENDING_CONVERSATIONS: TrendingConversation[] = [
  {
    id: 'mock-session-1',
    question: '커리어 전환할 때 연봉 협상은 어떻게 해야 할까요?',
    answerPreview:
      '연봉 협상에서 가장 중요한 건 현재 시장 가치를 파악하는 것입니다. 먼저 동종 업계의 평균 연봉을 조사하고, 본인의 경력과 기술 스택을 기반으로 합리적인 범위를 설정하세요. 협상 시에는 구체적인 성과 데이터를 준비하면 더욱 효과적입니다',
    likeCount: 42,
    commentCount: 8,
    author: {
      id: 'user-1',
      nickname: '개발자K',
      jobTitle: '백엔드 개발자 @ 토스',
      isAnonymous: false,
    },
    tags: ['연봉협상', '이직', '커리어'],
  },
  {
    id: 'mock-session-2',
    question: '주니어 개발자가 시니어로 성장하기 위해 가장 중요한 역량은?',
    answerPreview:
      '시니어 개발자로 성장하기 위해서는 기술적 깊이뿐만 아니라 넓은 시야가 필요합니다. 코드 품질, 아키텍처 설계 능력, 그리고 주니어를 멘토링하는 리더십이 핵심입니다. 특히 비즈니스 요구사항을 기술적 해결책으로 연결하는 능력이 중요합니다',
    likeCount: 89,
    commentCount: 15,
    author: {
      nickname: '익명',
      isAnonymous: true,
    },
    tags: ['시니어개발자', '커리어성장', '역량'],
  },
  {
    id: 'mock-session-3',
    question: '프론트엔드 개발자로 이직할 때 포트폴리오는 어떻게 준비해야 하나요?',
    answerPreview:
      '프론트엔드 포트폴리오는 실제 동작하는 프로젝트가 핵심입니다. GitHub 링크와 함께 배포된 사이트를 보여주는 것이 좋습니다. React, TypeScript 활용 능력을 보여주는 프로젝트 2-3개면 충분합니다. 코드 품질과 README 작성도 신경 쓰세요',
    likeCount: 67,
    commentCount: 12,
    author: {
      id: 'user-3',
      nickname: '프론트마스터',
      jobTitle: '프론트엔드 리드 @ 당근',
      avatarUrl: undefined,
      isAnonymous: false,
    },
    tags: ['프론트엔드', '포트폴리오', '이직'],
  },
  {
    id: 'mock-session-4',
    question: 'AI 시대에 개발자는 어떤 준비를 해야 할까요?',
    answerPreview:
      'AI는 개발자를 대체하기보다 생산성을 높이는 도구입니다. GitHub Copilot, ChatGPT 같은 AI 도구를 적극 활용하면서도, 문제 해결 능력과 시스템 설계 역량은 더욱 중요해집니다. AI가 못하는 창의적 사고와 비즈니스 이해도를 키우세요',
    likeCount: 156,
    commentCount: 23,
    author: {
      id: 'user-4',
      nickname: 'AI개발자',
      jobTitle: 'ML Engineer @ 네이버',
      isAnonymous: false,
    },
    tags: ['AI', '미래전망', '개발자커리어'],
  },
];

interface TrendingConversationsSectionProps {
  conversations?: TrendingConversation[];
  isLoading?: boolean;
  className?: string;
  onQuestionClick?: (query: string) => void;
  onLike?: (id: string) => void;
  onAuthorClick?: (authorId: string) => void;
}

export function TrendingConversationsSection({
  conversations = MOCK_TRENDING_CONVERSATIONS,
  isLoading = false,
  className,
  onQuestionClick,
  onLike,
  onAuthorClick,
}: TrendingConversationsSectionProps) {
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
];

interface SuggestedQuestionsProps {
  questions?: string[];
  onQuestionClick?: (query: string) => void;
  className?: string;
}

export function SuggestedQuestions({
  questions = SUGGESTED_QUESTIONS,
  onQuestionClick,
  className,
}: SuggestedQuestionsProps) {
  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)}>
      {questions.map((question) => (
        <button
          key={question}
          onClick={() => onQuestionClick?.(question)}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-full',
            'bg-white border border-slate-200 text-sm font-medium text-slate-700',
            'hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700',
            'transition-all duration-200'
          )}
        >
          <Sparkles className="h-3.5 w-3.5 text-teal-500" />
          {question}
        </button>
      ))}
    </div>
  );
}
