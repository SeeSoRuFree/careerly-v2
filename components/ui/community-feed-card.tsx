'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ActionBar } from '@/components/ui/action-bar';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import { Heart, MessageCircle, Share2, Bookmark, Eye, Clock, ChevronDown } from 'lucide-react';

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
  onClick?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  liked?: boolean;
  bookmarked?: boolean;
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
      onClick,
      onLike,
      onShare,
      onBookmark,
      liked = false,
      bookmarked = false,
      feedType,
      selectedReason,
      className,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 300;

    // Optimistic Update를 위한 로컬 state
    const [localLiked, setLocalLiked] = useState(liked);
    const [localLikeCount, setLocalLikeCount] = useState(stats?.likeCount ?? 0);

    // props가 변경되면 로컬 state도 업데이트
    React.useEffect(() => {
      setLocalLiked(liked);
      setLocalLikeCount(stats?.likeCount ?? 0);
    }, [liked, stats?.likeCount]);

    // contentHtml이 있는 경우 텍스트로 변환하여 길이 체크
    const getPlainText = () => {
      if (contentHtml) {
        const div = document.createElement('div');
        div.innerHTML = contentHtml;
        return div.textContent || div.innerText || '';
      }
      return content;
    };

    const plainText = getPlainText();
    const isTruncatable = plainText.length > MAX_LENGTH;
    const displayText = !isExpanded && isTruncatable ? plainText.substring(0, MAX_LENGTH) : plainText;

    const actions = [];

    if (onLike) {
      actions.push({
        id: 'like',
        icon: <Heart className={cn('h-5 w-5', localLiked && 'fill-current text-coral-500')} />,
        label: localLikeCount ? `${localLikeCount}` : '0',
        pressed: localLiked,
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
          // Optimistic Update
          setLocalLiked(!localLiked);
          setLocalLikeCount(prev => localLiked ? prev - 1 : prev + 1);
          onLike?.();
          break;
        case 'share':
          onShare?.();
          break;
      }
    };

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
        {/* Feed Type Badge */}
        {feedType && (
          <div className="mb-3">
            <Badge tone="slate" className="text-xs">
              {feedType}
            </Badge>
          </div>
        )}

        {/* Header - User Profile */}
        <div className="flex items-start justify-between mb-2">
          <Link
            href={`/profile/${userProfile.id}`}
            variant="nav"
            className="flex items-start gap-3 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile.image_url} alt={userProfile.name || '사용자'} />
              <AvatarFallback>{userProfile.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">
                {userProfile.name || '알 수 없는 사용자'}
              </span>
              {userProfile.headline && (
                <p className="text-sm text-slate-600">{userProfile.headline}</p>
              )}
            </div>
          </Link>
        </div>

        {/* Content */}
        <div className="mb-2">
          {contentHtml ? (
            <div className="text-slate-900 text-sm leading-relaxed prose prose-sm max-w-none break-words whitespace-pre-wrap">
              {isExpanded ? (
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              ) : isTruncatable ? (
                <div dangerouslySetInnerHTML={{ __html: contentHtml.substring(0, MAX_LENGTH) }} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              )}
            </div>
          ) : (
            <p className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {displayText}
              {!isExpanded && isTruncatable && '...'}
            </p>
          )}

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

        {/* Images */}
        {imageUrls.length > 0 && (
          <div className={cn(
            'mb-2 rounded-lg overflow-hidden',
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
        {stats && (stats.viewCount || localLikeCount || stats.replyCount) && (
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2 pb-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatRelativeTime(createdAt)}</span>
            </div>
            {stats.viewCount !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{stats.viewCount.toLocaleString()} 조회</span>
              </div>
            )}
            {localLikeCount > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                <span>{localLikeCount.toLocaleString()} 좋아요</span>
              </div>
            )}
            {stats.replyCount !== undefined && stats.replyCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{stats.replyCount.toLocaleString()} 댓글</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div
            className="flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
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
