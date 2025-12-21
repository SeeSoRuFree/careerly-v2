'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MessageCircleQuestion, Eye, Heart, MessageCircle } from 'lucide-react';

export interface RelatedQuestion {
  id: string;
  title: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  href?: string;
}

export interface RelatedQuestionsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  questions: RelatedQuestion[];
  title?: string;
}

const RelatedQuestionsCard = React.forwardRef<HTMLDivElement, RelatedQuestionsCardProps>(
  ({ questions, title = '비슷한 질문', className, ...props }, ref) => {
    if (!questions || questions.length === 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn('bg-white rounded-xl border border-slate-200 shadow-sm p-6', className)}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <MessageCircleQuestion className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {questions.map((question) => {
            const href = question.href || `/share/${question.id}`;

            return (
              <Link
                key={question.id}
                href={href}
                className="block group p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all"
              >
                {/* Question Title */}
                <h4 className="text-sm font-medium text-slate-900 group-hover:text-teal-700 line-clamp-2 mb-2">
                  {question.title}
                </h4>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {/* Like Count */}
                  {question.likeCount !== undefined && question.likeCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{question.likeCount.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Comment Count */}
                  {question.commentCount !== undefined && question.commentCount > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{question.commentCount.toLocaleString()}</span>
                    </div>
                  )}

                  {/* View Count */}
                  {question.viewCount !== undefined && question.viewCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{question.viewCount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* View More Link (optional) */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <Link
            href="/"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
          >
            더 많은 질문 보기 →
          </Link>
        </div>
      </div>
    );
  }
);

RelatedQuestionsCard.displayName = 'RelatedQuestionsCard';

export { RelatedQuestionsCard };
