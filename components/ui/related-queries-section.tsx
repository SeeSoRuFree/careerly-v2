'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RelatedQuery {
  id: string;
  queryText: string;
  href: string;
}

export interface RelatedQueriesSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  relatedQueries: RelatedQuery[];
  title?: string;
  onQueryClick?: (query: RelatedQuery) => void;
}

const RelatedQueriesSection = React.forwardRef<HTMLDivElement, RelatedQueriesSectionProps>(
  ({ relatedQueries, title = 'Related questions', onQueryClick, className, ...props }, ref) => {
    if (!relatedQueries || relatedQueries.length === 0) {
      return null;
    }

    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <div className="space-y-2">
          {relatedQueries.map((query) => (
            <a
              key={query.id}
              href={query.href}
              onClick={(e) => {
                if (onQueryClick) {
                  e.preventDefault();
                  onQueryClick(query);
                }
              }}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group"
            >
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-coral-500 flex-shrink-0 mt-0.5 transition-colors" />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 flex-1">
                {query.queryText}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  }
);

RelatedQueriesSection.displayName = 'RelatedQueriesSection';

export { RelatedQueriesSection };
