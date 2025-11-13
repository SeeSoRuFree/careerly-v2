'use client';

import * as React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';

export interface SearchResultItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  title: string;
  snippet: string;
  href: string;
  faviconUrl?: string;
}

const SearchResultItem = React.forwardRef<HTMLAnchorElement, SearchResultItemProps>(
  ({ title, snippet, href, faviconUrl, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'block p-3 rounded-lg transition-all duration-200 group',
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {faviconUrl ? (
            <Avatar className="h-5 w-5 rounded-sm flex-shrink-0 mt-0.5">
              <img src={faviconUrl} alt="" className="h-5 w-5 object-contain" />
            </Avatar>
          ) : (
            <Globe className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-coral-600 transition-colors line-clamp-2">
                {title}
              </h3>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-coral-500 flex-shrink-0 mt-0.5 transition-colors" />
            </div>
            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{snippet}</p>
          </div>
        </div>
      </a>
    );
  }
);

SearchResultItem.displayName = 'SearchResultItem';

export { SearchResultItem };
