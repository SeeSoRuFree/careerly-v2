'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Chip } from '@/components/ui/chip';

export interface TagBarProps {
  tags: string[];
  activeTags?: string[];
  onToggle?: (tag: string) => void;
  scrollable?: boolean;
  className?: string;
}

const TagBar = React.forwardRef<HTMLDivElement, TagBarProps>(
  ({ tags, activeTags = [], onToggle, scrollable = true, className }, ref) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [showLeftShadow, setShowLeftShadow] = React.useState(false);
    const [showRightShadow, setShowRightShadow] = React.useState(false);

    const handleScroll = React.useCallback(() => {
      if (!scrollContainerRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftShadow(scrollLeft > 0);
      setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 1);
    }, []);

    React.useEffect(() => {
      if (scrollable && scrollContainerRef.current) {
        handleScroll();
        const container = scrollContainerRef.current;
        container.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);

        return () => {
          container.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', handleScroll);
        };
      }
    }, [scrollable, handleScroll, tags]);

    return (
      <div ref={ref} className={cn('relative', className)}>
        {/* Left Shadow */}
        {scrollable && showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
        )}

        {/* Tags Container */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex gap-2 py-2',
            scrollable && 'overflow-x-auto scrollbar-hide',
            !scrollable && 'flex-wrap'
          )}
        >
          {tags.map((tag) => {
            const isActive = activeTags.includes(tag);
            return (
              <Chip
                key={tag}
                variant={isActive ? 'coral' : 'default'}
                className={cn(
                  'shrink-0'
                )}
                onToggle={() => onToggle?.(tag)}
              >
                {tag}
              </Chip>
            );
          })}
        </div>

        {/* Right Shadow */}
        {scrollable && showRightShadow && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
        )}
      </div>
    );
  }
);

TagBar.displayName = 'TagBar';

export { TagBar };
