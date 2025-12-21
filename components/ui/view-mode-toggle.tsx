'use client';

import * as React from 'react';
import { FileText, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'answer' | 'sources';

export interface ViewModeToggleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const ViewModeToggle = React.forwardRef<HTMLDivElement, ViewModeToggleProps>(
  ({ mode, onChange, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center bg-slate-100 rounded-lg p-1 gap-1', className)}
        role="tablist"
        {...props}
      >
        <button
          type="button"
          role="tab"
          onClick={() => onChange('answer')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
            mode === 'answer'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          )}
          aria-pressed={mode === 'answer'}
          aria-selected={mode === 'answer'}
          aria-label="Answer view"
        >
          <FileText className="h-4 w-4" />
          <span>답변</span>
        </button>
        <button
          type="button"
          role="tab"
          onClick={() => onChange('sources')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
            mode === 'sources'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          )}
          aria-pressed={mode === 'sources'}
          aria-selected={mode === 'sources'}
          aria-label="Sources view"
        >
          <Link2 className="h-4 w-4" />
          <span>출처</span>
        </button>
      </div>
    );
  }
);

ViewModeToggle.displayName = 'ViewModeToggle';

export { ViewModeToggle };
