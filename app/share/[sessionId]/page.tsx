'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSharePageSession, useTrendingSessions, useCurrentUser } from '@/lib/api';
import {
  AuthorProfileCard,
  QuestionCard,
  AIAnswerSection,
  EngagementBar,
  CTACard,
  RelatedQuestionsCard,
  CommentSection,
  type AuthorInfo,
  type EngagementStats,
  type RelatedQuestion,
} from '@/components/share';

/**
 * Share Page - Public Chat Session View
 * SNS/Community style layout for sharing AI search results
 */

function SharePageContent() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  // 공개 API 먼저 시도 → 실패 시 인증 API fallback
  // 로그인 없이도 공개 세션 조회 가능, 로그인한 경우 비공개 세션도 미리보기 가능
  const { data: session, isLoading, error } = useSharePageSession(sessionId);

  // 현재 사용자 정보 (로그인 여부 확인 및 본인 세션 판별)
  const { data: currentUser } = useCurrentUser();

  // 트렌딩 세션 조회 (연관 질문용)
  const { data: trendingData } = useTrendingSessions(3);

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

  // 작성자 정보 (session.author 사용)
  const authorInfo: AuthorInfo = session.author
    ? {
        name: session.author.name,
        jobTitle: session.author.headline,
        avatarUrl: session.author.image_url,
        userId: String(session.author.id),
      }
    : {
        name: '익명 사용자',
        jobTitle: 'Careerly 회원',
      };

  // Engagement 통계 (session.shared_post 사용)
  const engagementStats: EngagementStats = session.shared_post
    ? {
        likes: session.shared_post.like_count,
        bookmarks: session.shared_post.save_count,
        comments: session.shared_post.comment_count,
      }
    : {
        likes: 0,
        bookmarks: 0,
        comments: 0,
      };

  // shared_post 존재 여부 (커뮤니티에 공유되었는지)
  const hasSharedPost = !!session.shared_post;

  // 본인 세션 여부 확인
  const isOwner = !!(currentUser && session.author && currentUser.id === session.author.id);

  // 트렌딩 세션을 RelatedQuestion 형식으로 변환
  const relatedQuestions: RelatedQuestion[] =
    trendingData?.results?.map((trendingSession) => ({
      id: trendingSession.id,
      title: trendingSession.question,
      viewCount: trendingSession.viewCount,
      likeCount: trendingSession.likeCount,
      commentCount: trendingSession.commentCount,
    })) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Container */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Mobile: Single Column */}
        <div className="lg:hidden space-y-6">
          {/* Author Profile */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <AuthorProfileCard author={authorInfo} createdAt={session.created_at} />
          </div>

          {/* Question */}
          <QuestionCard question={question} viewCount={session.shared_post?.view_count} />

          {/* Answer */}
          {answer && <AIAnswerSection answer={answer} sources={sources} />}

          {/* Engagement */}
          <EngagementBar
            stats={engagementStats}
            hasSharedPost={hasSharedPost}
            isOwner={isOwner}
            sessionId={sessionId}
            postId={session.shared_post?.id}
            isLiked={session.shared_post?.is_liked}
            isBookmarked={session.shared_post?.is_saved}
          />

          {/* Comments */}
          <CommentSection postId={session.shared_post?.id} hasSharedPost={hasSharedPost} />

          {/* CTA */}
          <CTACard />

          {/* Related Questions */}
          <RelatedQuestionsCard questions={relatedQuestions} />
        </div>

        {/* Desktop: Two Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Main Content - 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Author Profile */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <AuthorProfileCard author={authorInfo} createdAt={session.created_at} />
            </div>

            {/* Question */}
            <QuestionCard question={question} viewCount={session.shared_post?.view_count} />

            {/* Answer */}
            {answer && <AIAnswerSection answer={answer} sources={sources} />}

            {/* Engagement */}
            <EngagementBar
              stats={engagementStats}
              hasSharedPost={hasSharedPost}
              isOwner={isOwner}
              sessionId={sessionId}
              postId={session.shared_post?.id}
              isLiked={session.shared_post?.is_liked}
              isBookmarked={session.shared_post?.is_saved}
            />

            {/* Comments */}
            <CommentSection postId={session.shared_post?.id} hasSharedPost={hasSharedPost} />
          </div>

          {/* Sidebar - 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            {/* CTA - Sticky */}
            <div className="sticky top-6 space-y-6">
              <CTACard />

              {/* Related Questions */}
              <RelatedQuestionsCard questions={relatedQuestions} />
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
