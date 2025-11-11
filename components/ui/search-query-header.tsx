'use client';

import * as React from 'react';
import { Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/icon-button';

export interface SearchQueryHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  queryText: string;
  onEdit?: () => void;
  editable?: boolean;
}

const SearchQueryHeader = React.forwardRef<HTMLDivElement, SearchQueryHeaderProps>(
  ({ queryText, onEdit, editable = true, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between gap-4 p-4 border-b border-slate-200', className)}
        {...props}
      >
        <h1 className="text-2xl font-semibold text-slate-900 flex-1 leading-tight">
          {queryText}
        </h1>
        {editable && onEdit && (
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onEdit}
            aria-label="Edit query"
          >
            <Edit2 className="h-4 w-4" />
          </IconButton>
        )}
      </div>
    );
  }
);

SearchQueryHeader.displayName = 'SearchQueryHeader';

export { SearchQueryHeader };
