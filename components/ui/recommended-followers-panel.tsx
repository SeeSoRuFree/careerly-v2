'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, Plus, Check } from 'lucide-react';

export interface RecommendedFollower {
  id: string;
  name: string;
  image_url?: string;
  headline?: string;
  isFollowing?: boolean;
  href?: string;
}

export interface RecommendedFollowersPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  followers: RecommendedFollower[];
  title?: string;
  maxItems?: number;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
}

export const RecommendedFollowersPanel = React.forwardRef<HTMLDivElement, RecommendedFollowersPanelProps>(
  (
    {
      followers,
      title = '추천 팔로워',
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

    return (
      <Card ref={ref} className={cn('p-4', className)} {...props}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4">
          관심사가 비슷한 사용자를 팔로우해보세요
        </p>

        {/* Followers List */}
        <div className="space-y-3">
          {displayedFollowers.map((follower, index) => {
            const isLast = index === displayedFollowers.length - 1;
            const isFollowing = followingState[follower.id] || false;

            return (
              <a
                key={follower.id}
                href={follower.href || '#'}
                className={cn(
                  'block pb-3 hover:bg-slate-50 -mx-4 px-4 rounded-lg transition-colors',
                  !isLast && 'border-b border-slate-200'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* User Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={follower.image_url} alt={follower.name} />
                      <AvatarFallback>{follower.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {follower.name}
                      </span>
                      {follower.headline && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-snug mt-0.5">
                          {follower.headline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Follow Button */}
                  <Button
                    size="sm"
                    variant={isFollowing ? 'outline' : 'solid'}
                    onClick={(e) => handleFollowClick(follower.id, e)}
                    className={cn(
                      'flex-shrink-0 h-8 px-3',
                      isFollowing
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        : 'bg-coral-500 hover:bg-coral-600 text-white'
                    )}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1" />
                        팔로잉
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        팔로우
                      </>
                    )}
                  </Button>
                </div>
              </a>
            );
          })}
        </div>

        {/* Footer - See More */}
        {followers.length > displayedFollowers.length && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <button className="w-full text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
              더 많은 추천 보기
            </button>
          </div>
        )}
      </Card>
    );
  }
);

RecommendedFollowersPanel.displayName = 'RecommendedFollowersPanel';
