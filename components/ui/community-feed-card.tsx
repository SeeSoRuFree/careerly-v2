'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ActionBar } from '@/components/ui/action-bar';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { Heart, MessageCircle, Repeat2, Share2, Bookmark, Eye, MoreHorizontal } from 'lucide-react';

export interface UserProfile {
  id: number;
  name: string;
  image_url?: string;
  headline?: string;
  title?: string;
}

export interface PostStats {
  likeCount?: number;
  replyCount?: number;
  repostCount?: number;
  shareCount?: number;
  viewCount?: number;
}

export interface CommunityFeedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  userProfile: UserProfile;
  content: string;
  contentHtml?: string;
  createdAt: string;
  stats?: PostStats;
  imageUrls?: string[];
  href?: string;
  onLike?: () => void;
  onReply?: () => void;
  onRepost?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onMore?: () => void;
  liked?: boolean;
  bookmarked?: boolean;
  reposted?: boolean;
  feedType?: string;
  selectedReason?: string;
}

export const CommunityFeedCard = React.forwardRef<HTMLDivElement, CommunityFeedCardProps>(
  (
    {
      userProfile,
      content,
      contentHtml,
      createdAt,
      stats,
      imageUrls = [],
      href,
      onLike,
      onReply,
      onRepost,
      onShare,
      onBookmark,
      onMore,
      liked = false,
      bookmarked = false,
      reposted = false,
      feedType,
      selectedReason,
      className,
      ...props
    },
    ref
  ) => {
    const actions = [];

    if (onLike) {
      actions.push({
        id: 'like',
        icon: <Heart className={cn('h-5 w-5', liked && 'fill-current text-coral-500')} />,
        label: stats?.likeCount ? `${stats.likeCount}` : '0',
        pressed: liked,
      });
    }

    if (onReply) {
      actions.push({
        id: 'reply',
        icon: <MessageCircle className="h-5 w-5" />,
        label: stats?.replyCount ? `${stats.replyCount}` : '0',
      });
    }

    if (onRepost) {
      actions.push({
        id: 'repost',
        icon: <Repeat2 className={cn('h-5 w-5', reposted && 'text-green-500')} />,
        label: stats?.repostCount ? `${stats.repostCount}` : '0',
        pressed: reposted,
      });
    }

    if (onShare) {
      actions.push({
        id: 'share',
        icon: <Share2 className="h-5 w-5" />,
        label: '공유',
      });
    }

    const handleAction = (actionId: string) => {
      switch (actionId) {
        case 'like':
          onLike?.();
          break;
        case 'reply':
          onReply?.();
          break;
        case 'repost':
          onRepost?.();
          break;
        case 'share':
          onShare?.();
          break;
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'p-4 hover:border-slate-300 transition-all duration-200',
          className
        )}
        {...props}
      >
        {/* Feed Type Badge */}
        {feedType && (
          <div className="mb-3">
            <Badge tone="slate" className="text-xs">
              {feedType}
            </Badge>
          </div>
        )}

        {/* Header - User Profile */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile.image_url} alt={userProfile.name} />
              <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">
                {userProfile.name}
              </span>
              {userProfile.headline && (
                <p className="text-sm text-slate-600">{userProfile.headline}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">{createdAt}</p>
            </div>
          </div>

          {/* More Actions */}
          {onMore && (
            <button
              onClick={onMore}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="더보기"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mb-3">
          {contentHtml ? (
            <div
              className="text-slate-900 text-sm leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          ) : (
            <p className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          )}
        </div>

        {/* Images */}
        {imageUrls.length > 0 && (
          <div className={cn(
            'mb-3 rounded-lg overflow-hidden',
            imageUrls.length === 1 && 'grid grid-cols-1',
            imageUrls.length === 2 && 'grid grid-cols-2 gap-2',
            imageUrls.length >= 3 && 'grid grid-cols-2 gap-2'
          )}>
            {imageUrls.slice(0, 4).map((url, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative aspect-video bg-slate-100',
                  imageUrls.length === 1 && 'aspect-[16/10]',
                  imageUrls.length === 3 && idx === 0 && 'col-span-2'
                )}
              >
                <img
                  src={url}
                  alt={`이미지 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 3 && imageUrls.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      +{imageUrls.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats Row */}
        {stats && (stats.viewCount || stats.likeCount) && (
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
            {stats.viewCount !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{stats.viewCount.toLocaleString()} 조회</span>
              </div>
            )}
            {stats.likeCount !== undefined && stats.likeCount > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                <span>{stats.likeCount.toLocaleString()} 좋아요</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center justify-between">
            <ActionBar
              actions={actions}
              onAction={handleAction}
              size="sm"
            />
            {onBookmark && (
              <button
                onClick={onBookmark}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="북마크"
              >
                <Bookmark className={cn('h-5 w-5', bookmarked && 'fill-current text-coral-500')} />
              </button>
            )}
          </div>
        )}
      </Card>
    );
  }
);

CommunityFeedCard.displayName = 'CommunityFeedCard';
