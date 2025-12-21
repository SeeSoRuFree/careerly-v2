'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, MessageCircle, Share2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  useShareToCommunity,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useCurrentUser,
} from '@/lib/api';
import { useRouter } from 'next/navigation';

export interface EngagementStats {
  likes: number;
  bookmarks: number;
  comments: number;
}

export interface EngagementBarProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: EngagementStats;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  hasSharedPost?: boolean;
  isOwner?: boolean;
  sessionId?: string;
  postId?: number; // shared_post의 ID
}

const EngagementBar = React.forwardRef<HTMLDivElement, EngagementBarProps>(
  (
    {
      stats,
      isLiked: initialIsLiked = false,
      isBookmarked: initialIsBookmarked = false,
      onLike,
      onBookmark,
      onShare,
      hasSharedPost = false,
      isOwner = false,
      sessionId,
      postId,
      className,
      ...props
    },
    ref
  ) => {
    const router = useRouter();
    const { data: currentUser } = useCurrentUser();

    // Mutations
    const shareSessionMutation = useShareToCommunity();
    const likePostMutation = useLikePost();
    const unlikePostMutation = useUnlikePost();
    const savePostMutation = useSavePost();
    const unsavePostMutation = useUnsavePost();

    // Local state for optimistic updates
    const [isLiked, setIsLiked] = React.useState(initialIsLiked);
    const [isBookmarked, setIsBookmarked] = React.useState(initialIsBookmarked);

    React.useEffect(() => {
      setIsLiked(initialIsLiked);
    }, [initialIsLiked]);

    React.useEffect(() => {
      setIsBookmarked(initialIsBookmarked);
    }, [initialIsBookmarked]);

    const handleShare = () => {
      if (onShare) {
        onShare();
      } else {
        // Default share behavior: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('링크가 복사되었습니다');
      }
    };

    const handleShareToCommunity = async () => {
      if (!sessionId) {
        toast.error('세션 ID가 없습니다');
        return;
      }

      try {
        const result = await shareSessionMutation.mutateAsync({ sessionId });
        toast.success('커뮤니티에 공유되었습니다');
        // 생성된 포스트로 이동
        router.push(`/post/${result.id}`);
      } catch (error) {
        // 에러는 자동으로 토스트에 표시됨 (전역 에러 처리)
        console.error('커뮤니티 공유 실패:', error);
      }
    };

    const handleLike = async () => {
      if (!currentUser) {
        toast.error('로그인이 필요합니다');
        router.push('/login');
        return;
      }

      if (!hasSharedPost || !postId) {
        return;
      }

      if (onLike) {
        onLike();
        return;
      }

      // Optimistic update
      setIsLiked(!isLiked);

      try {
        if (isLiked) {
          await unlikePostMutation.mutateAsync(postId);
        } else {
          await likePostMutation.mutateAsync(postId);
        }
      } catch (error) {
        // Rollback on error
        setIsLiked(isLiked);
      }
    };

    const handleBookmark = async () => {
      if (!currentUser) {
        toast.error('로그인이 필요합니다');
        router.push('/login');
        return;
      }

      if (!hasSharedPost || !postId) {
        return;
      }

      if (onBookmark) {
        onBookmark();
        return;
      }

      // Optimistic update
      setIsBookmarked(!isBookmarked);

      try {
        if (isBookmarked) {
          await unsavePostMutation.mutateAsync(postId);
        } else {
          await savePostMutation.mutateAsync(postId);
        }
      } catch (error) {
        // Rollback on error
        setIsBookmarked(isBookmarked);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-3 p-4 bg-white rounded-lg border border-slate-200',
          className
        )}
        {...props}
      >
        {/* 커뮤니티에 공유하기 버튼 (본인 세션이고 아직 공유하지 않은 경우만 표시) */}
        {isOwner && !hasSharedPost && (
          <Button
            variant="solid"
            size="sm"
            onClick={handleShareToCommunity}
            disabled={shareSessionMutation.isPending}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white w-full"
          >
            <Upload className="h-4 w-4" />
            {shareSessionMutation.isPending ? '공유 중...' : '커뮤니티에 공유하기'}
          </Button>
        )}

        {/* Engagement Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!hasSharedPost || likePostMutation.isPending || unlikePostMutation.isPending}
              className={cn(
                'gap-2 hover:bg-red-50',
                isLiked && 'text-red-600 hover:text-red-700',
                !hasSharedPost && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
              <span className="text-sm font-medium">{stats.likes}</span>
            </Button>

            {/* Bookmark Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={!hasSharedPost || savePostMutation.isPending || unsavePostMutation.isPending}
              className={cn(
                'gap-2 hover:bg-amber-50',
                isBookmarked && 'text-amber-600 hover:text-amber-700',
                !hasSharedPost && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Bookmark className={cn('h-5 w-5', isBookmarked && 'fill-current')} />
              <span className="text-sm font-medium">{stats.bookmarks}</span>
            </Button>

            {/* Comment Count */}
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasSharedPost}
              className={cn(
                'gap-2 hover:bg-slate-100 cursor-default',
                !hasSharedPost && 'opacity-50'
              )}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{stats.comments}</span>
            </Button>
          </div>

          {/* Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">공유</span>
          </Button>
        </div>
      </div>
    );
  }
);

EngagementBar.displayName = 'EngagementBar';

export { EngagementBar };
