'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserPlus, Heart, MessageCircle, Users, Briefcase } from 'lucide-react';
import Link from 'next/link';

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

export interface RecommendedFollower {
  id: string;           // User ID
  profileId?: number;   // Profile ID
  name: string;
  image_url?: string;
  headline?: string;
  isFollowing?: boolean;
  follower_count?: number;
}

export interface RecommendedFollowersFeedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  follower: RecommendedFollower;
  profile?: ProfileInfo | null;
  recentPosts?: RecentPost[];
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onPostClick?: (postId: number) => void;
}

// 숫자 포맷팅 (1000 -> 1K)
function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// HTML 태그 제거
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// 더미 데이터 (프로필/글 데이터가 없을 때 사용)
const DUMMY_PROFILE: ProfileInfo = {
  description: '개발자로서 성장하는 과정을 기록하고, 커뮤니티와 인사이트를 나누고 있습니다. 함께 성장해요!',
  careers: [
    { company: '테크 회사', title: '시니어 개발자', is_current: 1 }
  ]
};

const DUMMY_POSTS: RecentPost[] = [
  {
    id: 0,
    title: '',
    content: '최근에 새로운 기술 스택을 도입하면서 느낀 점들을 정리해봤습니다. 생산성이 확실히 올라가더라고요.',
    like_count: 42,
    comment_count: 8,
    created_at: new Date().toISOString()
  }
];

export const RecommendedFollowersFeedCard = React.forwardRef<HTMLDivElement, RecommendedFollowersFeedCardProps>(
  (
    {
      follower,
      profile,
      recentPosts = [],
      onFollow,
      onUnfollow,
      onPostClick,
      className,
      ...props
    },
    ref
  ) => {
    const [isFollowing, setIsFollowing] = React.useState(follower.isFollowing || false);

    // 팔로잉 상태가 props에서 변경되면 업데이트
    React.useEffect(() => {
      setIsFollowing(follower.isFollowing || false);
    }, [follower.isFollowing]);

    const handleFollowClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isFollowing) {
        onUnfollow?.(follower.id);
      } else {
        onFollow?.(follower.id);
      }
      setIsFollowing(!isFollowing);
    };

    const profileUrl = follower.profileId ? `/profile/${follower.profileId}` : '#';

    // 실제 데이터가 없으면 더미 데이터 사용
    const displayProfile = profile || DUMMY_PROFILE;
    const displayPosts = recentPosts.length > 0 ? recentPosts : DUMMY_POSTS;
    const currentCareer = displayProfile?.careers?.find(c => c.is_current === 1) || displayProfile?.careers?.[0];

    return (
      <Card ref={ref} className={cn('p-5', className)} {...props}>
        {/* Header - 태그 스타일 */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            <UserPlus className="h-3 w-3" />
            Who to follow
          </span>
        </div>

        {/* 프로필 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <Link
            href={profileUrl}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
          >
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={follower.image_url} alt={follower.name} />
              <AvatarFallback className="bg-slate-100 text-slate-600 text-base">
                {follower.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-semibold text-slate-900 truncate">{follower.name}</span>
              {follower.headline && (
                <span className="text-sm text-slate-500 truncate">{follower.headline}</span>
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
        <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
          {currentCareer && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {currentCareer.company}
            </span>
          )}
          {follower.follower_count !== undefined && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              팔로워 {formatNumber(follower.follower_count)}
            </span>
          )}
        </div>

        {/* 자기소개 */}
        {displayProfile?.description && (
          <div className="mb-4">
            <p className="text-[15px] sm:text-base text-slate-700 line-clamp-2 leading-relaxed">
              {stripHtml(displayProfile.description)}
            </p>
          </div>
        )}

        {/* 최근 작성한 글 (최대 1개) */}
        {displayPosts.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-500 mb-2 font-medium">최근 작성한 글</p>
            <div
              onClick={() => displayPosts[0].id > 0 && onPostClick?.(displayPosts[0].id)}
              className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <p className="text-[15px] sm:text-base text-slate-800 line-clamp-2 leading-snug mb-2">
                {stripHtml(displayPosts[0].content)}
              </p>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {displayPosts[0].like_count}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {displayPosts[0].comment_count}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  }
);

RecommendedFollowersFeedCard.displayName = 'RecommendedFollowersFeedCard';
