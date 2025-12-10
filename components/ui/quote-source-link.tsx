'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';

export interface QuoteSourceLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  href?: string;
  faviconUrl?: string;
  showIcon?: boolean;
}

const QuoteSourceLink = React.forwardRef<HTMLAnchorElement, QuoteSourceLinkProps>(
  ({ title, href, faviconUrl, showIcon = false, className, ...props }, ref) => {
    const content = (
      <>
        {faviconUrl ? (
          <Avatar className="h-4 w-4 rounded-sm">
            <img src={faviconUrl} alt="" className="h-4 w-4 object-contain" />
          </Avatar>
        ) : (
          <Globe className="h-4 w-4 text-slate-400" />
        )}
        <span className="truncate max-w-[150px] sm:max-w-[200px]">{title}</span>
      </>
    );

    if (!href) {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700',
            className
          )}
        >
          {content}
        </span>
      );
    }

    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 hover:border-teal-300 transition-colors cursor-pointer',
          className
        )}
        {...props}
      >
        {content}
      </a>
    );
  }
);

QuoteSourceLink.displayName = 'QuoteSourceLink';

export { QuoteSourceLink };
