'use client';

import * as React from 'react';
import { TabNav } from '@/components/design-guide/TabNav';
import { ComponentTabNav } from '@/components/design-guide/ComponentTabNav';
import { ComponentShowcase } from '@/components/design-guide/ComponentShowcase';
import { QuickNav } from '@/components/design-guide/QuickNav';
import { CommunityFeedCard } from '@/components/ui/community-feed-card';
import { QnaCard } from '@/components/ui/qna-card';
import { PromotionCard } from '@/components/ui/promotion-card';
import { CategoryTabs } from '@/components/ui/category-tabs';

export default function CommunityComponentsPage() {
  const [feedLiked, setFeedLiked] = React.useState(false);
  const [feedBookmarked, setFeedBookmarked] = React.useState(false);
  const [qnaLiked, setQnaLiked] = React.useState(false);
  const [qnaDisliked, setQnaDisliked] = React.useState(false);
  const [communityTab, setCommunityTab] = React.useState('feed');

  const navItems = [
    { id: 'community-feed-card', label: 'CommunityFeedCard' },
    { id: 'qna-card', label: 'QnaCard' },
    { id: 'promotion-card', label: 'PromotionCard' },
  ];

  // Sample data based on the provided feed data
  const sampleUserProfile = {
    id: 38284,
    name: '골빈해커',
    image_url: 'https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg',
    headline: 'Chief Maker',
    title: 'Chief Maker',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <TabNav />

        <div className="mt-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Community Components</h1>
          <p className="text-slate-600 mt-2">
            커뮤니티 피드, QnA, 홍보 페이지에 사용되는 컴포넌트입니다. 각 컴포넌트 제목을 클릭하면 이름이 복사됩니다.
          </p>
        </div>

        <ComponentTabNav />

        <div className="mt-6 mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Community</h2>
          <p className="text-slate-600 mt-1">
            커뮤니티 기능을 위한 컴포넌트 - 피드 카드, QnA 카드, 홍보 카드 등
          </p>
        </div>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* CommunityFeedCard */}
            <ComponentShowcase
              title="CommunityFeedCard"
              description="커뮤니티 피드 카드 컴포넌트"
              usageContext="Community/feed 페이지, 사용자 게시물 표시"
            >
              <div className="space-y-6 max-w-2xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">텍스트 전용 피드</p>
                  <CommunityFeedCard
                    userProfile={sampleUserProfile}
                    content="냉장 기술로 돈을 가장 크게 버는 회사는, 냉장 기술을 보유한 회사도 아니고 냉장고 회사도 아니고 코카콜라라고한다. 같은 것으로, 금으로 가장 돈을 많이 버는 회사는 금광 회사도 아니고 청바지 회사도 아니고 Nvidia나 애플같은데라는 사실."
                    createdAt="2025-09-12 04:48:02"
                    stats={{
                      likeCount: 2,
                      replyCount: 21,
                      viewCount: 1628,
                    }}
                    feedType="RECOMMENDED.INTERESTS"
                    href="#"
                    liked={feedLiked}
                    bookmarked={feedBookmarked}
                    onLike={() => setFeedLiked(!feedLiked)}
                    onShare={() => console.log('Share clicked')}
                    onBookmark={() => setFeedBookmarked(!feedBookmarked)}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">이미지 포함 피드</p>
                  <CommunityFeedCard
                    userProfile={sampleUserProfile}
                    content="React 19의 새로운 기능들을 정리해봤습니다! 특히 Server Components와 Actions가 인상적이네요."
                    createdAt="3시간 전"
                    stats={{
                      likeCount: 145,
                      replyCount: 32,
                      viewCount: 2345,
                    }}
                    imageUrls={[
                      'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
                      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
                    ]}
                    href="#"
                    onLike={() => console.log('Like')}
                    onShare={() => console.log('Share')}
                    onBookmark={() => console.log('Bookmark')}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">다중 이미지 피드</p>
                  <CommunityFeedCard
                    userProfile={sampleUserProfile}
                    content="오늘 다녀온 개발자 컨퍼런스 사진들 공유합니다!"
                    createdAt="5시간 전"
                    stats={{
                      likeCount: 89,
                      replyCount: 15,
                      viewCount: 567,
                    }}
                    imageUrls={[
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
                      'https://images.unsplash.com/photo-1591115765373-5207764f72e7',
                      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678',
                      'https://images.unsplash.com/photo-1511578314322-379afb476865',
                    ]}
                    href="#"
                    onLike={() => console.log('Like')}
                    onShare={() => console.log('Share')}
                    onBookmark={() => console.log('Bookmark')}
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* QnaCard */}
            <ComponentShowcase
              title="QnaCard"
              description="QnA 질문 카드 컴포넌트"
              usageContext="Community/qna 페이지, 질문 목록 표시"
            >
              <div className="space-y-6 max-w-2xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">미답변 질문</p>
                  <QnaCard
                    qnaId={10645}
                    title="AI개발 포트폴리오"
                    description="안녕하세요
6개월간의 AI 부트캠프를 수료하였고 미니 프로젝트 4개와 최종 프로젝트 1개를 만들었습니다.
이를 기반으로 입사 지원을 하려고 하는데 개발 직군은 처음 지원해봐서 여러 궁금한 점들이 많습니다.

