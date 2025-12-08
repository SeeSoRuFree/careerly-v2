'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export interface EngagementStats {
  likes: number;
  bookmarks: number;
  comments: number;
}

export interface EngagementBarProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: EngagementStats;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
}

const EngagementBar = React.forwardRef<HTMLDivElement, EngagementBarProps>(
  (
    {
      stats,
      isLiked = false,
      isBookmarked = false,
      onLike,
      onBookmark,
      onShare,
      className,
      ...props
    },
    ref
  ) => {
    const handleShare = () => {
      if (onShare) {
        onShare();
      } else {
        // Default share behavior: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('링크가 복사되었습니다');
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between gap-2 p-4 bg-white rounded-lg border border-slate-200',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={cn(
              'gap-2 hover:bg-red-50',
              isLiked && 'text-red-600 hover:text-red-700'
            )}
          >
            <Heart
              className={cn('h-5 w-5', isLiked && 'fill-current')}
            />
            <span className="text-sm font-medium">{stats.likes}</span>
          </Button>

          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onBookmark}
            className={cn(
              'gap-2 hover:bg-amber-50',
              isBookmarked && 'text-amber-600 hover:text-amber-700'
            )}
          >
            <Bookmark
              className={cn('h-5 w-5', isBookmarked && 'fill-current')}
            />
            <span className="text-sm font-medium">{stats.bookmarks}</span>
          </Button>

          {/* Comment Count */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-slate-100 cursor-default"
            disabled
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{stats.comments}</span>
          </Button>
        </div>

        {/* Share Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-2 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">공유</span>
        </Button>
      </div>
    );
  }
);

EngagementBar.displayName = 'EngagementBar';

export { EngagementBar };
