'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface TrendingConversation {
  id: string;
  question: string;
  answerPreview: string;
  likeCount: number;
  commentCount?: number;
  author: {
    id?: string;
    profileId?: number;
    nickname: string;
    avatarUrl?: string;
    jobTitle?: string;
    isAnonymous?: boolean;
  };
  createdAt?: string;
  tags?: string[];
}

interface TrendingConversationCardProps {
  conversation: TrendingConversation;
  className?: string;
  onLike?: (id: string) => void;
  onAuthorClick?: (authorId: string) => void;
}

export function TrendingConversationCard({
  conversation,
  className,
  onLike,
  onAuthorClick,
}: TrendingConversationCardProps) {
  const { id, question, answerPreview, likeCount, commentCount, author, tags } = conversation;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(id);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    const authorProfileId = author.profileId?.toString() || author.id;
    if (author.isAnonymous || !authorProfileId) return;
    e.preventDefault();
    e.stopPropagation();
    onAuthorClick?.(authorProfileId);
  };

  return (
    <Link
      href={`/share/${id}`}
      className={cn(
        'group block bg-white rounded-xl border border-slate-200 p-5 transition-all duration-200',
        'hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      {/* Author Section */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            'flex items-center gap-2',
            !author.isAnonymous && author.id && 'cursor-pointer hover:opacity-80'
          )}
          onClick={handleAuthorClick}
        >
          <Avatar className="h-8 w-8">
            {author.avatarUrl ? (
              <AvatarImage src={author.avatarUrl} alt={author.nickname} />
            ) : (
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">
              {author.isAnonymous ? '익명' : author.nickname}
            </span>
            {author.jobTitle && !author.isAnonymous && (
              <span className="text-xs text-slate-500">{author.jobTitle}</span>
            )}
          </div>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-base font-semibold text-slate-900 mb-3 line-clamp-2 group-hover:text-teal-700 transition-colors">
        {question}
      </h3>

      {/* Answer Preview */}
      <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
        {answerPreview}
        <span className="text-slate-400 ml-1">...</span>
      </p>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLikeClick}
            className="flex items-center gap-1.5 text-slate-500 hover:text-coral-500 transition-colors"
          >
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          {/* Comment Count */}
          {commentCount !== undefined && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{commentCount}</span>
            </div>
          )}
        </div>

        {/* Read More */}
        <span className="flex items-center gap-1 text-sm text-teal-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          전체 보기
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

// Skeleton for loading state
export function TrendingConversationCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      {/* Author Skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 bg-slate-200 rounded-full" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="h-3 w-16 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Question Skeleton */}
      <div className="h-5 w-full bg-slate-200 rounded mb-2" />
      <div className="h-5 w-3/4 bg-slate-200 rounded mb-3" />

      {/* Answer Preview Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-2/3 bg-slate-100 rounded" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
        <div className="h-4 w-12 bg-slate-100 rounded" />
        <div className="h-4 w-12 bg-slate-100 rounded" />
      </div>
    </div>
  );
}
