'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Heart, Bookmark, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DiscoverDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    title: string;
    summary: string;
    imageUrl?: string;
    externalUrl: string;
    likes?: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
}

export function DiscoverDetailDrawer({
  isOpen,
  onClose,
  content,
}: DiscoverDetailDrawerProps) {
  const [liked, setLiked] = React.useState(content.isLiked || false);
  const [bookmarked, setBookmarked] = React.useState(content.isBookmarked || false);

  const handleLike = () => {
    setLiked(!liked);
    // TODO: API 호출
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // TODO: API 호출
  };

  const handleOpenExternal = () => {
    window.open(content.externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Drawer Content */}
        <Dialog.Content
          className={cn(
            'fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[540px] bg-white shadow-2xl',
            'flex flex-col',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            'data-[state=closed]:duration-300 data-[state=open]:duration-300'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10 safe-mt">
            <Dialog.Title className="text-lg font-semibold text-slate-900 line-clamp-1">
              {content.title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-2 hover:bg-slate-100 transition-colors"
                aria-label="닫기"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Thumbnail Image */}
              {content.imageUrl && (
                <div className="relative w-full h-64 rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={content.imageUrl}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                  {content.title}
                </h2>
              </div>

              {/* Summary */}
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {content.summary}
                </p>
              </div>

              {/* External Link Button */}
              <div>
                <Button
                  variant="solid"
                  size="md"
                  className="w-full"
                  onClick={handleOpenExternal}
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  외부 사이트에서 보기
                </Button>
              </div>
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="border-t border-slate-200 px-6 py-4 bg-white sticky bottom-0 safe-mb">
            <div className="flex items-center justify-between gap-4">
              {/* Like Button */}
              <Button
                variant={liked ? 'solid' : 'outline'}
                size="md"
                className={cn(
                  'flex-1',
                  liked && 'bg-coral-500 hover:bg-coral-600 text-white border-coral-500'
                )}
                onClick={handleLike}
              >
                <Heart
                  className={cn('h-5 w-5 mr-2', liked && 'fill-current')}
                />
                좋아요 {content.likes && content.likes > 0 ? `(${content.likes})` : ''}
              </Button>

              {/* Bookmark Button */}
              <Button
                variant={bookmarked ? 'solid' : 'outline'}
                size="md"
                className={cn(
                  'flex-1',
                  bookmarked && 'bg-slate-900 hover:bg-slate-800 text-white'
                )}
                onClick={handleBookmark}
              >
                <Bookmark
                  className={cn('h-5 w-5 mr-2', bookmarked && 'fill-current')}
                />
                북마크
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
