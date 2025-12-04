'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import { MessageCircle, ThumbsUp, ThumbsDown, Eye, Clock, ChevronDown } from 'lucide-react';

export interface QnaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  qnaId: number;
  title: string;
  description: string;
  author?: {
    id: number;
    name: string;
    email: string;
    image_url: string | null;
    headline: string | null;
  } | null;
  createdAt: string;
  updatedAt?: string;
  hashTagNames?: string;
  answerCount: number;
  commentCount?: number;
  likeCount?: number;
  dislikeCount?: number;
  viewCount: number;
  status?: number;
  isPublic?: number;
  href?: string;
  onClick?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  liked?: boolean;
  disliked?: boolean;
}

export const QnaCard = React.forwardRef<HTMLDivElement, QnaCardProps>(
  (
    {
      qnaId,
      title,
      description,
      author,
      createdAt,
      updatedAt,
      hashTagNames,
      answerCount,
      commentCount = 0,
      likeCount = 0,
      dislikeCount = 0,
      viewCount,
      status = 0,
      isPublic = 1,
      href,
      onClick,
      onLike,
      onDislike,
      liked = false,
      disliked = false,
      className,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 300;

    const tags = hashTagNames ? hashTagNames.split(' ').filter(Boolean) : [];
    const hasAnswer = answerCount > 0;

    const isTruncatable = description.length > MAX_LENGTH;
    const displayText = !isExpanded && isTruncatable
      ? description.substring(0, MAX_LENGTH)
      : description;

    return (
      <Card
        ref={ref}
        onClick={onClick}
        className={cn(
          'p-6 transition-all duration-200',
          onClick && 'cursor-pointer hover:shadow-md hover:border-coral-200',
          className
        )}
        {...props}
      >
        {/* Author Profile with Status Badges */}
        <div className="flex items-center justify-between mb-3">
          {author ? (
            <Link
              href={`/profile/${author.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={author.image_url || ''} alt={author.name} />
                <AvatarFallback>{author.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">{author.name}</span>
                {author.headline && (
                  <span className="text-xs text-slate-500">{author.headline}</span>
                )}
              </div>
            </Link>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            {hasAnswer ? (
              <Badge tone="success" className="text-xs">
                답변 {answerCount}
              </Badge>
            ) : (
              <Badge tone="coral" className="text-xs">
                미답변
              </Badge>
            )}
          </div>
        </div>

        {/* Hashtags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {tags.map((tag, idx) => (
              <Badge key={idx} tone="slate" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 mb-2 leading-snug">
          {title}
        </h3>

        {/* Description */}
        <div className="mb-2">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
            {displayText}
            {!isExpanded && isTruncatable && '...'}
          </p>

          {/* More/Less Button */}
          {isTruncatable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="inline-flex items-center gap-1 text-coral-500 hover:text-coral-600 transition-colors text-sm font-medium mt-2 group"
              aria-label={isExpanded ? '접기' : '더보기'}
            >
              {isExpanded ? (
                <>
                  <span>접기</span>
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform rotate-180" />
                </>
              ) : (
                <>
                  <span>더보기</span>
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-[2px] transition-transform" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatRelativeTime(createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{viewCount.toLocaleString()} 조회</span>
            </div>
            {commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{commentCount} 댓글</span>
              </div>
            )}
          </div>

          {/* Like/Dislike Actions */}
          {(onLike || onDislike) && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {onLike && (
                <button
                  onClick={onLike}
                  className={cn(
                    'flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors',
                    liked
                      ? 'text-coral-500 bg-coral-50'
                      : 'text-slate-500 hover:text-coral-500 hover:bg-coral-50'
                  )}
                  aria-label="좋아요"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {likeCount > 0 && <span>{likeCount}</span>}
                </button>
              )}
              {onDislike && (
                <button
                  onClick={onDislike}
                  className={cn(
                    'flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors',
                    disliked
                      ? 'text-slate-700 bg-slate-100'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  )}
                  aria-label="싫어요"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  {dislikeCount > 0 && <span>{dislikeCount}</span>}
                </button>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }
);

QnaCard.displayName = 'QnaCard';
