'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityFeedCard } from '@/components/ui/community-feed-card';
import { QnaCard } from '@/components/ui/qna-card';
import {
  Briefcase,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  UserPlus,
  UserMinus,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import {
  useProfileByUserId,
  usePosts,
  useQuestions,
  useFollowStatus,
  useFollowUser,
  useUnfollowUser,
  useCurrentUser,
} from '@/lib/api';

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-2 pt-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();

  // API 데이터 가져오기
  const userId = parseInt(params.userId, 10);
  const { data: profile, isLoading, error } = useProfileByUserId(userId);
  const { data: currentUser } = useCurrentUser();

  // 해당 사용자의 게시글/질문 가져오기
  const { data: postsData, isLoading: isLoadingPosts } = usePosts({ user_id: userId });
  const { data: questionsData, isLoading: isLoadingQuestions } = useQuestions({ user_id: userId });

  // 팔로우 상태 조회 (로그인한 경우에만, 자기 자신이 아닐 때만)
  const isOwnProfile = currentUser?.id === userId;
  const { data: followStatus, isLoading: isLoadingFollowStatus } = useFollowStatus(
    isOwnProfile ? undefined : userId
  );

  // 팔로우/언팔로우 mutations
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const isFollowing = followStatus?.is_following ?? false;
  const isFollowedBy = followStatus?.is_followed_by ?? false;
  const isFollowLoading = followMutation.isPending || unfollowMutation.isPending;

  const handleFollowToggle = () => {
    if (isFollowLoading) return;

    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '현재';
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">프로필을 찾을 수 없습니다.</p>
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // Generate fallback initials from display name
  const fallback = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
            <Avatar className="h-24 w-24">
              {profile.image_url && <AvatarImage src={profile.image_url} alt={profile.name} />}
              <AvatarFallback className="text-xl font-semibold">{fallback}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                  <p className="text-base text-slate-600 mt-2">{profile.headline || '직무 미설정'}</p>

                  {/* 팔로워수, 게시글수 */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-900">0</span> 팔로워
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">0</span> 게시글
                    </div>
                  </div>

                  {profile.open_to_work_status === 'open' && (
                    <Badge tone="success" className="mt-3">
                      구직 중
                    </Badge>
                  )}
                </div>
                {!isOwnProfile && (
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      variant={isFollowing ? 'outline' : 'coral'}
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading || isLoadingFollowStatus}
                      className="gap-2"
                    >
                      {isFollowLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isFollowing ? (
                        <UserMinus className="h-4 w-4" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      {isFollowing ? '팔로잉' : '팔로우'}
                    </Button>
                    {isFollowedBy && !isFollowing && (
                      <span className="text-xs text-slate-500">나를 팔로우 중</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 소개 */}
          {(profile.description || profile.long_description) && (
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">소개</h2>
              <p className="text-slate-700 leading-relaxed">
                {profile.long_description || profile.description}
              </p>
            </div>
          )}

          {/* 스킬 */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">
                스킬
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Chip key={skill.id} variant="default">
                    {skill.name}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* 사이트/링크 */}
          {profile.sites && profile.sites.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">
                링크
              </h2>
              <div className="space-y-3">
                {profile.sites.map((site) => (
                  <a
                    key={site.id}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">{site.name}</p>
                      <p className="text-sm text-slate-500">{site.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 경력 요약 */}
          {profile.career_duration && (
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">경력 요약</h2>
              <p className="text-sm text-slate-600">
                총 경력 <span className="font-semibold text-slate-900">{profile.career_duration.career_year}년</span> ({profile.career_duration.total_career_duration_months}개월)
              </p>
            </div>
          )}

          {/* 경력 */}
          {profile.careers && profile.careers.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-600" />
                경력
              </h2>
              <div className="space-y-3">
                {profile.careers.map((career) => (
                  <div key={career.id} className="space-y-2 p-3 bg-slate-50/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base text-slate-900">{career.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{career.company}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {formatDate(career.start_date)} -{' '}
                          {career.is_current ? '현재' : formatDate(career.end_date)}
                        </p>
                        {career.description && (
                          <p className="text-sm text-slate-600 mt-3">{career.description}</p>
                        )}
                      </div>
                      {career.is_current === 1 && <Badge tone="success">재직 중</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 학력 */}
          {profile.educations && profile.educations.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-600" />
                학력
              </h2>
              <div className="space-y-3">
                {profile.educations.map((edu) => (
                  <div key={edu.id} className="space-y-2 p-3 bg-slate-50/50 rounded-lg">
                    <h3 className="font-semibold text-base text-slate-900">{edu.institute}</h3>
                    <p className="text-sm text-slate-600">{edu.major}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                    </p>
                    {edu.description && (
                      <p className="text-sm text-slate-600 mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 게시글 */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-600" />
              게시글
              {postsData?.count !== undefined && postsData.count > 0 && (
                <Badge tone="default" className="ml-1">{postsData.count}</Badge>
              )}
            </h2>
            {isLoadingPosts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : !postsData?.results || postsData.results.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">작성한 게시글이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {postsData.results.map((post) => {
                  const userProfile = {
                    id: profile?.user_id || userId,
                    name: profile?.name || post.author?.name || '',
                    image_url: profile?.image_url || post.author?.image_url || '',
                    headline: profile?.headline || post.author?.headline || '',
                  };
                  return (
                    <CommunityFeedCard
                      key={post.id}
                      userProfile={userProfile}
                      content={post.description}
                      createdAt={post.createdat}
                      stats={{
                        likeCount: post.like_count || 0,
                        replyCount: post.comment_count || 0,
                        viewCount: post.view_count || 0,
                      }}
                      onClick={() => router.push(`/community?post=${post.id}`)}
                      liked={post.is_liked}
                      bookmarked={post.is_saved}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Q&A */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-slate-600" />
              Q&A
              {questionsData?.count !== undefined && questionsData.count > 0 && (
                <Badge tone="default" className="ml-1">{questionsData.count}</Badge>
              )}
            </h2>
            {isLoadingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : !questionsData?.results || questionsData.results.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">작성한 질문이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questionsData.results.map((question) => (
                  <QnaCard
                    key={question.id}
                    qnaId={question.id}
                    title={question.title}
                    description=""
                    createdAt={question.createdat}
                    answerCount={question.answer_count || 0}
                    likeCount={question.like_count || 0}
                    viewCount={0}
                    status={question.status}
                    liked={question.is_liked}
                    onClick={() => router.push(`/community?qna=${question.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
