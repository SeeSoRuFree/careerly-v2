'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';

export interface FollowUser {
  id: number;
  user: {
    id: number;
    profile_id: number | null;
    name: string;
    image_url: string | null;
    small_image_url: string | null;
    headline: string | null;
  };
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: FollowUser[];
  isLoading: boolean;
  onUserClick?: (userId: number) => void;
  onFollow?: (userId: number) => void;
  onUnfollow?: (userId: number) => void;
  currentUserId?: number;
  followingIds?: Set<number>;
  isFollowLoading?: boolean;
  // Infinite scroll props
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  totalCount?: number;
}

export function FollowersModal({
  isOpen,
  onClose,
  title,
  users,
  isLoading,
  onUserClick,
  onFollow,
  onUnfollow,
  currentUserId,
  followingIds = new Set(),
  isFollowLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  totalCount,
}: FollowersModalProps) {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Fetch next page when scroll reaches bottom
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFollowClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    if (followingIds.has(userId)) {
      onUnfollow?.(userId);
    } else {
      onFollow?.(userId);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed z-50 bg-white shadow-xl flex flex-col",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            // Mobile: fullscreen with safe area
            "inset-0 rounded-none",
            "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
            "pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            // Desktop: centered modal (no safe area needed)
            "sm:inset-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]",
            "sm:w-full sm:max-w-md sm:max-h-[80vh] sm:rounded-lg",
            "sm:p-0", // Reset safe area padding on desktop
            "sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%]",
            "sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
            <Dialog.Title className="text-lg font-semibold text-slate-900">
              {title}
              {totalCount !== undefined && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  {totalCount}
                </span>
              )}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">
                  {title.includes('팔로워') ? '아직 팔로워가 없습니다.' : '아직 팔로잉하는 사람이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((item) => {
                  const user = item.user;
                  if (!user) return null;

                  const isFollowing = followingIds.has(user.id);
                  const isMe = currentUserId === user.id;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg transition-colors',
                        onUserClick && 'hover:bg-slate-50 cursor-pointer active:bg-slate-100'
                      )}
                      onClick={() => onUserClick?.(user.profile_id ?? user.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage
                            src={user.small_image_url || user.image_url || undefined}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {user.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-slate-900 truncate">
                            {user.name}
                          </p>
                          {user.headline && (
                            <p className="text-xs text-slate-500 truncate">
                              {user.headline}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Follow button (not for self) */}
                      {!isMe && onFollow && onUnfollow && (
                        <Button
                          variant={isFollowing ? 'outline' : 'coral'}
                          size="sm"
                          className="shrink-0 ml-2"
                          onClick={(e) => handleFollowClick(e, user.id)}
                          disabled={isFollowLoading}
                        >
                          {isFollowLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isFollowing ? (
                            <>
                              <UserMinus className="h-3.5 w-3.5 mr-1" />
                              팔로잉
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3.5 w-3.5 mr-1" />
                              팔로우
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}

                {/* Infinite scroll trigger */}
                {hasNextPage && (
                  <div ref={loadMoreRef} className="flex justify-center py-4">
                    {isFetchingNextPage && (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
