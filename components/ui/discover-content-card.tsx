'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { MediaThumb } from '@/components/ui/media-thumb';
import { MetaRow } from '@/components/ui/meta-row';
import { ActionBar } from '@/components/ui/action-bar';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { Heart, Bookmark, Share2, Clock, Eye } from 'lucide-react';

export interface DiscoverContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  summary?: string;
  thumbnailUrl?: string;
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
  liked?: boolean;
  bookmarked?: boolean;
  layout?: 'vertical' | 'horizontal';
}

export const DiscoverContentCard = React.forwardRef<HTMLDivElement, DiscoverContentCardProps>(
  (
    {
      title,
      summary,
      thumbnailUrl,
      sources,
      postedAt,
      stats,
      href,
      badge,
      badgeTone = 'coral',
      onLike,
      onBookmark,
      onShare,
      liked = false,
      bookmarked = false,
      layout = 'vertical',
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
            'flex flex-row gap-4',
            className
          )}
          {...props}
        >
          {/* Thumbnail */}
          {thumbnailUrl && (
            <div className="relative overflow-hidden rounded-lg shrink-0 w-80">
              <MediaThumb
                src={thumbnailUrl}
                alt={title}
                ratio="16:9"
                badge={badge}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col flex-1 space-y-3">
            {/* Badge (if no thumbnail) */}
            {badge && !thumbnailUrl && (
              <div>
                <Badge tone={badgeTone}>{badge}</Badge>
              </div>
            )}

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
            <div className="flex items-center justify-between gap-4">
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
          className
        )}
        {...props}
      >
        {/* Thumbnail */}
        {thumbnailUrl && (
          <div className="relative mb-3 overflow-hidden rounded-lg">
            <MediaThumb
              src={thumbnailUrl}
              alt={title}
              ratio="16:9"
              badge={badge}
            />
          </div>
        )}

        {/* Content - No card wrapper */}
        <div className="flex flex-col flex-1 space-y-3">
          {/* Badge (if no thumbnail) */}
          {badge && !thumbnailUrl && (
            <div>
              <Badge tone={badgeTone}>{badge}</Badge>
            </div>
          )}

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
