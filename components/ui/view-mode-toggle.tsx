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
        className={cn('inline-flex items-center bg-slate-100 rounded-lg p-1', className)}
        {...props}
      >
        <button
          type="button"
          onClick={() => onChange('answer')}
          className={cn(
            'flex items-center justify-center p-2 rounded-md text-sm font-medium transition-all duration-200',
            mode === 'answer'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
          aria-pressed={mode === 'answer'}
          aria-label="Answer view"
        >
          <FileText className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange('sources')}
          className={cn(
            'flex items-center justify-center p-2 rounded-md text-sm font-medium transition-all duration-200',
            mode === 'sources'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
          aria-pressed={mode === 'sources'}
          aria-label="Sources view"
        >
          <Link2 className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

ViewModeToggle.displayName = 'ViewModeToggle';

export { ViewModeToggle };
