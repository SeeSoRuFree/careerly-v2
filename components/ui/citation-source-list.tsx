'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { QuoteSourceLink } from '@/components/ui/quote-source-link';

export interface CitationSource {
  id: string;
  title: string;
  href?: string;
  faviconUrl?: string;
}

export interface CitationSourceListProps extends React.HTMLAttributes<HTMLDivElement> {
  sources: CitationSource[];
  title?: string;
  onSourceClick?: (href: string, position: number) => void;
}

const CitationSourceList = React.forwardRef<HTMLDivElement, CitationSourceListProps>(
  ({ sources, title = 'Sources', onSourceClick, className, ...props }, ref) => {
    if (!sources || sources.length === 0) {
      return null;
    }

    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {sources.map((source, index) => (
            <QuoteSourceLink
              key={source.id}
              title={source.title}
              href={source.href}
              faviconUrl={source.faviconUrl}
              onClick={() => onSourceClick?.(source.href || '', index + 1)}
            />
          ))}
        </div>
      </div>
    );
  }
);

CitationSourceList.displayName = 'CitationSourceList';

export { CitationSourceList };
