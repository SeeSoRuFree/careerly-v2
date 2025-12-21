'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { UserPlus, UserCheck } from 'lucide-react';
import { useFollowUser, useUnfollowUser, useFollowStatus, useCurrentUser } from '@/lib/api';

export interface AuthorInfo {
  name: string;
  jobTitle?: string;
  avatarUrl?: string;
  userId?: string;
}

export interface AuthorProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  author: AuthorInfo;
  createdAt: string;
}

const AuthorProfileCard = React.forwardRef<HTMLDivElement, AuthorProfileCardProps>(
  ({ author, createdAt, className, ...props }, ref) => {
    const initials = author.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // 현재 로그인한 사용자 정보
    const { data: currentUser } = useCurrentUser();

    // 팔로우 상태 조회
    const authorUserId = author.userId ? parseInt(author.userId, 10) : undefined;
    const { data: followStatus } = useFollowStatus(authorUserId, {
      enabled: !!authorUserId && !!currentUser && currentUser.id !== authorUserId,
    });

    // 팔로우/언팔로우 mutation
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();

    // 본인 여부 확인
    const isOwnProfile = currentUser && authorUserId && currentUser.id === authorUserId;

    // 팔로우 토글 핸들러
    const handleFollowToggle = async () => {
      if (!authorUserId || !currentUser) return;

      if (followStatus?.is_following) {
        unfollowMutation.mutate(authorUserId);
      } else {
        followMutation.mutate(authorUserId);
      }
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between gap-4', className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-slate-900">{author.name}</h3>
            {author.jobTitle && (
              <p className="text-sm text-slate-600">{author.jobTitle}</p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">
              {formatRelativeTime(createdAt)}
            </p>
          </div>
        </div>
        {!isOwnProfile && authorUserId && currentUser && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFollowToggle}
            disabled={followMutation.isPending || unfollowMutation.isPending}
            className={cn(
              'flex-shrink-0 gap-1.5',
              followStatus?.is_following
                ? 'bg-teal-50 border-teal-300 text-teal-700 hover:bg-teal-100'
                : 'hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700'
            )}
          >
            {followStatus?.is_following ? (
              <>
                <UserCheck className="h-4 w-4" />
                팔로잉
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                팔로우
              </>
            )}
          </Button>
        )}
      </div>
    );
  }
);

AuthorProfileCard.displayName = 'AuthorProfileCard';

export { AuthorProfileCard };
