'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { MessageCircle, ThumbsUp, ThumbsDown, Eye, Clock } from 'lucide-react';

export interface QnaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: number;
  title: string;
  description: string;
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
  onLike?: () => void;
  onDislike?: () => void;
  liked?: boolean;
  disliked?: boolean;
}

export const QnaCard = React.forwardRef<HTMLDivElement, QnaCardProps>(
  (
    {
      id,
      title,
      description,
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
      onLike,
      onDislike,
      liked = false,
      disliked = false,
      className,
      ...props
    },
    ref
  ) => {
    const tags = hashTagNames ? hashTagNames.split(' ').filter(Boolean) : [];
    const hasAnswer = answerCount > 0;

    return (
      <Card
        ref={ref}
        className={cn(
          'p-4 hover:border-slate-300 transition-all duration-200',
          className
        )}
        {...props}
      >
        {/* Header - Tags and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {tags.map((tag, idx) => (
              <Badge key={idx} tone="slate" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {isPublic === 0 && (
              <Badge tone="warning" className="text-xs">
                비공개
              </Badge>
            )}
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

        {/* Title */}
        {href ? (
          <h3 className="text-base font-semibold text-slate-900 mb-2 leading-snug">
            <Link href={href} variant="subtle" className="hover:text-coral-500">
              {title}
            </Link>
          </h3>
        ) : (
          <h3 className="text-base font-semibold text-slate-900 mb-2 leading-snug">
            {title}
          </h3>
        )}

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-3 whitespace-pre-wrap">
          {description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{createdAt}</span>
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
            <div className="flex items-center gap-2">
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
