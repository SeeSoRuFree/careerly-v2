'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { useTopPosts } from '@/lib/api';

export interface TopPostsFeedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  maxItems?: number;
  onPostClick?: (postId: string) => void;
}

export const TopPostsFeedCard = React.forwardRef<HTMLDivElement, TopPostsFeedCardProps>(
  (
    {
      maxItems = 5,
      onPostClick,
      className,
      ...props
    },
    ref
  ) => {
    const {
      data: posts,
      isLoading,
      error,
    } = useTopPosts('monthly', maxItems);

    if (isLoading || error || !posts || posts.length === 0) {
      return null;
    }

    return (
      <Card ref={ref} className={cn('p-6 cursor-default', className)} {...props}>
        {/* Header - 심플하게 */}
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Trending
          </span>
        </div>

        {/* Posts List - 더 미니멀하게 */}
        <div className="space-y-4">
          {posts.slice(0, maxItems).map((post, index) => {
            const rank = index + 1;
            const title = post.title || post.description.substring(0, 50) + '...';

            return (
              <button
                key={post.id}
                onClick={() => onPostClick?.(post.id.toString())}
                className="flex items-start gap-4 w-full text-left group"
              >
                {/* Rank Number - 심플하게 */}
                <span className={cn(
                  'text-2xl font-light tabular-nums',
                  rank <= 3 ? 'text-slate-900' : 'text-slate-300'
                )}>
                  {rank}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <h4 className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug group-hover:text-slate-600 transition-colors">
                    {title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {post.author?.name || '알 수 없음'}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      </Card>
    );
  }
);

TopPostsFeedCard.displayName = 'TopPostsFeedCard';
