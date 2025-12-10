'use client';

import * as React from 'react';
import { TabNav } from '@/components/design-guide/TabNav';
import { ComponentTabNav } from '@/components/design-guide/ComponentTabNav';
import { ComponentShowcase } from '@/components/design-guide/ComponentShowcase';
import { QuickNav } from '@/components/design-guide/QuickNav';
import { Link } from '@/components/ui/link';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Kbd } from '@/components/ui/kbd';
import { MediaThumb } from '@/components/ui/media-thumb';
import { MetaRow } from '@/components/ui/meta-row';
import { TrendingUp, Sparkles, AlertCircle, User, Clock, Eye, DollarSign } from 'lucide-react';
import { DiscoverContentCard } from '@/components/ui/discover-content-card';
import { DiscoverHeroCard } from '@/components/ui/discover-hero-card';
import { WeatherInfoCard } from '@/components/ui/weather-info-card';
import { MarketAssetMiniCard } from '@/components/ui/market-asset-mini-card';
import { JobMarketTrendCard } from '@/components/ui/job-market-trend-card';
import { TrendingCompaniesPanel } from '@/components/ui/trending-companies-panel';
import { SearchQueryHeader } from '@/components/ui/search-query-header';
import { AnswerResponsePanel } from '@/components/ui/answer-response-panel';
import { CitationSourceList, CitationSource } from '@/components/ui/citation-source-list';
import { QuoteSourceLink } from '@/components/ui/quote-source-link';
import { RelatedQueriesSection, RelatedQuery } from '@/components/ui/related-queries-section';
import { SearchResultItem } from '@/components/ui/search-result-item';

