'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { MediaThumb } from '@/components/ui/media-thumb';
import { MetaRow } from '@/components/ui/meta-row';
import { ActionBar } from '@/components/ui/action-bar';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { Heart, Bookmark, Share2, Clock, Eye, Image as ImageIcon } from 'lucide-react';

export interface DiscoverContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  contentId?: string | number;
  title: string;
  summary?: string;
  thumbnailUrl?: string;
  usePlainImg?: boolean;
  sources?: {
    name: string;
    icon?: React.ReactNode;
    href?: string;
  }[];
  postedAt?: string;
  stats?: {
    likes?: number;
    views?: number;
    bookmarks?: number;
  };
  href?: string;
  badge?: string;
  badgeTone?: 'default' | 'slate' | 'coral' | 'success' | 'warning';
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onCardClick?: () => void;
  liked?: boolean;
  bookmarked?: boolean;
  layout?: 'vertical' | 'horizontal';
  tags?: string[];
}

export const DiscoverContentCard = React.forwardRef<HTMLDivElement, DiscoverContentCardProps>(
  (
    {
      title,
      summary,
      thumbnailUrl,
      usePlainImg = false,
      sources,
      postedAt,
      stats,
      href,
      badge,
      badgeTone = 'coral',
      onLike,
      onBookmark,
      onShare,
      onCardClick,
      liked = false,
      bookmarked = false,
      layout = 'vertical',
      tags,
      className,
      ...props
    },
    ref
  ) => {
    const metaItems = [];

    if (sources && sources.length > 0) {
      const sourceItem: any = {
        icon: sources[0].icon,
        label: sources[0].name,
      };
      if (sources[0].href) {
        sourceItem.href = sources[0].href;
      }
      metaItems.push(sourceItem);
    }

    if (stats?.views) {
      metaItems.push({
        icon: <Eye className="h-4 w-4" />,
        label: `${stats.views.toLocaleString()} 조회`,
      });
    }

    const actions = [];

    if (onLike) {
      actions.push({
        id: 'like',
        icon: <Heart className={cn('h-5 w-5', liked && 'fill-current')} />,
        label: stats?.likes ? `${stats.likes}` : '좋아요',
        pressed: liked,
      });
    }

    if (onBookmark) {
      actions.push({
        id: 'bookmark',
        icon: <Bookmark className={cn('h-5 w-5', bookmarked && 'fill-current')} />,
        label: '북마크',
        pressed: bookmarked,
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
        case 'bookmark':
          onBookmark?.();
          break;
        case 'share':
          onShare?.();
          break;
      }
    };

    // Horizontal layout
    if (layout === 'horizontal') {
      return (
        <div
          ref={ref}
          className={cn(
            'group relative overflow-hidden transition-all duration-300',
            'hover:translate-y-[-2px]',
            'flex flex-row gap-3',
            onCardClick && 'cursor-pointer',
            className
          )}
          onClick={onCardClick}
          {...props}
        >
          {/* Thumbnail */}
          <div className="relative overflow-hidden rounded-lg shrink-0 w-80">
            {thumbnailUrl ? (
              usePlainImg ? (
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                  {badge && (
                    <div className="absolute top-2 right-2">
                      <Badge tone={badgeTone}>{badge}</Badge>
                    </div>
                  )}
                </div>
              ) : (
                <MediaThumb
                  src={thumbnailUrl}
                  alt={title}
                  ratio="16:9"
                  badge={badge}
                />
              )
            ) : (
              <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="text-slate-400 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                  <p className="text-xs">이미지 없음</p>
                </div>
                {badge && (
                  <div className="absolute top-2 right-2">
                    <Badge tone={badgeTone}>{badge}</Badge>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 space-y-3">

            {/* Title */}
            {href ? (
              <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-coral-500 transition-colors leading-snug">
                <Link href={href} variant="subtle" className="hover:text-coral-500">
                  {title}
                </Link>
              </h3>
            ) : (
              <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-coral-500 transition-colors leading-snug">
                {title}
              </h3>
            )}

            {/* Summary */}
            {summary && (
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {summary}
              </p>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 5).map((tag) => (
                  <Chip key={tag} variant="default" className="text-xs px-2 py-0.5">
                    {tag}
                  </Chip>
                ))}
              </div>
            )}

            {/* Posted Date */}
            {postedAt && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {postedAt}
              </p>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Meta Info & Actions - Always at bottom */}
            <div className="flex items-center justify-between gap-3">
              {metaItems.length > 0 && (
                <MetaRow items={metaItems} />
              )}

              {actions.length > 0 && (
                <div className="opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                  <ActionBar
                    actions={actions}
                    onAction={handleAction}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Vertical layout (default)
    return (
      <div
        ref={ref}
        className={cn(
          'group relative overflow-hidden transition-all duration-300',
          'hover:translate-y-[-2px]',
          'flex flex-col',
          onCardClick && 'cursor-pointer',
          className
        )}
        onClick={onCardClick}
        {...props}
      >
        {/* Thumbnail */}
        <div className="relative mb-3 overflow-hidden rounded-lg">
          {thumbnailUrl ? (
            usePlainImg ? (
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                />
                {badge && (
                  <div className="absolute top-2 right-2">
                    <Badge tone={badgeTone}>{badge}</Badge>
                  </div>
                )}
              </div>
            ) : (
              <MediaThumb
                src={thumbnailUrl}
                alt={title}
                ratio="16:9"
                badge={badge}
              />
            )
          ) : (
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <div className="text-slate-400 text-center">
                <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                <p className="text-xs">이미지 없음</p>
              </div>
              {badge && (
                <div className="absolute top-2 right-2">
                  <Badge tone={badgeTone}>{badge}</Badge>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content - No card wrapper */}
        <div className="flex flex-col flex-1 space-y-3">

          {/* Title */}
          {href ? (
            <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-coral-500 transition-colors leading-snug">
              <Link href={href} variant="subtle" className="hover:text-coral-500">
                {title}
              </Link>
            </h3>
          ) : (
            <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-coral-500 transition-colors leading-snug">
              {title}
            </h3>
          )}

          {/* Summary */}
          {summary && (
            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
              {summary}
            </p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 5).map((tag) => (
                <Chip key={tag} variant="default" className="text-xs px-1.5 py-0.5">
                  {tag}
                </Chip>
              ))}
            </div>
          )}

          {/* Posted Date */}
          {postedAt && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {postedAt}
            </p>
          )}

          {/* Spacer to push meta to bottom */}
          <div className="flex-1" />

          {/* Meta Info - Always at bottom */}
          <div className="space-y-2 mt-auto">
            {metaItems.length > 0 && (
              <MetaRow items={metaItems} />
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                <ActionBar
                  actions={actions}
                  onAction={handleAction}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

DiscoverContentCard.displayName = 'DiscoverContentCard';
