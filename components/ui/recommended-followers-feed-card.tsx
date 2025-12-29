'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserPlus, Plus, Check } from 'lucide-react';
import Link from 'next/link';

export interface RecommendedFollower {
  id: string;
  profileId?: number;
  name: string;
  image_url?: string;
  headline?: string;
  isFollowing?: boolean;
}

export interface RecommendedFollowersFeedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  followers: RecommendedFollower[];
  maxItems?: number;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
}

export const RecommendedFollowersFeedCard = React.forwardRef<HTMLDivElement, RecommendedFollowersFeedCardProps>(
  (
    {
      followers,
      maxItems = 5,
      onFollow,
      onUnfollow,
      className,
      ...props
    },
    ref
  ) => {
    const [followingState, setFollowingState] = React.useState<Record<string, boolean>>({});
    const displayedFollowers = followers.slice(0, maxItems);

    // Initialize following state from props
    React.useEffect(() => {
      const initialState: Record<string, boolean> = {};
      followers.forEach(follower => {
        initialState[follower.id] = follower.isFollowing || false;
      });
      setFollowingState(initialState);
    }, [followers]);

    const handleFollowClick = (userId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const isCurrentlyFollowing = followingState[userId];

      if (isCurrentlyFollowing) {
        onUnfollow?.(userId);
      } else {
        onFollow?.(userId);
      }

      setFollowingState(prev => ({
        ...prev,
        [userId]: !isCurrentlyFollowing,
      }));
    };

    if (displayedFollowers.length === 0) {
      return null;
    }

    return (
      <Card ref={ref} className={cn('p-6 cursor-default', className)} {...props}>
        {/* Header - 심플하게 */}
        <div className="flex items-center gap-2 mb-5">
          <UserPlus className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Who to follow
          </span>
        </div>

        {/* Followers List */}
        <div className="space-y-4">
          {displayedFollowers.map((follower) => {
            const isFollowing = followingState[follower.id] || false;
            const profileUrl = follower.profileId
              ? `/profile/${follower.profileId}`
              : '#';

            return (
              <div
                key={follower.id}
                className="flex items-center gap-3"
              >
                {/* Avatar */}
                <Link href={profileUrl} className="shrink-0">
                  <Avatar className="h-10 w-10 hover:opacity-80 transition-opacity">
                    <AvatarImage src={follower.image_url} alt={follower.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
                      {follower.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                {/* User Info */}
                <Link
                  href={profileUrl}
                  className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {follower.name}
                  </p>
                  {follower.headline && (
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {follower.headline}
                    </p>
                  )}
                </Link>

                {/* Follow Button - 더 심플하게 */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleFollowClick(follower.id, e)}
                  className={cn(
                    'shrink-0 h-8 px-3 text-xs font-medium rounded-full',
                    isFollowing
                      ? 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
                  )}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }
);

RecommendedFollowersFeedCard.displayName = 'RecommendedFollowersFeedCard';
