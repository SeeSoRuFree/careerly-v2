'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Flame, Heart, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTopPosts } from '@/lib/api';
import type { TopPostsPeriod } from '@/lib/api';

export interface TopPostsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  maxItems?: number;
  onPostClick?: (postId: string) => void;
}

const periodLabels: Record<'weekly' | 'monthly', string> = {
  weekly: '주간',
  monthly: '월간',
};

// 등수 배지 색상
const getRankStyle = (rank: number) => {
  if (rank === 1) return 'bg-yellow-500 text-white'; // 금
  if (rank === 2) return 'bg-slate-400 text-white';  // 은
  if (rank === 3) return 'bg-amber-600 text-white';  // 동
  return 'bg-slate-200 text-slate-600';              // 나머지
};

// 프로필 이미지 테두리 색상 (1~3위)
const getAvatarRingStyle = (rank: number) => {
  if (rank === 1) return 'ring-2 ring-yellow-500';   // 금
  if (rank === 2) return 'ring-2 ring-slate-400';    // 은
  if (rank === 3) return 'ring-2 ring-amber-600';    // 동
  return '';                                          // 나머지
};

export const TopPostsPanel = React.forwardRef<HTMLDivElement, TopPostsPanelProps>(
  (
    {
      maxItems = 10,
      onPostClick,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedPeriod, setSelectedPeriod] = React.useState<TopPostsPeriod>('weekly');
    const [isExpanded, setIsExpanded] = React.useState(false);
    const initialCount = 5;

    const {
      data: posts,
      isLoading,
      error,
    } = useTopPosts(selectedPeriod, maxItems);

    return (
      <Card ref={ref} className={cn('p-4', className)} {...props}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-slate-900">인기글</h3>
          </div>

          {/* Period Tabs */}
          <div className="flex gap-1">
            {(['weekly', 'monthly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                  selectedPeriod === period
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">데이터를 불러올 수 없습니다</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!posts || posts.length === 0) && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">인기글이 없습니다</p>
          </div>
        )}

        {/* Posts List with Ranking */}
        {!isLoading && !error && posts && posts.length > 0 && (
          <div className="space-y-2">
            {posts.slice(0, isExpanded ? maxItems : initialCount).map((post, index) => {
              const rank = index + 1;
              const title = post.title || post.description.substring(0, 40) + '...';

              return (
                <button
                  key={post.id}
                  onClick={() => onPostClick?.(post.id.toString())}
                  className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors group w-full text-left"
                >
                  {/* Rank Badge */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      getRankStyle(rank)
                    )}
                  >
                    {rank}
                  </div>

                  {/* Author Avatar */}
                  <Avatar className={cn('flex-shrink-0 w-8 h-8', getAvatarRingStyle(rank))}>
                    <AvatarImage
                      src={post.author?.image_url}
                      alt={post.author?.name || '알 수 없음'}
                    />
                    <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                      {post.author?.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-slate-700">
                      {title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 truncate">
                        {post.author?.name || '알 수 없음'}
                      </span>
                      <div className="flex items-center gap-0.5 text-slate-400">
                        <Heart className="h-3 w-3" />
                        <span className="text-xs">{post.like_count}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer - Expand/Collapse */}
        {posts && posts.length > initialCount && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center gap-1 w-full text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              {isExpanded ? (
                <>
                  접기
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  더 보기 ({initialCount + 1}~{Math.min(posts.length, maxItems)}위)
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </Card>
    );
  }
);

TopPostsPanel.displayName = 'TopPostsPanel';
