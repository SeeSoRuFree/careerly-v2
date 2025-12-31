'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import { Heart, MessageCircle, ChevronLeft, ChevronRight, Users, Briefcase } from 'lucide-react';

// 추천 사용자 기본 정보
export interface RecommendedUser {
  id: number;        // Profile ID
  user_id: number;   // User ID
  name: string;
  image_url: string | null;
  headline: string | null;
  is_following: boolean;
  follower_count?: number;
}

// 경력 정보
export interface CareerInfo {
  company: string;
  title: string;
  is_current: number;
}

// 프로필 상세 정보
export interface ProfileInfo {
  description: string | null;
  careers: CareerInfo[];
}

// 최근 포스트
export interface RecentPost {
  id: number;
  title: string;
  content: string;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface RecommendedUserCardProps extends React.HTMLAttributes<HTMLDivElement> {
  user: RecommendedUser;
  profile?: ProfileInfo | null;
  recentPosts: RecentPost[];
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  onPostClick?: (postId: number) => void;
  onProfileClick?: () => void;
}

// 숫자 포맷팅 (1000 -> 1K)
function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export const RecommendedUserCard = React.forwardRef<HTMLDivElement, RecommendedUserCardProps>(
  (
    {
      user,
      profile,
      recentPosts,
      onFollow,
      onUnfollow,
      onPostClick,
      onProfileClick,
      className,
      ...props
    },
    ref
  ) => {
    const [isFollowing, setIsFollowing] = React.useState(user.is_following);

    const handleFollowClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFollowing) {
        onUnfollow(user.user_id.toString());
        setIsFollowing(false);
      } else {
        onFollow(user.user_id.toString());
        setIsFollowing(true);
      }
    };

    // HTML 태그 제거
    const stripHtml = (html: string) => {
      return html.replace(/<[^>]*>/g, '').trim();
    };

    // 현재 경력 가져오기
    const currentCareer = profile?.careers?.find(c => c.is_current === 1) || profile?.careers?.[0];

    return (
      <Card
        ref={ref}
        className={cn('p-5 transition-all duration-200', className)}
        {...props}
      >
        {/* 프로필 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <Link
            href={`/profile/${user.id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline flex-1 min-w-0"
            onClick={(e) => {
              e.stopPropagation();
              onProfileClick?.();
            }}
          >
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={user.image_url || ''} alt={user.name} />
              <AvatarFallback className="text-base">{user.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 truncate">{user.name}</span>
              {user.headline && (
                <span className="text-xs text-slate-500 truncate">{user.headline}</span>
              )}
            </div>
          </Link>

          <Button
            variant={isFollowing ? 'outline' : 'coral'}
            size="sm"
            onClick={handleFollowClick}
            className="shrink-0 text-xs px-3"
          >
            {isFollowing ? '팔로잉' : '+ 팔로우'}
          </Button>
        </div>

        {/* 경력 & 팔로워 정보 */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          {currentCareer && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {currentCareer.company}
            </span>
          )}
          {user.follower_count !== undefined && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              팔로워 {formatNumber(user.follower_count)}
            </span>
          )}
        </div>

        {/* 자기소개 */}
        {profile?.description && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-1.5 font-medium">자기소개</p>
            <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
              {stripHtml(profile.description)}
            </p>
          </div>
        )}

        {/* 최근 작성한 글 (최대 2개) */}
        {recentPosts.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500 mb-2 font-medium">최근 작성한 글</p>
            <div className="space-y-2">
              {recentPosts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  onClick={() => onPostClick?.(post.id)}
                  className="p-2.5 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <p className="text-sm text-slate-800 line-clamp-2 leading-snug mb-1.5">
                    {stripHtml(post.content)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.comment_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentPosts.length === 0 && (
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-400 text-center">
              아직 작성한 글이 없어요
            </p>
          </div>
        )}
      </Card>
    );
  }
);

RecommendedUserCard.displayName = 'RecommendedUserCard';

// 2명씩 페이지네이션 컨테이너
export interface RecommendedUserPairContainerProps {
  users: RecommendedUser[];
  profiles: Record<number, ProfileInfo | null>;
  userPosts: Record<number, RecentPost[]>;
  currentPairIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  onPostClick?: (postId: number) => void;
}

export function RecommendedUserPairContainer({
  users,
  profiles,
  userPosts,
  currentPairIndex,
  onPrev,
  onNext,
  onFollow,
  onUnfollow,
  onPostClick,
}: RecommendedUserPairContainerProps) {
  // 현재 페이지의 2명
  const currentPair = users.slice(currentPairIndex, currentPairIndex + 2);
  const totalUsers = users.length;

  if (currentPair.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* 2열 그리드 (모바일 1열, PC 2열) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentPair.map((user) => (
          <RecommendedUserCard
            key={user.id}
            user={user}
            profile={profiles[user.user_id]}
            recentPosts={userPosts[user.user_id] || []}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onPostClick={onPostClick}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalUsers > 2 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={onPrev}
            disabled={currentPairIndex === 0}
            className={cn(
              'p-2 rounded-full transition-colors',
              currentPairIndex === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            )}
            aria-label="이전"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-slate-500">
            {currentPairIndex + 1}-{Math.min(currentPairIndex + 2, totalUsers)} / {totalUsers}
          </span>
          <button
            onClick={onNext}
            disabled={currentPairIndex + 2 >= totalUsers}
            className={cn(
              'p-2 rounded-full transition-colors',
              currentPairIndex + 2 >= totalUsers
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            )}
            aria-label="다음"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

// 기존 컨테이너 (하위 호환)
export interface RecommendedUserCardsContainerProps {
  users: RecommendedUser[];
  userPosts: Record<number, RecentPost | null>;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  onPostClick?: (postId: number) => void;
}

export function RecommendedUserCardsContainer({
  users,
  userPosts,
  currentIndex,
  onPrev,
  onNext,
  onFollow,
  onUnfollow,
  onPostClick,
}: RecommendedUserCardsContainerProps) {
  const currentUser = users[currentIndex];
  const recentPost = currentUser ? userPosts[currentUser.user_id] : null;

  if (!currentUser) return null;

  return (
    <div className="space-y-4">
      <RecommendedUserCard
        user={currentUser}
        recentPosts={recentPost ? [recentPost] : []}
        onFollow={onFollow}
        onUnfollow={onUnfollow}
        onPostClick={onPostClick}
      />

      {/* 페이지네이션 */}
      {users.length > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className={cn(
              'p-2 rounded-full transition-colors',
              currentIndex === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            )}
            aria-label="이전"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-slate-500">
            {currentIndex + 1} / {users.length}
          </span>
          <button
            onClick={onNext}
            disabled={currentIndex >= users.length - 1}
            className={cn(
              'p-2 rounded-full transition-colors',
              currentIndex >= users.length - 1
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            )}
            aria-label="다음"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
