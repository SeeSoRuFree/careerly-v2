'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AccountPageLayout } from '@/components/ui/account-page-layout';
import { AccountSidebarNav } from '@/components/ui/account-sidebar-nav';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Briefcase,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  UserPlus,
  UserMinus,
  Zap,
  Link as LinkIcon,
} from 'lucide-react';
import { useProfileByUserId } from '@/lib/api';

const sidebarItems = [
  {
    id: 'profile',
    label: '프로필',
    icon: <User className="w-4 h-4" />,
  },
  {
    id: 'career',
    label: '경력',
    icon: <Briefcase className="w-4 h-4" />,
  },
  {
    id: 'education',
    label: '학력',
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    id: 'posts',
    label: '게시글',
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    id: 'questions',
    label: 'Q&A',
    icon: <HelpCircle className="w-4 h-4" />,
  },
];

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-2 pt-2">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [isFollowing, setIsFollowing] = useState(false);

  // API 데이터 가져오기
  const userId = parseInt(params.userId, 10);
  const { data: profile, isLoading, error } = useProfileByUserId(userId);

  // URL 쿼리 파라미터로 탭 상태 관리
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && sidebarItems.some((item) => item.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (itemId: string) => {
    setActiveTab(itemId);
    router.push(`/profile/${params.userId}?tab=${itemId}`);
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // TODO: API 호출 추가
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '현재';
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AccountPageLayout
          sidebar={
            <AccountSidebarNav
              items={sidebarItems}
              activeItem={activeTab}
              onNavigate={handleTabChange}
            />
          }
        >
          <ProfileSkeleton />
        </AccountPageLayout>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">프로필을 찾을 수 없습니다.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              돌아가기
            </button>
          </CardContent>
        </Card>
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
    <div className="container mx-auto px-4 py-8">
      <AccountPageLayout
        sidebar={
          <AccountSidebarNav
            items={sidebarItems}
            activeItem={activeTab}
            onNavigate={handleTabChange}
          />
        }
      >
        <div className="space-y-6">
          {/* Profile Header with Follow Button */}
          <div className="flex items-start gap-6">
            {/* Avatar Section */}
            <Avatar className="h-24 w-24">
              {profile.image_url && <AvatarImage src={profile.image_url} alt={profile.name} />}
              <AvatarFallback className="text-xl font-semibold">{fallback}</AvatarFallback>
            </Avatar>

            {/* User Info Section */}
            <div className="flex-1 pt-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                  <p className="text-sm text-slate-600 mt-1">{profile.headline || '직무 미설정'}</p>
                  {profile.open_to_work_status === 'open' && (
                    <Badge tone="success" className="mt-2">
                      구직 중
                    </Badge>
                  )}
                </div>
                <Button
                  variant={isFollowing ? 'outline' : 'coral'}
                  onClick={handleFollowToggle}
                  className="gap-2"
                >
                  {isFollowing ? (
                    <UserMinus className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {isFollowing ? '팔로잉' : '팔로우'}
                </Button>
              </div>
            </div>
          </div>

          {activeTab === 'profile' && (
            <>
              {/* 자기소개 */}
              {(profile.description || profile.long_description) && (
                <Card>
                  <CardHeader>
                    <CardTitle>소개</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      {profile.long_description || profile.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* 스킬 */}
              {profile.skills && profile.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      스킬
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <Chip key={skill.id} variant="default">
                          {skill.name}
                        </Chip>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 사이트/링크 */}
              {profile.sites && profile.sites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-blue-500" />
                      링크
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              )}

              {/* 경력 요약 */}
              {profile.career_duration && (
                <Card>
                  <CardHeader>
                    <CardTitle>경력 요약</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <p className="text-3xl font-bold text-slate-900">
                          {profile.career_duration.career_year}년
                        </p>
                        <p className="text-sm text-slate-600 mt-1">총 경력</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <p className="text-3xl font-bold text-slate-900">
                          {profile.career_duration.total_career_duration_months}개월
                        </p>
                        <p className="text-sm text-slate-600 mt-1">상세 기간</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {activeTab === 'career' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-teal-500" />
                  경력
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.careers && profile.careers.length > 0 ? (
                  profile.careers.map((career) => (
                    <div key={career.id} className="space-y-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-slate-900">{career.title}</h3>
                          <p className="text-sm text-slate-600">{career.company}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            {formatDate(career.start_date)} -{' '}
                            {career.is_current ? '현재' : formatDate(career.end_date)}
                          </p>
                          {career.description && (
                            <p className="text-sm text-slate-600 mt-2">{career.description}</p>
                          )}
                        </div>
                        {career.is_current === 1 && <Badge tone="success">재직 중</Badge>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">등록된 경력이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'education' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  학력
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.educations && profile.educations.length > 0 ? (
                  profile.educations.map((edu) => (
                    <div key={edu.id} className="space-y-2 p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold text-lg text-slate-900">{edu.institute}</h3>
                      <p className="text-sm text-slate-600">{edu.major}</p>
                      <p className="text-sm text-slate-500">
                        {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                      </p>
                      {edu.description && (
                        <p className="text-sm text-slate-600 mt-2">{edu.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">등록된 학력이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-teal-500" />
                    게시글
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">작성한 게시글이 없습니다.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-purple-500" />
                    Q&A
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">작성한 질문이 없습니다.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </AccountPageLayout>
    </div>
  );
}
