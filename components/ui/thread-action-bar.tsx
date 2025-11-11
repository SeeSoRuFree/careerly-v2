'use client';

import * as React from 'react';
import { Share2, Bookmark, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/icon-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ThreadActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onShare?: () => void;
  onBookmark?: () => void;
  onExport?: () => void;
  onRewrite?: () => void;
  isBookmarked?: boolean;
}

const ThreadActionBar = React.forwardRef<HTMLDivElement, ThreadActionBarProps>(
  ({ onShare, onBookmark, onExport, onRewrite, isBookmarked = false, className, ...props }, ref) => {
    return (
      <TooltipProvider>
        <div ref={ref} className={cn('flex items-center gap-1', className)} {...props}>
          {onShare && (
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  variant="ghost"
                  size="md"
                  onClick={onShare}
                  aria-label="Share thread"
                >
                  <Share2 className="h-4 w-4" />
                </IconButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onBookmark && (
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  variant="ghost"
                  size="md"
                  pressed={isBookmarked}
                  onClick={onBookmark}
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                </IconButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isBookmarked ? "Remove bookmark" : "Bookmark"}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onExport && (
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  variant="ghost"
                  size="md"
                  onClick={onExport}
                  aria-label="Export thread"
                >
                  <Download className="h-4 w-4" />
                </IconButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onRewrite && (
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  variant="ghost"
                  size="md"
                  onClick={onRewrite}
                  aria-label="Rewrite answer"
                >
                  <RefreshCw className="h-4 w-4" />
                </IconButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rewrite</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  }
);

ThreadActionBar.displayName = 'ThreadActionBar';

export { ThreadActionBar };
