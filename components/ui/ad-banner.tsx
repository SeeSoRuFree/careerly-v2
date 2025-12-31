'use client';

import * as React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdBannerProps {
  variant?: 'native' | 'card';
  imageUrl: string;
  title: string;
  description: string;
  linkUrl: string;
  onClose?: () => void;
  className?: string;
}

export function AdBanner({
  variant = 'native',
  imageUrl,
  title,
  description,
  linkUrl,
  onClose,
  className,
}: AdBannerProps) {
  const handleClick = () => {
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'relative bg-white rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow',
          className
        )}
        onClick={handleClick}
      >
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-2 right-2 z-10 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            aria-label="광고 닫기"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-400 mb-1">Sponsored</p>
          <h3 className="font-medium text-sm text-slate-900 line-clamp-1">{title}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
        </div>
      </div>
    );
  }

  // Native variant (default)
  return (
    <div
      className={cn(
        'relative bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={handleClick}
    >
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 z-10 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          aria-label="광고 닫기"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}
      <div className="flex gap-4 p-4">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 mb-1">Sponsored</p>
          <h3 className="font-semibold text-slate-900 line-clamp-2">{title}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
}
