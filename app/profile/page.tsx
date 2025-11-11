'use client';

import { useState } from 'react';
import { AccountPageLayout } from '@/components/ui/account-page-layout';
import { AccountSidebarNav } from '@/components/ui/account-sidebar-nav';
import { AccountProfileHeader } from '@/components/ui/account-profile-header';
import { AccountFieldRow } from '@/components/ui/account-field-row';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { User, Briefcase, GraduationCap, Users, Settings } from 'lucide-react';

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
    id: 'network',
    label: '네트워크',
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: 'settings',
    label: '설정',
    icon: <Settings className="w-4 h-4" />,
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

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
            onNavigate={(itemId) => setActiveTab(itemId)}
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

          {activeTab === 'network' && (
            <Card>
              <CardHeader>
                <CardTitle>네트워크</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AccountFieldRow
                    label="구독자"
                    value={`${mockProfileData.subscriber_count}명`}
                    description="나를 구독하는 사용자"
                  />
                  <AccountFieldRow
                    label="구독 중"
                    value={`${mockProfileData.subscribing_count}명`}
                    description="내가 구독하는 사용자"
                  />
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
