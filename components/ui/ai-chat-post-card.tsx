'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import { Heart, MessageCircle, Bot, ArrowRight } from 'lucide-react';

export interface AIChatPostCardProps extends React.HTMLAttributes<HTMLDivElement> {
  postId: number;
  question: string;           // post.title (질문)
  answerPreview: string;      // post.description (답변 미리보기)
  sessionId?: string;         // chat_session_id (share 페이지 이동용)
  createdAt: string;          // 생성 시간
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onClick?: () => void;
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
      isLiked = false,
      onLike,
      onClick,
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
        <div className="flex items-start gap-3 mb-4">
          {/* AI Avatar with gradient background */}
          <div className="relative">
            <Avatar className="h-10 w-10 bg-gradient-to-br from-teal-400 to-teal-600">
              <AvatarFallback className="bg-transparent">
                <Bot className="h-5 w-5 text-white" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900">커리어리 AI 에이전트</span>
              <Badge
                tone="default"
                className="bg-teal-50 text-teal-700 border-teal-200 text-xs"
              >
                AI
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatRelativeTime(createdAt)}
            </p>
          </div>
        </div>

        {/* Question */}
        <div className="mb-3">
          <h3 className="text-base font-semibold text-slate-900 leading-snug mb-1">
            Q. {question}
          </h3>
        </div>

        {/* Answer Preview */}
        <div className="mb-4">
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
            {answerPreview}
          </p>
        </div>

        {/* View Full Conversation Button */}
        <div className="mb-4">
          <Link
            href={shareUrl}
            variant="nav"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors group"
            onClick={(e) => e.stopPropagation()}
          >
            <span>전체 대화 보기</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-slate-500 pt-3 border-t border-slate-100">
          <button
            onClick={handleLikeClick}
            className={cn(
              'flex items-center gap-1.5 transition-colors hover:text-teal-600',
              isLiked && 'text-teal-600'
            )}
            aria-label="좋아요"
          >
            <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
            <span className="font-medium">{likeCount}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">{commentCount}</span>
          </div>
        </div>
      </Card>
    );
  }
);

AIChatPostCard.displayName = 'AIChatPostCard';
