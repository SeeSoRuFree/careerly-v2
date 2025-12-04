'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { TrendingUp, Heart, ThumbsUp } from 'lucide-react';

export interface RecommendedPost {
  id: string;
  title: string;
  author: {
    name: string;
    image_url?: string;
  };
  likeCount: number;
  href?: string;
}

export interface RecommendedPostsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  posts: RecommendedPost[];
  title?: string;
  maxItems?: number;
  onPostClick?: (postId: string) => void;
}

export const RecommendedPostsPanel = React.forwardRef<HTMLDivElement, RecommendedPostsPanelProps>(
  (
    {
      posts,
      title = '추천 포스트',
      maxItems = 5,
      onPostClick,
      className,
      ...props
    },
    ref
  ) => {
    const displayedPosts = posts.slice(0, maxItems);

    return (
      <Card ref={ref} className={cn('p-4', className)} {...props}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4">
          지금 인기 있는 포스트를 확인해보세요
        </p>

        {/* Posts List */}
        <div className="space-y-3 -mx-4">
          {displayedPosts.map((post, index) => {
            const isLast = index === displayedPosts.length - 1;

            return (
              <button
                key={post.id}
                onClick={() => onPostClick?.(post.id)}
                className={cn(
                  'block w-full text-left pb-3 hover:bg-slate-50 px-4 rounded-lg transition-colors',
                  !isLast && 'border-b border-slate-200'
                )}
              >
                <div className="flex flex-col gap-2">
                  {/* Post Title */}
                  <h4 className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug">
                    {post.title}
                  </h4>

                  {/* Author & Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={post.author.image_url} alt={post.author.name} />
                        <AvatarFallback className="text-[10px]">
                          {post.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-slate-600">{post.author.name}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <Heart className="h-3.5 w-3.5" />
                      <span className="text-xs">{post.likeCount}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer - See More */}
        {posts.length > displayedPosts.length && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <button className="w-full text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
              더 많은 포스트 보기
            </button>
          </div>
        )}
      </Card>
    );
  }
);

RecommendedPostsPanel.displayName = 'RecommendedPostsPanel';
