'use client';

import * as React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';

export interface QuoteSourceLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  faviconUrl?: string;
  href: string;
  showIcon?: boolean;
}

const QuoteSourceLink = React.forwardRef<HTMLAnchorElement, QuoteSourceLinkProps>(
  ({ title, faviconUrl, href, showIcon = true, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors duration-200 text-sm text-slate-700 hover:text-slate-900 hover:border-slate-300',
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
        {showIcon && <ExternalLink className="h-3 w-3 text-slate-400 flex-shrink-0" />}
      </a>
    );
  }
);

QuoteSourceLink.displayName = 'QuoteSourceLink';

export { QuoteSourceLink };
