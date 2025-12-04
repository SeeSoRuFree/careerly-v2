'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';

export interface QuoteSourceLinkProps extends React.HTMLAttributes<HTMLSpanElement> {
  title: string;
  faviconUrl?: string;
  showIcon?: boolean;
}

const QuoteSourceLink = React.forwardRef<HTMLSpanElement, QuoteSourceLinkProps>(
  ({ title, faviconUrl, showIcon = false, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700',
          className
        )}
        {...props}
      >
        {faviconUrl ? (
          <Avatar className="h-4 w-4 rounded-sm">
            <img src={faviconUrl} alt="" className="h-4 w-4 object-contain" />
          </Avatar>
        ) : (
          <Globe className="h-4 w-4 text-slate-400" />
        )}
        <span className="truncate max-w-[200px]">{title}</span>
      </span>
    );
  }
);

QuoteSourceLink.displayName = 'QuoteSourceLink';

export { QuoteSourceLink };