export default function DisplayComponentsPage() {
  const [chipSelected, setChipSelected] = React.useState(false);
  const [chips, setChips] = React.useState(['React', 'TypeScript', 'Next.js']);
  const [liked, setLiked] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [answerLoading, setAnswerLoading] = React.useState(false);
  const [answerError, setAnswerError] = React.useState('');

  const citationSources: CitationSource[] = [
    { id: '1', title: 'React Documentation', faviconUrl: 'https://react.dev/favicon.ico' },
    { id: '2', title: 'MDN Web Docs' },
    { id: '3', title: 'Stack Overflow' },
  ];

  const relatedQueries: RelatedQuery[] = [
    { id: '1', queryText: 'React 19의 새로운 기능은 무엇인가요?', href: '#' },
    { id: '2', queryText: 'Next.js와 React의 차이점은?', href: '#' },
    { id: '3', queryText: 'TypeScript를 React 프로젝트에 어떻게 설정하나요?', href: '#' },
  ];

  const navItems = [
    { id: 'link', label: 'Link' },
    { id: 'badge', label: 'Badge' },
    { id: 'chip', label: 'Chip' },
    { id: 'avatar', label: 'Avatar' },
    { id: 'media-thumb', label: 'MediaThumb' },
    { id: 'meta-row', label: 'MetaRow' },
    { id: 'kbd', label: 'Kbd' },
    { id: 'discover-content-card', label: 'DiscoverContentCard' },
    { id: 'discover-hero-card', label: 'DiscoverHeroCard' },
    { id: 'weather-info-card', label: 'WeatherInfoCard' },
    { id: 'market-asset-mini-card', label: 'MarketAssetMiniCard' },
    { id: 'job-market-trend-card', label: 'JobMarketTrendCard' },
    { id: 'trending-companies-panel', label: 'TrendingCompaniesPanel' },
    { id: 'search-query-header', label: 'SearchQueryHeader' },
    { id: 'answer-response-panel', label: 'AnswerResponsePanel' },
    { id: 'citation-source-list', label: 'CitationSourceList' },
    { id: 'quote-source-link', label: 'QuoteSourceLink' },
    { id: 'related-queries-section', label: 'RelatedQueriesSection' },
    { id: 'search-result-item', label: 'SearchResultItem' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <TabNav />

        <div className="mt-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Components</h1>
          <p className="text-slate-600 mt-2">
            Careerly v2 디자인 시스템의 모든 컴포넌트입니다. 각 컴포넌트 제목을 클릭하면 이름이 복사됩니다.
          </p>
        </div>

        <ComponentTabNav />

        <div className="mt-6 mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Display & Typography</h2>
          <p className="text-slate-600 mt-1">
            정보 표시와 타이포그래피 컴포넌트 - 링크, 배지, 칩, 아바타 등
          </p>
        </div>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Link */}
            <ComponentShowcase
              title="Link"
              description="내부 및 외부 링크 컴포넌트"
              usageContext="카드 타이틀, 출처 이동, 푸터"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Variants (Slate Primary)</p>
                  <div className="flex flex-col gap-3">
                    <Link href="#" variant="default">
                      Default Link (underlined)
                    </Link>
                    <Link href="#" variant="subtle">
                      Subtle Link
                    </Link>
                    <Link href="#" variant="nav">
                      Navigation Link
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Coral Accent</p>
                  <Link href="#" variant="coral">
                    Coral Link for Special Actions
                  </Link>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">External Link</p>
                  <Link href="https://example.com" external>
                    External Link with Icon
                  </Link>
                </div>
              </div>
            </ComponentShowcase>

            {/* Badge */}
            <ComponentShowcase
              title="Badge"
              description="작고 강조된 라벨 컴포넌트"
              usageContext="카테고리/인기/신규 라벨"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Tones (Slate Primary)</p>
                  <div className="flex flex-wrap gap-3">
                    <Badge tone="default">Default</Badge>
                    <Badge tone="slate">Slate Dark</Badge>
                    <Badge tone="success">Success</Badge>
                    <Badge tone="warning">Warning</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Coral Accent</p>
                  <div className="flex flex-wrap gap-3">
                    <Badge tone="coral">Coral Badge</Badge>
                    <Badge tone="coral" icon={<TrendingUp />}>
                      인기
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Icons</p>
                  <div className="flex flex-wrap gap-3">
                    <Badge tone="slate" icon={<TrendingUp />}>
                      추천
                    </Badge>
                    <Badge tone="success" icon={<Sparkles />}>
                      신규
                    </Badge>
                    <Badge tone="warning" icon={<AlertCircle />}>
                      주의
                    </Badge>
                  </div>
                </div>
              </div>
            </ComponentShowcase>

            {/* Chip */}
            <ComponentShowcase
              title="Chip"
              description="토픽/태그 선택 컴포넌트"
              usageContext="상단 태그바, 추천 질의"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Selectable (Slate Primary)</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip selected={chipSelected} onToggle={() => setChipSelected(!chipSelected)}>
                      React
                    </Chip>
                    <Chip>TypeScript</Chip>
                    <Chip>Next.js</Chip>
                    <Chip>TailwindCSS</Chip>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">선택된 칩은 Slate 다크 색상으로 표시됩니다</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Dismissible</p>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip, index) => (
                      <Chip
                        key={chip}
                        dismissible
                        onDismiss={() => {
                          const newChips = [...chips];
                          newChips.splice(index, 1);
                          setChips(newChips);
                        }}
                      >
                        {chip}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </ComponentShowcase>

            {/* Avatar */}
            <ComponentShowcase
              title="Avatar"
              description="사용자/소스 썸네일 컴포넌트"
              usageContext="소스 아이덴티티, 작성자 정보"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Sizes</p>
                  <div className="flex flex-wrap items-end gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Fallback</p>
                  <div className="flex flex-wrap gap-3">
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            </ComponentShowcase>

            {/* MediaThumb */}
            <ComponentShowcase
              title="MediaThumb"
              description="썸네일 + 오버레이 컴포넌트"
              usageContext="TopicCard, FeedItem"
            >
              <div className="space-y-4 max-w-md">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Image (16:9)</p>
                  <MediaThumb
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                    alt="Laptop coding"
                    ratio="16:9"
                    badge="신규"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Video with Duration</p>
                  <MediaThumb
                    src="https://images.unsplash.com/photo-1611162617474-5b21e879e113"
                    alt="Video thumbnail"
                    ratio="16:9"
                    type="video"
                    duration="12:34"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Square (1:1)</p>
                  <MediaThumb
                    src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97"
                    alt="Square thumbnail"
                    ratio="1:1"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">4:3 Ratio</p>
                  <MediaThumb
                    src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
                    alt="4:3 thumbnail"
                    ratio="4:3"
                    badge="인기"
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* MetaRow */}
            <ComponentShowcase
              title="MetaRow"
              description="부가 정보 행"
              usageContext="카드 하단 메타(출처, 시간)"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default</p>
                  <MetaRow
                    items={[
                      { icon: <Clock className="h-4 w-4" />, label: '2시간 전' },
                      { icon: <Eye className="h-4 w-4" />, label: '1.2k 조회' },
                      { label: 'Tech' },
                    ]}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Links</p>
                  <MetaRow
                    items={[
                      { icon: <User className="h-4 w-4" />, label: 'John Doe', href: '#' },
                      { icon: <Clock className="h-4 w-4" />, label: '1일 전' },
                      { label: '디자인', href: '#' },
                    ]}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Custom Separator</p>
                  <MetaRow
                    items={[
                      { label: '출처: TechCrunch' },
                      { label: '5분 전' },
                      { label: '비즈니스' },
                    ]}
                    separator="|"
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* Kbd */}
            <ComponentShowcase title="Kbd" description="키보드 단축키 힌트" usageContext="키보드 단축키 안내">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm">검색 열기:</span>
                  <Kbd keys={['⌘', 'K']} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">검색:</span>
                  <Kbd keys="/" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">도움말:</span>
                  <Kbd keys="?" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">저장:</span>
                  <Kbd keys={['Ctrl', 'S']} />
                </div>
              </div>
            </ComponentShowcase>

            {/* DiscoverContentCard */}
            <ComponentShowcase
              title="DiscoverContentCard"
              description="Discover 페이지용 콘텐츠 카드"
              usageContext="Discover 피드, 뉴스/콘텐츠 리스트"
            >
              <div className="space-y-6 max-w-md">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Thumbnail</p>
                  <DiscoverContentCard
                    title="React 19의 새로운 기능과 변경사항"
                    summary="React 19에서 추가된 새로운 훅과 기능들을 자세히 알아봅니다."
                    thumbnailUrl="https://images.unsplash.com/photo-1633356122544-f134324a6cee"
                    sources={[{ name: 'React Blog', href: '#' }]}
                    postedAt="2시간 전"
                    stats={{ likes: 245, views: 1200 }}
                    href="#"
                    badge="인기"
                    badgeTone="coral"
                    liked={liked}
                    bookmarked={bookmarked}
                    onLike={() => setLiked(!liked)}
                    onBookmark={() => setBookmarked(!bookmarked)}
                    onShare={() => console.log('Share clicked')}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Without Thumbnail</p>
                  <DiscoverContentCard
                    title="TypeScript 5.0 베타 출시"
                    summary="TypeScript 5.0 베타 버전이 공개되었습니다. 새로운 기능들을 확인해보세요."
                    sources={[{ name: 'TypeScript Team', href: '#' }]}
                    postedAt="5시간 전"
                    stats={{ likes: 189, views: 890 }}
                    href="#"
                    badge="신규"
                    badgeTone="success"
                    onLike={() => console.log('Like')}
                    onBookmark={() => console.log('Bookmark')}
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* DiscoverHeroCard */}
            <ComponentShowcase
              title="DiscoverHeroCard"
              description="메인 히어로 콘텐츠 카드"
              usageContext="Discover 페이지 상단 대표 콘텐츠"
            >
              <div className="space-y-4">
                <DiscoverHeroCard
                  title="2024년 개발자 트렌드: AI와 함께하는 미래"
                  summary="인공지능이 개발자의 업무를 어떻게 변화시키고 있는지 알아봅니다."
                  imageUrl="https://images.unsplash.com/photo-1677442136019-21780ecad995"
                  href="#"
                  badge="추천"
                  badgeTone="coral"
                />
              </div>
            </ComponentShowcase>

            {/* WeatherInfoCard */}
            <ComponentShowcase
              title="WeatherInfoCard"
              description="날씨 정보 카드"
              usageContext="Discover 사이드바, 대시보드"
            >
              <div className="space-y-4 max-w-sm">
                <WeatherInfoCard
                  location="서울"
                  currentTemp={18}
                  condition="sunny"
                  humidity={65}
                  visibility="10km"
                  windSpeed="3m/s"
                  forecast={[
                    { day: '내일', temp: 20, condition: 'cloudy' },
                    { day: '모레', temp: 17, condition: 'rainy' },
                    { day: '3일 후', temp: 19, condition: 'sunny' },
                  ]}
                />
              </div>
            </ComponentShowcase>

            {/* MarketAssetMiniCard */}
            <ComponentShowcase
              title="MarketAssetMiniCard"
              description="개별 자산 미니 카드"
              usageContext="시장 정보, 기업 트렌드"
            >
              <div className="space-y-4 max-w-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Positive Change</p>
                  <MarketAssetMiniCard
                    symbol="AAPL"
                    name="Apple Inc."
                    price={178.25}
                    change={2.45}
                    changePercent={1.39}
                    logo={<DollarSign className="h-6 w-6 text-slate-600" />}
                    href="#"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Negative Change</p>
                  <MarketAssetMiniCard
                    symbol="TSLA"
                    name="Tesla Inc."
                    price={245.80}
                    change={-5.20}
                    changePercent={-2.07}
                    logo={<DollarSign className="h-6 w-6 text-slate-600" />}
                    href="#"
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* JobMarketTrendCard */}
            <ComponentShowcase
              title="JobMarketTrendCard"
              description="채용 시장 동향 카드"
              usageContext="Discover 사이드바, 채용 트렌드 섹션"
            >
              <div className="max-w-md">
                <JobMarketTrendCard
                  trends={[
                    {
                      id: 'frontend',
                      category: '프론트엔드',
                      position: 'React 개발자',
                      postingCount: 234,
                      change: 45,
                      changePercent: 23.8,
                      chart: [150, 165, 180, 190, 210, 220, 234],
                    },
                    {
                      id: 'backend',
                      category: '백엔드',
                      position: 'Node.js 개발자',
                      postingCount: 189,
                      change: 28,
                      changePercent: 17.4,
                      chart: [140, 145, 155, 160, 170, 175, 189],
                    },
                    {
                      id: 'ai',
                      category: 'AI/ML',
                      position: 'AI 엔지니어',
                      postingCount: 156,
                      change: -12,
                      changePercent: -7.1,
                      chart: [180, 175, 170, 165, 162, 158, 156],
                    },
                  ]}
                />
              </div>
            </ComponentShowcase>

            {/* TrendingCompaniesPanel */}
            <ComponentShowcase
              title="TrendingCompaniesPanel"
              description="트렌딩 기업 패널"
              usageContext="Discover 사이드바, 인기 기업 섹션"
            >
              <div className="max-w-md">
                <TrendingCompaniesPanel
                  maxItems={3}
                  companies={[
                    {
                      symbol: 'NVDA',
                      name: 'NVIDIA Corp',
                      price: 495.22,
                      change: 12.34,
                      changePercent: 2.56,
                      logo: <DollarSign className="h-6 w-6 text-emerald-600" />,
                      href: '#',
                    },
                    {
                      symbol: 'MSFT',
                      name: 'Microsoft Corp',
                      price: 378.91,
                      change: 5.67,
                      changePercent: 1.52,
                      logo: <DollarSign className="h-6 w-6 text-emerald-600" />,
                      href: '#',
                    },
                    {
                      symbol: 'GOOGL',
                      name: 'Alphabet Inc',
                      price: 142.50,
                      change: -2.30,
                      changePercent: -1.59,
                      logo: <DollarSign className="h-6 w-6 text-red-600" />,
                      href: '#',
                    },
                    {
                      symbol: 'AMZN',
                      name: 'Amazon.com Inc',
                      price: 178.35,
                      change: 3.20,
                      changePercent: 1.83,
                      logo: <DollarSign className="h-6 w-6 text-emerald-600" />,
                      href: '#',
                    },
                  ]}
                />
              </div>
            </ComponentShowcase>

            {/* SearchQueryHeader */}
            <ComponentShowcase
              title="SearchQueryHeader"
              description="검색 질문 표시 헤더"
              usageContext="검색 결과 페이지 상단, 질문 표시 및 수정"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Basic Query</p>
                  <SearchQueryHeader
                    queryText="React 19의 새로운 기능은 무엇인가요?"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Long Query</p>
                  <SearchQueryHeader
                    queryText="TypeScript와 JavaScript의 주요 차이점과 TypeScript를 사용하면 얻을 수 있는 이점은 무엇이며, 어떤 프로젝트에서 사용하는 것이 좋을까요?"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Short Query</p>
                  <SearchQueryHeader
                    queryText="Next.js의 App Router와 Pages Router 차이점"
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* AnswerResponsePanel */}
            <ComponentShowcase
              title="AnswerResponsePanel"
              description="AI 답변 표시 패널"
              usageContext="검색 결과 페이지, 모델 응답 본문"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Answer</p>
                  <AnswerResponsePanel
                    answerHtml="<h2>React란?</h2><p>React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다.</p><ul><li>컴포넌트 기반 아키텍처</li><li>가상 DOM 사용</li><li>단방향 데이터 흐름</li></ul><p>React는 Facebook에서 개발하고 유지보수하는 <strong>오픈소스 프로젝트</strong>입니다.</p>"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Loading State</p>
                  <AnswerResponsePanel loading={true} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Error State</p>
                  <AnswerResponsePanel
                    error="답변을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요."
                    onRetry={() => console.log('Retry clicked')}
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* QuoteSourceLink */}
            <ComponentShowcase
              title="QuoteSourceLink"
              description="개별 출처 링크 컴포넌트"
              usageContext="인용 출처 표시, CitationSourceList 내부 요소"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Favicon</p>
                  <div className="flex flex-wrap gap-2">
                    <QuoteSourceLink
                      title="React Documentation"
                      faviconUrl="https://react.dev/favicon.ico"
                    />
                    <QuoteSourceLink
                      title="MDN Web Docs"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Without Icon</p>
                  <QuoteSourceLink
                    title="Stack Overflow"
                    showIcon={false}
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* CitationSourceList */}
            <ComponentShowcase
              title="CitationSourceList"
              description="출처 목록 컴포넌트"
              usageContext="답변 하단, 출처 신뢰성 표기"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default</p>
                  <CitationSourceList sources={citationSources} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Custom Title</p>
                  <CitationSourceList sources={citationSources} title="참고 자료" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Many Sources</p>
                  <CitationSourceList
                    sources={[
                      ...citationSources,
                      { id: '4', title: 'GitHub' },
                      { id: '5', title: 'Dev.to' },
                      { id: '6', title: 'Medium' },
                    ]}
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* RelatedQueriesSection */}
            <ComponentShowcase
              title="RelatedQueriesSection"
              description="연관 질문 섹션"
              usageContext="답변 하단, 후속 질문 추천"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default</p>
                  <RelatedQueriesSection
                    relatedQueries={relatedQueries}
                    onQueryClick={(query) => console.log('Query clicked:', query.queryText)}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Custom Title</p>
                  <RelatedQueriesSection
                    relatedQueries={relatedQueries.slice(0, 2)}
                    title="추천 후속 질문"
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* SearchResultItem */}
            <ComponentShowcase
              title="SearchResultItem"
              description="검색 결과 아이템 카드"
              usageContext="검색 결과 리스트, 출처 문서 표시"
            >
              <div className="space-y-4 max-w-2xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Favicon</p>
                  <SearchResultItem
                    title="React - A JavaScript library for building user interfaces"
                    snippet="React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components."
                    href="https://react.dev"
                    faviconUrl="https://react.dev/favicon.ico"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Without Favicon</p>
                  <SearchResultItem
                    title="TypeScript: JavaScript With Syntax For Types"
                    snippet="TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale."
                    href="https://www.typescriptlang.org"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Long Content</p>
                  <SearchResultItem
                    title="Understanding React Server Components: A Deep Dive into the Future of React Applications"
                    snippet="React Server Components represent a paradigm shift in how we build React applications. This comprehensive guide explores the architecture, benefits, and implementation details of Server Components, including how they integrate with existing client-side React patterns and what this means for the future of web development."
                    href="https://example.com"
                  />
                </div>
              </div>
            </ComponentShowcase>

            <div className="mt-12 p-6 bg-white border border-slate-200 rounded-lg">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Display & Typography 가이드</h2>
              <div className="space-y-3 text-sm text-slate-700">
                <p>• 정보 표시 컴포넌트는 콘텐츠를 시각적으로 강조하고 구조화합니다.</p>
                <p>• Link는 접근성을 고려하여 외부 링크 아이콘을 자동으로 표시합니다.</p>
                <p>• Badge와 Chip은 상태나 카테고리를 나타내는 데 사용됩니다.</p>
                <p>• Avatar는 이미지 로딩 실패 시 Fallback을 제공합니다.</p>
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
