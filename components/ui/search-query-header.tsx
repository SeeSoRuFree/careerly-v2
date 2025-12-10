'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SearchQueryHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  queryText: string;
}

const SearchQueryHeader = React.forwardRef<HTMLDivElement, SearchQueryHeaderProps>(
  ({ queryText, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between gap-4 p-4 border-b border-slate-200', className)}
        {...props}
      >
        <h1 className="text-2xl font-semibold text-slate-900 flex-1 leading-tight">
          {queryText}
        </h1>
      </div>
    );
  }
);

SearchQueryHeader.displayName = 'SearchQueryHeader';

export { SearchQueryHeader };
