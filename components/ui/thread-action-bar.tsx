'use client';

import * as React from 'react';
import { Share2, Bookmark, Check, Loader2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/icon-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useShareSession, useShareToCommunity } from '@/lib/api';

export interface ThreadActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  sessionId?: string;
  isPublic?: boolean;
  onShare?: () => void;
  onShareToCommunity?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  /** 커뮤니티에 이미 공유됐는지 여부 */
  isSharedToCommunity?: boolean;
}

const ThreadActionBar = React.forwardRef<HTMLDivElement, ThreadActionBarProps>(
  ({ sessionId, isPublic = false, onShare, onShareToCommunity, onBookmark, isBookmarked = false, isSharedToCommunity = false, className, ...props }, ref) => {
    const shareSession = useShareSession();
    const shareToCommunity = useShareToCommunity();
    const [justCopied, setJustCopied] = React.useState(false);
    const [shareStatus, setShareStatus] = React.useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
    const [communityShareStatus, setCommunityShareStatus] = React.useState<'idle' | 'sharing' | 'shared' | 'error'>('idle');

    const handleShareClick = async () => {
      if (!sessionId) {
        // sessionId가 없으면 기존 onShare 콜백 실행
        onShare?.();
        return;
      }

      try {
        setShareStatus('copying');

        // 이미 공개 상태면 바로 URL 복사
        if (isPublic) {
          const url = `${window.location.origin}/share/${sessionId}`;
          await navigator.clipboard.writeText(url);
          setJustCopied(true);
          setShareStatus('copied');
          setTimeout(() => {
            setJustCopied(false);
            setShareStatus('idle');
          }, 2000);
          return;
        }

        // 공개 설정 후 URL 복사
        await shareSession.mutateAsync({ sessionId, isPublic: true });
        const url = `${window.location.origin}/share/${sessionId}`;
        await navigator.clipboard.writeText(url);
        setJustCopied(true);
        setShareStatus('copied');
        setTimeout(() => {
          setJustCopied(false);
          setShareStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Share failed:', error);
        setShareStatus('error');
        setTimeout(() => setShareStatus('idle'), 3000);
        // 에러는 전역 에러 핸들러에서 자동으로 토스트 표시
      }
    };

    const handleShareToCommunity = async () => {
      if (!sessionId) {
        onShareToCommunity?.();
        return;
      }

      // 이미 공유된 상태면 무시
      if (isSharedToCommunity || communityShareStatus === 'shared') {
        return;
      }

      try {
        setCommunityShareStatus('sharing');
        await shareToCommunity.mutateAsync({ sessionId });
        setCommunityShareStatus('shared');
        onShareToCommunity?.();
      } catch (error) {
        console.error('Share to community failed:', error);
        setCommunityShareStatus('error');
        setTimeout(() => setCommunityShareStatus('idle'), 3000);
      }
    };

    return (
      <TooltipProvider>
        <div ref={ref} className={cn('flex items-center gap-1', className)} {...props}>
          {(onShare || sessionId) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  variant="ghost"
                  size="md"
                  onClick={handleShareClick}
                  disabled={shareSession.isPending}
                  aria-label="Share thread"
                >
                  {shareSession.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : justCopied ? (
                    <Check className="h-4 w-4 text-teal-600" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                </IconButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>{justCopied ? '복사됨!' : isPublic ? '링크 복사' : '공유하기'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {sessionId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  variant="ghost"
                  size="md"
                  onClick={handleShareToCommunity}
                  disabled={shareToCommunity.isPending || isSharedToCommunity || communityShareStatus === 'shared'}
                  aria-label="커뮤니티에 공유"
                >
                  {shareToCommunity.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (isSharedToCommunity || communityShareStatus === 'shared') ? (
                    <Check className="h-4 w-4 text-teal-600" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                </IconButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>{(isSharedToCommunity || communityShareStatus === 'shared') ? '커뮤니티에 공유됨' : '커뮤니티에 공유'}</p>
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
        </div>
      </TooltipProvider>
    );
  }
);

ThreadActionBar.displayName = 'ThreadActionBar';

export { ThreadActionBar };
