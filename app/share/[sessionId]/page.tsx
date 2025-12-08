'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSharePageSession } from '@/lib/api';
import {
  AuthorProfileCard,
  QuestionCard,
  AIAnswerSection,
  EngagementBar,
  CTACard,
  RelatedQuestionsCard,
  type AuthorInfo,
  type EngagementStats,
  type RelatedQuestion,
} from '@/components/share';

/**
 * Share Page - Public Chat Session View
 * SNS/Community style layout for sharing AI search results
 */

// Mock data for features not yet supported by backend
const MOCK_AUTHOR: AuthorInfo = {
  name: '익명 사용자',
  jobTitle: 'Careerly 회원',
  avatarUrl: undefined,
};

const MOCK_ENGAGEMENT: EngagementStats = {
  likes: 0,
  bookmarks: 0,
  comments: 0,
};

const MOCK_RELATED_QUESTIONS: RelatedQuestion[] = [
  {
    id: 'mock-1',
    title: '프론트엔드 개발자로 이직하기 위해 어떤 준비가 필요한가요?',
    viewCount: 1234,
    likeCount: 89,
  },
  {
    id: 'mock-2',
    title: '주니어 개발자의 포트폴리오는 어떻게 작성하면 좋을까요?',
    viewCount: 987,
    likeCount: 67,
  },
  {
    id: 'mock-3',
    title: '스타트업과 대기업, 신입 개발자에게 더 좋은 선택은?',
    viewCount: 2341,
    likeCount: 145,
  },
];

function SharePageContent() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  // 공개 API 먼저 시도 → 실패 시 인증 API fallback
  // 로그인 없이도 공개 세션 조회 가능, 로그인한 경우 비공개 세션도 미리보기 가능
  const { data: session, isLoading, error } = useSharePageSession(sessionId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-slate-600">공유 세션을 불러오는 중...</p>
      </div>
    );
  }

  // Error states
  if (error) {
    const errorMessage = error.message || '알 수 없는 오류가 발생했습니다';
    const isNotFound = errorMessage.includes('404') || errorMessage.includes('not found');
    const isPrivate = errorMessage.includes('private') || errorMessage.includes('비공개');

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">
            {isNotFound ? '세션을 찾을 수 없습니다' : isPrivate ? '비공개 세션입니다' : '오류가 발생했습니다'}
          </h2>
          <p className="text-slate-600 max-w-md">
            {isNotFound
              ? '요청하신 세션이 존재하지 않거나 삭제되었습니다.'
              : isPrivate
              ? '이 세션은 비공개로 설정되어 있습니다.'
              : errorMessage}
          </p>
        </div>
      </div>
    );
  }

  // No session data
  if (!session) {
    return null;
  }

  // Extract question and answer from messages
  const userMessage = session.messages.find((msg) => msg.role === 'user');
  const assistantMessage = session.messages.find((msg) => msg.role === 'assistant');

  const question = userMessage?.content || session.title;
  const answer = assistantMessage?.content || '';
  const sources = assistantMessage?.sources;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Container */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Mobile: Single Column */}
        <div className="lg:hidden space-y-6">
          {/* Author Profile */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <AuthorProfileCard author={MOCK_AUTHOR} createdAt={session.created_at} />
          </div>

          {/* Question */}
          <QuestionCard question={question} />

          {/* Answer */}
          {answer && <AIAnswerSection answer={answer} sources={sources} />}

          {/* Engagement */}
          <EngagementBar stats={MOCK_ENGAGEMENT} />

          {/* CTA */}
          <CTACard />

          {/* Related Questions */}
          <RelatedQuestionsCard questions={MOCK_RELATED_QUESTIONS} />
        </div>

        {/* Desktop: Two Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Main Content - 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Author Profile */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <AuthorProfileCard author={MOCK_AUTHOR} createdAt={session.created_at} />
            </div>

            {/* Question */}
            <QuestionCard question={question} />

            {/* Answer */}
            {answer && <AIAnswerSection answer={answer} sources={sources} />}

            {/* Engagement */}
            <EngagementBar stats={MOCK_ENGAGEMENT} />
          </div>

          {/* Sidebar - 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            {/* CTA - Sticky */}
            <div className="sticky top-6 space-y-6">
              <CTACard />

              {/* Related Questions */}
              <RelatedQuestionsCard questions={MOCK_RELATED_QUESTIONS} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-slate-600">공유 세션을 불러오는 중...</p>
        </div>
      }
    >
      <SharePageContent />
    </Suspense>
  );
}
