'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import { Heart, MessageCircle, Bot, ArrowRight, Clock, Eye } from 'lucide-react';

// 프롬프트에서 질문과 프로필 분리
function parsePrompt(text: string): { question: string; profile: string | null } {
  const separator = '\n---\n';
  const separatorIndex = text.indexOf(separator);

  if (separatorIndex === -1) {
    return { question: text, profile: null };
  }

  const question = text.substring(0, separatorIndex).trim();
  const profileSection = text.substring(separatorIndex + separator.length).trim();
  const profile = profileSection.replace(/^내정보:\s*/i, '').trim();

  return { question, profile };
}

export interface AIChatPostCardProps extends React.HTMLAttributes<HTMLDivElement> {
  postId: number;
  question: string;           // post.title (질문)
  answerPreview: string;      // post.description (답변 미리보기)
  sessionId?: string;         // chat_session_id (share 페이지 이동용)
  createdAt: string;          // 생성 시간
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onClick?: () => void;
  // 작성자 정보
  authorName?: string;
  authorImageUrl?: string;
  authorId?: number;
}

export const AIChatPostCard = React.forwardRef<HTMLDivElement, AIChatPostCardProps>(
  (
    {
      postId,
      question,
      answerPreview,
      sessionId,
      createdAt,
      likeCount = 0,
      commentCount = 0,
      viewCount = 0,
      isLiked = false,
      onLike,
      onClick,
      authorName,
      authorImageUrl,
      authorId,
      className,
      ...props
    },
    ref
  ) => {
    const handleCardClick = (e: React.MouseEvent) => {
      // 하위 인터랙티브 요소 클릭시 카드 클릭 이벤트 방지
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON'
      ) {
        return;
      }
      onClick?.();
    };

    const handleLikeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onLike?.();
    };

    // 질문 텍스트 파싱 (프로필 정보 제거)
    const { question: parsedQuestion } = parsePrompt(question);

    // sessionId가 없으면 postId를 사용 (임시)
    const shareUrl = sessionId
      ? `/share/${sessionId}`
      : `/community/post/${postId}`;

    return (
      <Card
        ref={ref}
        onClick={handleCardClick}
        className={cn(
          'p-6 transition-all duration-200',
          onClick && 'cursor-pointer hover:shadow-md hover:border-teal-200',
          className
        )}
        {...props}
      >
        {/* Header - AI Agent Profile */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3">
            {/* AI Avatar with gradient background */}
            <Avatar className="h-10 w-10 bg-gradient-to-br from-teal-400 to-teal-600">
              <AvatarFallback className="bg-transparent">
                <Bot className="h-5 w-5 text-white" />
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">커리어리 AI 에이전트</span>
                <Badge
                  tone="default"
                  className="bg-teal-50 text-teal-700 border-teal-200 text-xs"
                >
                  AI
                </Badge>
              </div>
              {/* Author Info - by. 작성자 */}
              {authorName && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm text-slate-500">by.</span>
                  <Link
                    href={`/profile/${authorId}`}
                    variant="nav"
                    className="text-sm text-slate-600 hover:text-teal-600 transition-colors font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {authorName}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question Title */}
        <div className="mb-2">
          <h3 className="text-base font-semibold text-slate-900 leading-snug">
            Q. {parsedQuestion}
          </h3>
        </div>

        {/* Answer Preview */}
        <div className="mb-2">
          <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
            {answerPreview}
          </p>
        </div>

        {/* View Full Conversation Link */}
        <div className="mb-2">
          <Link
            href={shareUrl}
            variant="nav"
            className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors group"
            onClick={(e) => e.stopPropagation()}
          >
            <span>전체 대화 보기</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Stats Row - 일반 카드와 동일한 스타일 */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2 pb-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
          {viewCount > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{viewCount.toLocaleString()} 조회</span>
            </div>
          )}
          {likeCount > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              <span>{likeCount.toLocaleString()} 좋아요</span>
            </div>
          )}
          {commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{commentCount.toLocaleString()} 댓글</span>
            </div>
          )}
        </div>

        {/* Actions - 일반 카드와 동일한 스타일 */}
        <div
          className="flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleLikeClick}
            className={cn(
              'text-slate-500 hover:text-teal-600 transition-colors',
              isLiked && 'text-teal-600'
            )}
            aria-label="좋아요"
          >
            <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
          </button>
        </div>
      </Card>
    );
  }
);

AIChatPostCard.displayName = 'AIChatPostCard';