현재 제가 포트폴리오로 만들고자 하는 프로젝트는 ML과 LLM 합쳐서 3개정도 있고 이 중 2개는 미니 프로젝트, 1개는 최종 프로젝트입니다."
                    createdAt="2025-10-29 11:33:54"
                    hashTagNames="포트폴리오 취업"
                    answerCount={0}
                    commentCount={0}
                    likeCount={0}
                    viewCount={17}
                    href="#"
                    liked={qnaLiked}
                    disliked={qnaDisliked}
                    onLike={() => setQnaLiked(!qnaLiked)}
                    onDislike={() => setQnaDisliked(!qnaDisliked)}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">답변 완료 질문</p>
                  <QnaCard
                    qnaId={10644}
                    title="React vs Vue, 어떤 프레임워크를 선택해야 할까요?"
                    description="신입 프론트엔드 개발자로 취업을 준비 중인데, React와 Vue 중 어떤 것을 먼저 공부해야 할지 고민입니다. 각각의 장단점과 취업 시장에서의 수요가 궁금합니다."
                    createdAt="2일 전"
                    hashTagNames="React Vue 프론트엔드 취업"
                    answerCount={8}
                    commentCount={15}
                    likeCount={23}
                    viewCount={456}
                    href="#"
                    onLike={() => console.log('Like')}
                    onDislike={() => console.log('Dislike')}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">비공개 질문</p>
                  <QnaCard
                    qnaId={10643}
                    title="현재 회사에서의 연봉 협상 방법"
                    description="입사 3년차인데 연봉 협상을 어떻게 해야 할지 모르겠습니다. 동종 업계 평균이나 협상 팁을 알려주실 수 있나요?"
                    createdAt="1주 전"
                    hashTagNames="연봉 협상 경력"
                    answerCount={5}
                    commentCount={8}
                    likeCount={12}
                    viewCount={234}
                    isPublic={0}
                    href="#"
                    onLike={() => console.log('Like')}
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* PromotionCard */}
            <ComponentShowcase
              title="PromotionCard"
              description="홍보 게시물 카드 컴포넌트"
              usageContext="Community/promotion 페이지, 홍보/광고 콘텐츠 표시"
            >
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">기본 (Default) 버전</p>
                  <div className="max-w-sm">
                    <PromotionCard
                      title="2024 개발자 채용 박람회"
                      description="국내 최대 규모의 개발자 채용 박람회에 참여하세요. 100개 이상의 기업이 참가하며, 현장 면접 및 채용 상담이 진행됩니다."
                      imageUrl="https://images.unsplash.com/photo-1540575467063-178a50c2df87"
                      logoUrl="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200"
                      company="Career Fair Inc."
                      category="채용 이벤트"
                      tags={['채용', '개발자', '박람회', 'IT']}
                      startDate="2024-11-15"
                      endDate="2024-11-17"
                      href="#"
                      ctaText="사전 등록하기"
                      sponsored={true}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">배너 (Banner) 버전</p>
                  <PromotionCard
                    variant="banner"
                    title="AI 부트캠프 6기 모집"
                    description="6개월 만에 AI 엔지니어로 전환하세요. 현직 AI 엔지니어의 1:1 멘토링과 실전 프로젝트를 통해 포트폴리오를 완성할 수 있습니다."
                    imageUrl="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400"
                    company="AI Academy"
                    category="교육"
                    tags={['AI', '부트캠프', '취업 연계']}
                    startDate="2024-12-01"
                    endDate="2025-05-31"
                    href="#"
                    ctaText="지원하기"
                    sponsored={true}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">간단한 (Compact) 버전</p>
                  <div className="max-w-md">
                    <PromotionCard
                      variant="compact"
                      title="개발자를 위한 영문 이력서 첨삭 서비스"
                      description="글로벌 기업 지원을 위한 전문 영문 이력서 첨삭 서비스를 제공합니다."
                      logoUrl="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200"
                      company="Resume Pro"
                      href="#"
                      ctaText="상담 신청"
                      sponsored={true}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">비후원 콘텐츠</p>
                  <div className="max-w-sm">
                    <PromotionCard
                      title="무료 개발자 커뮤니티 밋업"
                      description="매주 토요일 열리는 개발자 커뮤니티 밋업에 참여하세요. 네트워킹과 기술 공유의 시간을 가질 수 있습니다."
                      imageUrl="https://images.unsplash.com/photo-1511578314322-379afb476865"
                      company="Dev Community"
                      category="커뮤니티"
                      tags={['무료', '밋업', '네트워킹']}
                      href="#"
                      ctaText="참여 신청"
                      sponsored={false}
                    />
                  </div>
                </div>
              </div>
            </ComponentShowcase>


            <div className="mt-12 p-6 bg-white border border-slate-200 rounded-lg">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Community Components 가이드</h2>
              <div className="space-y-3 text-sm text-slate-700">
                <p>• CommunityFeedCard는 피드/댓글/리포스트 등 다양한 사용자 인터랙션을 지원합니다.</p>
                <p>• QnaCard는 질문의 상태(답변 유무)를 시각적으로 표시합니다.</p>
                <p>• PromotionCard는 3가지 레이아웃(default, banner, compact)을 제공합니다.</p>
                <p>• 커뮤니티 페이지의 탭 전환은 기존 CategoryTabs 컴포넌트를 사용합니다.</p>
                <p>• 모든 카드 컴포넌트는 기존 UI 컴포넌트(Avatar, Badge, Button 등)를 재사용합니다.</p>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <QuickNav items={navItems} />
          </aside>
        </div>
      </div>
    </div>
  );
}
