'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AccountPageLayout } from '@/components/ui/account-page-layout';
import { AccountSidebarNav } from '@/components/ui/account-sidebar-nav';
import { AccountProfileHeader } from '@/components/ui/account-profile-header';
import { AccountFieldRow } from '@/components/ui/account-field-row';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { User, Briefcase, GraduationCap, Heart, Bookmark, Settings, Clock, Search, MessageSquare, FileText } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

// Mock 데이터
const mockProfileData = {
  id: 723244,
  name: '임진규',
  user_id: 725616,
  image_url:
    'https://publy.imgix.net/user-uploaded/725616/2024.09/5a6f90a6-f0c2-4293-b281-26e6b25df8c4.jpeg?w=400&h=400&auto=format',
  title: '독학 비전공',
  subscriber_count: 0,
  subscribing_count: 5,
  short_description: null,
  description: null,
  careers: [
    {
      id: 249557,
      company: '고알레',
      title: '프론트엔드 개발자',
      startDate: '2020-03-01 00:00:00',
      endDate: null,
      isCurrent: 1,
      careerSkills: [
        { name: 'Next.js', category: 'tech', secondCategory: 'frontend' },
        { name: 'React', category: 'tech', secondCategory: 'frontend' },
        { name: 'Github', category: 'tech', secondCategory: 'devops' },
        { name: 'typescript', category: 'tech', secondCategory: 'prog_lang' },
        { name: 'git', category: 'tech', secondCategory: 'backend' },
        { name: 'javascript', category: 'tech', secondCategory: 'prog_lang' },
        { name: '프로젝트 매니징', category: 'common', secondCategory: '956' },
      ],
    },
  ],
  educations: [
    {
      id: 257931,
      institute: '독학',
      major: '비전공',
      startDate: '2018-03-01 00:00:00',
      endDate: '2020-03-01 00:00:00',
    },
  ],
};

