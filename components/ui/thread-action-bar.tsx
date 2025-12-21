'use client';

import * as React from 'react';
import { Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackAIShare } from '@/lib/analytics';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ThreadActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  sessionId?: string;
  isPublic?: boolean;
  onShare?: () => void;
  /** @deprecated No longer used - kept for backward compatibility */
  onShareToCommunity?: () => void;
  /** @deprecated No longer used - kept for backward compatibility */
  onBookmark?: () => void;
  /** @deprecated No longer used - kept for backward compatibility */
  isBookmarked?: boolean;
  /** @deprecated No longer used - kept for backward compatibility */
  isSharedToCommunity?: boolean;
}

const ThreadActionBar = React.forwardRef<HTMLDivElement, ThreadActionBarProps>(
  ({ sessionId, onShare, className, ...props }, ref) => {
    const [justCopied, setJustCopied] = React.useState(false);

    const handleShareClick = async () => {
      if (!sessionId) {
        // sessionId가 없으면 기존 onShare 콜백 실행
        onShare?.();
        return;
      }

      try {
        // 바로 share URL 복사
        const url = `${window.location.origin}/share/${sessionId}`;
        await navigator.clipboard.writeText(url);
        setJustCopied(true);
        // GA4 트래킹
        trackAIShare(sessionId, 'copy_link');
        setTimeout(() => {
          setJustCopied(false);
        }, 2000);
      } catch (error) {
        console.error('Share failed:', error);
      }
    };

    return (
      <TooltipProvider>
        <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
          {(onShare || sessionId) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleShareClick}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
                    'bg-teal-50 hover:bg-teal-100 text-teal-700 hover:text-teal-800',
                    'border border-teal-200 hover:border-teal-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
                    justCopied && 'bg-teal-100 border-teal-300'
                  )}
                  aria-label="Share thread"
                >
                  {justCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      <span>공유하기</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{justCopied ? '링크가 클립보드에 복사되었습니다' : '공유 링크 복사'}</p>
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
