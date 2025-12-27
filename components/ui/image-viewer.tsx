'use client';

import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

export function ImageViewer({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when modal opens with new initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handlePrevious = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (images.length === 0) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black z-[200] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <Dialog.Content
          className={cn(
            "fixed inset-0 z-[200] flex items-center justify-center",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "focus:outline-none"
          )}
          onClick={onClose}
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <button
              className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="닫기"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </Dialog.Close>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-[calc(env(safe-area-inset-top)+1rem)] left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentIndex]}
              alt={`이미지 ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="다음 이미지"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          )}

          {/* Thumbnail indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    idx === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
                  )}
                  aria-label={`이미지 ${idx + 1}로 이동`}
                />
              ))}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