// Mock 활동 데이터
const mockActivityData = {
  posts: [
    { id: 1, title: 'Next.js 14 App Router 마이그레이션 경험', type: 'post', date: '2025-11-10', likes: 24, comments: 8 },
    { id: 2, title: 'TypeScript 5.0 새로운 기능 정리', type: 'post', date: '2025-11-08', likes: 42, comments: 12 },
  ],
  qna: [
    { id: 1, title: 'React Query vs SWR 어떤 것을 선택해야 할까요?', type: 'question', date: '2025-11-09', answers: 5, views: 156 },
    { id: 2, title: 'Next.js 서버 컴포넌트에서 인증 처리', type: 'question', date: '2025-11-07', answers: 3, views: 89 },
  ],
  comments: [
    { id: 1, content: 'Zustand도 좋은 선택지입니다. 프로젝트 규모에 따라...', postTitle: 'Redux vs Recoil', date: '2025-11-10' },
    { id: 2, content: 'Next.js 14에서는 Server Actions를 적극 활용하면...', postTitle: 'API Routes 최적화', date: '2025-11-09' },
  ],
};

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
    id: 'activity',
    label: '활동',
    icon: <Heart className="w-4 h-4" />,
  },
  {
    id: 'bookmarks',
    label: '북마크',
    icon: <Bookmark className="w-4 h-4" />,
  },
  {
    id: 'settings',
    label: '설정',
    icon: <Settings className="w-4 h-4" />,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { recentQueries, clearRecentQueries } = useStore();
  const [activeTab, setActiveTab] = useState('profile');

  // URL 쿼리 파라미터로 탭 상태 관리
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && sidebarItems.some(item => item.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (itemId: string) => {
    setActiveTab(itemId);
    router.push(`/profile?tab=${itemId}`);
  };

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '현재';
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

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
          {/* Profile Header */}
          <AccountProfileHeader
            avatarUrl={mockProfileData.image_url}
            displayName={mockProfileData.name}
            username={`@user${mockProfileData.user_id}`}
            onChangeAvatar={() => console.log('Change avatar')}
          />

          {activeTab === 'profile' && (
            <>
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  <AccountFieldRow
                    label="이름"
                    value={mockProfileData.name}
                    actionLabel="변경"
                    onAction={() => console.log('Change name')}
                  />
                  <AccountFieldRow
                    label="사용자 ID"
                    value={`${mockProfileData.user_id}`}
                    description="고유 사용자 식별자"
                  />
                  <AccountFieldRow
                    label="직무"
                    value={mockProfileData.title}
                    actionLabel="수정"
                    onAction={() => console.log('Edit title')}
                  />
                </CardContent>
              </Card>

              {/* 관심 분야 */}
              <Card>
                <CardHeader>
                  <CardTitle>관심 분야</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      관심 있는 기술 스택이나 분야를 선택하세요. 맞춤형 콘텐츠를 추천받을 수 있습니다.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'React', 'Next.js', 'TypeScript', 'Node.js', 'GraphQL',
                        'AWS', 'Docker', 'Kubernetes', 'Python', 'AI/ML',
                        'DevOps', 'Mobile', 'Backend', 'Frontend', 'Fullstack'
                      ].map((interest) => (
                        <Chip
                          key={interest}
                          variant="default"
                          className="cursor-pointer hover:bg-teal-100 hover:border-teal-300 transition-colors"
                          onClick={() => console.log('Toggle interest:', interest)}
                        >
                          {interest}
                        </Chip>
                      ))}
                    </div>
                    <button className="px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      + 관심 분야 추가
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* 자기소개 */}
              <Card>
                <CardHeader>
                  <CardTitle>자기소개</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <textarea
                      className="w-full min-h-[120px] p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="자신을 소개하는 글을 작성해보세요..."
                      defaultValue={mockProfileData.description || ''}
                    />
                    <div className="flex justify-end">
                      <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                        저장
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Network Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>네트워크</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-3xl font-bold text-slate-900">
                        {mockProfileData.subscriber_count}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">구독자</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-3xl font-bold text-slate-900">
                        {mockProfileData.subscribing_count}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">구독 중</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'career' && (
            <Card>
              <CardHeader>
                <CardTitle>경력</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockProfileData.careers.map((career) => (
                  <div key={career.id} className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900">
                          {career.title}
                        </h3>
                        <p className="text-sm text-slate-600">{career.company}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {formatDate(career.startDate)} -{' '}
                          {career.isCurrent ? '현재' : formatDate(career.endDate)}
                        </p>
                      </div>
                      {career.isCurrent && (
                        <Badge tone="success">재직 중</Badge>
                      )}
                    </div>

                    {career.careerSkills && career.careerSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          기술 스택
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {career.careerSkills.map((skill, idx) => (
                            <Chip key={idx} variant="default">
                              {skill.name}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'education' && (
            <Card>
              <CardHeader>
                <CardTitle>학력</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockProfileData.educations.map((edu) => (
                  <div key={edu.id} className="space-y-2">
                    <h3 className="font-semibold text-lg text-slate-900">
                      {edu.institute}
                    </h3>
                    <p className="text-sm text-slate-600">{edu.major}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'activity' && (
            <>
              {/* 검색 히스토리 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-500" />
                      <CardTitle>검색 히스토리</CardTitle>
                    </div>
                    {recentQueries.length > 0 && (
                      <button
                        onClick={clearRecentQueries}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        전체 삭제
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {recentQueries.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">검색 기록이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentQueries.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSearch(item.query)}
                          className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-teal-50 hover:border-teal-200 border border-transparent transition-all text-left group"
                        >
                          <Search className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 text-sm font-medium truncate">
                              {item.query}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {dayjs(item.timestamp).fromNow()}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 작성한 게시글 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-500" />
                    <CardTitle>작성한 게시글</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockActivityData.posts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <h4 className="font-medium text-slate-900 mb-2">{post.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{post.date}</span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" /> {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> {post.comments}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Q&A */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-500" />
                    <CardTitle>Q&A</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockActivityData.qna.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <h4 className="font-medium text-slate-900 mb-2">{item.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{item.date}</span>
                          <span>답변 {item.answers}</span>
                          <span>조회 {item.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 댓글 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-500" />
                    <CardTitle>작성한 댓글</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockActivityData.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <p className="text-sm text-slate-600 mb-2">
                          {comment.postTitle}에 댓글
                        </p>
                        <p className="text-slate-900 mb-2">{comment.content}</p>
                        <p className="text-xs text-slate-500">{comment.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'bookmarks' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-teal-500" />
                  <CardTitle>북마크</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">저장된 북마크가 없습니다.</p>
                  <p className="text-sm text-slate-400 mt-2">
                    검색 결과를 북마크하여 나중에 다시 확인하세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>설정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  <AccountFieldRow
                    label="프로필 공개"
                    value="공개"
                    description="다른 사용자가 내 프로필을 볼 수 있습니다"
                    actionLabel="변경"
                    onAction={() => console.log('Change visibility')}
                  />
                  <AccountFieldRow
                    label="알림"
                    value="켜짐"
                    description="새로운 활동에 대한 알림을 받습니다"
                    actionLabel="변경"
                    onAction={() => console.log('Change notifications')}
                  />
                  <AccountFieldRow
                    label="언어"
                    value="한국어"
                    description="인터페이스 언어"
                    actionLabel="변경"
                    onAction={() => console.log('Change language')}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AccountPageLayout>
    </div>
  );
}
