'use client';

import * as React from 'react';
import { X, Heart, ExternalLink, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type ContentType = 'jobs' | 'blogs' | 'books' | 'courses';

export interface ContentDetailData {
  id: string;
  title: string;
  summary: string;
  externalUrl?: string;
  imageUrl?: string;
  companyName?: string;
  companyLogo?: string;
  isLiked: boolean;
  isBookmarked: boolean;
  views: number;
  likes: number;
}

export interface ContentDetailDrawerProps {
  open: boolean;
  content: ContentDetailData | null;
  contentType?: ContentType;
  onClose: () => void;
  onContentChange: (content: ContentDetailData | null) => void;
}

export function ContentDetailDrawer({
  open,
  content,
  contentType = 'jobs',
  onClose,
  onContentChange,
}: ContentDetailDrawerProps) {
  const handleLikeContent = () => {
    if (!content) return;
    onContentChange({
      ...content,
      isLiked: !content.isLiked,
      likes: content.isLiked ? content.likes - 1 : content.likes + 1,
    });
  };

  const handleBookmarkContent = () => {
    if (!content) return;
    onContentChange({
      ...content,
      isBookmarked: !content.isBookmarked,
    });
  };

  // 콘텐츠 타입별 버튼 텍스트
  const getButtonText = () => {
    switch (contentType) {
      case 'jobs':
        return '공고 보기';
      case 'blogs':
        return '블로그 보기';
      case 'books':
        return '도서 보기';
      case 'courses':
        return '강의 보기';
      default:
        return '자세히 보기';
    }
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto border-l border-slate-100',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {content && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {content.companyLogo && (
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden">
                    <img
                      src={content.companyLogo}
                      alt={content.companyName}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-slate-900">{content.companyName}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
                  {content.title}
                </h1>

                {/* Summary */}
                <div className="prose prose-slate max-w-none mb-6">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{content.summary}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-8">
                  <Button
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                    onClick={() => content.externalUrl && window.open(content.externalUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {getButtonText()}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      'border-slate-200',
                      content.isLiked && 'bg-red-50 border-red-200'
                    )}
                    onClick={handleLikeContent}
                  >
                    <Heart
                      className={cn('h-4 w-4', content.isLiked && 'fill-red-500 text-red-500')}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      'border-slate-200',
                      content.isBookmarked && 'bg-teal-50 border-teal-200'
                    )}
                    onClick={handleBookmarkContent}
                  >
                    <Bookmark
                      className={cn(
                        'h-4 w-4',
                        content.isBookmarked && 'fill-teal-500 text-teal-500'
                      )}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
    </>
  );
}
