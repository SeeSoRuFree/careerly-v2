'use client';

import * as React from 'react';
import { TabNav } from '@/components/design-guide/TabNav';
import { ComponentTabNav } from '@/components/design-guide/ComponentTabNav';
import { ComponentShowcase } from '@/components/design-guide/ComponentShowcase';
import { QuickNav } from '@/components/design-guide/QuickNav';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Heart, Bookmark, Search, X, Settings, Share2, MoreHorizontal, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { SearchInline } from '@/components/ui/search-inline';
import { SearchComposeInput } from '@/components/ui/search-compose-input';
import { CategoryTabs } from '@/components/ui/category-tabs';
import { TagBar } from '@/components/ui/tag-bar';
import { SortControl, SortValue } from '@/components/ui/sort-control';
import { FilterGroup } from '@/components/ui/filter-group';
import { ActionBar } from '@/components/ui/action-bar';
import { LoadMore } from '@/components/ui/load-more';
import { InterestSelectorPanel, InterestCategory } from '@/components/ui/interest-selector-panel';
import { DiscoverCategoryTabs } from '@/components/ui/discover-category-tabs';
import { ThreadActionBar } from '@/components/ui/thread-action-bar';
import { SuggestedFollowUpInput } from '@/components/ui/suggested-follow-up-input';
import { ModelSelectControl } from '@/components/ui/model-select-control';
import { ViewModeToggle, ViewMode } from '@/components/ui/view-mode-toggle';
import { SearchLimitBanner } from '@/components/ui/search-limit-banner';
import { SatisfactionSurvey } from '@/components/ui/satisfaction-survey';
import { Code, Palette, Briefcase, Rocket, Database, Globe } from 'lucide-react';

export default function ComponentsPage() {
  const [switchChecked, setSwitchChecked] = React.useState(false);
  const [checkboxChecked, setCheckboxChecked] = React.useState(false);
  const [radioValue, setRadioValue] = React.useState('popular');
  const [selectValue, setSelectValue] = React.useState('');
  const [sliderValue, setSliderValue] = React.useState([50]);
  const [searchValue, setSearchValue] = React.useState('');
  const [composeValue, setComposeValue] = React.useState('');
  const [composeLoading, setComposeLoading] = React.useState(false);
  const [categoryTabActive, setCategoryTabActive] = React.useState('all');
  const [activeTags, setActiveTags] = React.useState<string[]>([]);
  const [sortValue, setSortValue] = React.useState<SortValue>('trending');
  const [filterValues, setFilterValues] = React.useState<Record<string, string | string[] | boolean>>({
    categories: [],
    period: '',
    showImages: false,
    showSummary: false,
  });
  const [loadMoreHasMore, setLoadMoreHasMore] = React.useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = React.useState(false);
  const [selectedInterests, setSelectedInterests] = React.useState<string[]>(['tech', 'design']);
  const [discoverTab, setDiscoverTab] = React.useState('recommended');
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [followUpValue, setFollowUpValue] = React.useState('');
  const [selectedModel, setSelectedModel] = React.useState('gpt-4');
  const [viewMode, setViewMode] = React.useState<ViewMode>('answer');
  const [surveySearchId] = React.useState('search-123');

  const interestCategories: InterestCategory[] = [
    { id: 'tech', label: '기술', icon: <Code className="h-4 w-4" /> },
    { id: 'design', label: '디자인', icon: <Palette className="h-4 w-4" /> },
    { id: 'business', label: '비즈니스', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'startup', label: '스타트업', icon: <Rocket className="h-4 w-4" /> },
    { id: 'data', label: '데이터', icon: <Database className="h-4 w-4" /> },
    { id: 'global', label: '글로벌', icon: <Globe className="h-4 w-4" /> },
  ];

  const navItems = [
    { id: 'button', label: 'Button' },
    { id: 'icon-button', label: 'IconButton' },
    { id: 'input', label: 'Input' },
    { id: 'search-inline', label: 'SearchInline' },
    { id: 'search-compose-input', label: 'SearchComposeInput' },
    { id: 'category-tabs', label: 'CategoryTabs' },
    { id: 'tag-bar', label: 'TagBar' },
    { id: 'sort-control', label: 'SortControl' },
    { id: 'filter-group', label: 'FilterGroup' },
    { id: 'action-bar', label: 'ActionBar' },
    { id: 'radio', label: 'Radio / RadioGroup' },
    { id: 'checkbox', label: 'Checkbox' },
    { id: 'switch', label: 'Switch' },
    { id: 'select', label: 'Select' },
    { id: 'slider', label: 'Slider' },
    { id: 'load-more', label: 'LoadMore' },
    { id: 'interest-selector-panel', label: 'InterestSelectorPanel' },
    { id: 'discover-category-tabs', label: 'DiscoverCategoryTabs' },
    { id: 'thread-action-bar', label: 'ThreadActionBar' },
    { id: 'suggested-follow-up-input', label: 'SuggestedFollowUpInput' },
    { id: 'model-select-control', label: 'ModelSelectControl' },
    { id: 'view-mode-toggle', label: 'ViewModeToggle' },
    { id: 'search-limit-banner', label: 'SearchLimitBanner' },
    { id: 'satisfaction-survey', label: 'SatisfactionSurvey' },
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
          <h2 className="text-2xl font-bold text-slate-900">Inputs & Controls</h2>
          <p className="text-slate-600 mt-1">
            사용자 입력과 제어를 위한 컴포넌트 - 버튼, 입력 필드, 선택기 등
          </p>
        </div>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Button */}
            <ComponentShowcase
              title="Button"
              description="액션을 트리거하는 기본 버튼 컴포넌트"
              usageContext="카드 CTA, 더 보기, 팔로우/북마크, 정렬 적용"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Variants (Slate Primary)</p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="solid">Solid Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="link">Link Button</Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Coral Accent</p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="coral">Coral Button</Button>
                    <Button variant="coral">
                      <Heart className="mr-2 h-4 w-4" />
                      좋아요
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Sizes</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Icons</p>
                  <div className="flex flex-wrap gap-3">
                    <Button>
                      <Heart className="mr-2 h-4 w-4" />
                      좋아요
                    </Button>
                    <Button variant="outline">
                      <Bookmark className="mr-2 h-4 w-4" />
                      북마크
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">States</p>
                  <div className="flex flex-wrap gap-3">
                    <Button disabled>Disabled</Button>
                  </div>
                </div>
              </div>
            </ComponentShowcase>

            {/* IconButton */}
            <ComponentShowcase
              title="IconButton"
              description="아이콘만 있는 버튼 컴포넌트"
              usageContext="카드 우측 상단 액션(공유/북마크), 정렬 아이콘 토글"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Variants (Slate Primary)</p>
                  <div className="flex flex-wrap gap-3">
                    <IconButton variant="solid" aria-label="Like">
                      <Heart className="h-5 w-5" />
                    </IconButton>
                    <IconButton variant="outline" aria-label="Bookmark">
                      <Bookmark className="h-5 w-5" />
                    </IconButton>
                    <IconButton variant="ghost" aria-label="More options">
                      <Settings className="h-5 w-5" />
                    </IconButton>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Coral Accent</p>
                  <div className="flex flex-wrap gap-3">
                    <IconButton variant="coral" aria-label="Like with coral">
                      <Heart className="h-5 w-5" />
                    </IconButton>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Sizes</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <IconButton size="sm" aria-label="Small">
                      <Heart className="h-4 w-4" />
                    </IconButton>
                    <IconButton size="md" aria-label="Medium">
                      <Heart className="h-5 w-5" />
                    </IconButton>
                    <IconButton size="lg" aria-label="Large">
                      <Heart className="h-6 w-6" />
                    </IconButton>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Pressed State</p>
                  <div className="flex flex-wrap gap-3">
                    <IconButton pressed={false} aria-label="Not pressed">
                      <Bookmark className="h-5 w-5" />
                    </IconButton>
                    <IconButton pressed aria-label="Pressed">
                      <Bookmark className="h-5 w-5 fill-current" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </ComponentShowcase>

            {/* Input */}
            <ComponentShowcase title="Input" description="텍스트 입력 컴포넌트" usageContext="내부 검색, 필터 값 입력">
              <div className="space-y-4 max-w-md">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default</p>
                  <Input placeholder="검색어를 입력하세요..." />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Icons</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input className="pl-10" placeholder="검색..." />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Clear Button</p>
                  <div className="relative">
                    <Input className="pr-10" placeholder="입력하세요..." defaultValue="텍스트" />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Disabled</p>
                  <Input disabled placeholder="비활성화됨" />
                </div>
              </div>
            </ComponentShowcase>

            {/* SearchInline */}
            <ComponentShowcase
              title="SearchInline"
              description="페이지 내 소형 검색 컴포넌트"
              usageContext="Discover 상단 서브 검색"
            >
              <div className="space-y-4 max-w-md">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default</p>
                  <SearchInline
                    value={searchValue}
                    onChange={setSearchValue}
                    onSubmit={(value) => console.log('Search:', value)}
                    placeholder="검색어를 입력하세요..."
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Custom Icon</p>
                  <SearchInline
                    leadingIcon={<Search className="h-4 w-4 text-coral-500" />}
                    placeholder="커스텀 아이콘..."
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Disabled</p>
                  <SearchInline disabled placeholder="비활성화됨" />
                </div>

                <p className="text-sm text-slate-600">현재 검색어: {searchValue || '(없음)'}</p>
              </div>
            </ComponentShowcase>

            {/* SearchComposeInput */}
            <ComponentShowcase
              title="SearchComposeInput"
              description="AI 검색을 위한 멀티라인 입력 컴포넌트"
              usageContext="index 페이지 메인 검색창"
            >
              <div className="space-y-4 max-w-2xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default with All Actions</p>
                  <SearchComposeInput
                    value={composeValue}
                    onChange={setComposeValue}
                    onSubmit={(value) => {
                      console.log('Submit:', value);
                      setComposeLoading(true);
                      setTimeout(() => {
                        setComposeLoading(false);
                        setComposeValue('');
                      }, 2000);
                    }}
                    loading={composeLoading}
                    placeholder="궁금한 커리어 정보를 검색해보세요..."
                    actions={{ voice: true, fileUpload: true, modelSelect: true }}
                    onVoiceClick={() => console.log('Voice clicked')}
                    onFileUploadClick={() => console.log('File upload clicked')}
                    onModelSelectClick={() => console.log('Model select clicked')}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Limited Actions</p>
                  <SearchComposeInput
                    placeholder="음성 입력만 가능..."
                    actions={{ voice: true, fileUpload: false, modelSelect: false }}
                    onVoiceClick={() => console.log('Voice clicked')}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Loading State</p>
                  <SearchComposeInput
                    value="검색 중인 내용"
                    loading={true}
                    placeholder="검색 중..."
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Auto Focus</p>
                  <SearchComposeInput
                    autoFocus
                    placeholder="자동 포커스..."
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm text-slate-600">
                  <p><strong>키보드 단축키:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Enter: 검색 실행</li>
                    <li>Shift + Enter: 줄바꿈</li>
                  </ul>
                  <p className="mt-3"><strong>현재 입력값:</strong> {composeValue || '(없음)'}</p>
                </div>
              </div>
            </ComponentShowcase>

            {/* CategoryTabs */}
            <ComponentShowcase
              title="CategoryTabs"
              description="카테고리 전환 탭 컴포넌트"
              usageContext="주제 상단"
            >
              <div className="space-y-4">
                <CategoryTabs
                  items={[
                    { id: 'all', label: '전체', count: 128 },
                    { id: 'tech', label: '기술', count: 45 },
                    { id: 'design', label: '디자인', count: 32 },
                    { id: 'business', label: '비즈니스', count: 51 },
                  ]}
                  activeId={categoryTabActive}
                  onChange={setCategoryTabActive}
                />
                <p className="text-sm text-slate-600">선택된 탭: {categoryTabActive}</p>
              </div>
            </ComponentShowcase>

            {/* TagBar */}
            <ComponentShowcase
              title="TagBar"
              description="토픽 태그 스크롤 바"
              usageContext="헤더 하단/본문 상단"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Scrollable (Default)</p>
                  <TagBar
                    tags={['React', 'TypeScript', 'Next.js', 'Tailwind', 'Node.js', 'GraphQL', 'Docker', 'AWS']}
                    activeTags={activeTags}
                    onToggle={(tag) => {
                      setActiveTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      );
                    }}
                    scrollable={true}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Wrapped</p>
                  <TagBar
                    tags={['Python', 'Java', 'C++', 'Go']}
                    activeTags={activeTags}
                    onToggle={(tag) => {
                      setActiveTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      );
                    }}
                    scrollable={false}
                  />
                </div>

                <p className="text-sm text-slate-600">활성 태그: {activeTags.join(', ') || '(없음)'}</p>
              </div>
            </ComponentShowcase>

            {/* SortControl */}
            <ComponentShowcase
              title="SortControl"
              description="정렬 선택 컴포넌트"
              usageContext="그리드/피드 상단"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Dropdown (Default)</p>
                  <SortControl value={sortValue} onChange={setSortValue} variant="dropdown" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Radio Group</p>
                  <SortControl value={sortValue} onChange={setSortValue} variant="radio" />
                </div>

                <p className="text-sm text-slate-600">선택: {sortValue}</p>
              </div>
            </ComponentShowcase>

            {/* FilterGroup */}
            <ComponentShowcase
              title="FilterGroup"
              description="필터 묶음 컴포넌트"
              usageContext="우측 사이드(또는 Popover)"
            >
              <div className="max-w-md">
                <FilterGroup
                  sections={[
                    {
                      id: 'categories',
                      title: '카테고리',
                      type: 'checkbox',
                      options: [
                        { id: 'tech', label: '기술' },
                        { id: 'design', label: '디자인' },
                        { id: 'business', label: '비즈니스' },
                      ],
                    },
                    {
                      id: 'period',
                      title: '기간',
                      type: 'select',
                      options: [
                        { id: '24h', label: '지난 24시간' },
                        { id: '7d', label: '지난 7일' },
                        { id: '30d', label: '지난 30일' },
                      ],
                    },
                    {
                      id: 'settings',
                      title: '설정',
                      type: 'switch',
                      options: [
                        { id: 'showImages', label: '이미지 포함' },
                        { id: 'showSummary', label: '요약만 보기' },
                      ],
                    },
                  ]}
                  values={filterValues}
                  onChange={(sectionId, value) => {
                    setFilterValues((prev) => ({ ...prev, [sectionId]: value }));
                  }}
                  onReset={() => {
                    setFilterValues({
                      categories: [],
                      period: '',
                      showImages: false,
                      showSummary: false,
                    });
                  }}
                />
              </div>
            </ComponentShowcase>

            {/* ActionBar */}
            <ComponentShowcase
              title="ActionBar"
              description="카드 내 작은 액션 버튼 모음"
              usageContext="북마크/공유/더보기"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default</p>
                  <ActionBar
                    actions={[
                      { id: 'bookmark', icon: <Bookmark className="h-5 w-5" />, label: '북마크' },
                      { id: 'share', icon: <Share2 className="h-5 w-5" />, label: '공유' },
                      { id: 'more', icon: <MoreHorizontal className="h-5 w-5" />, label: '더보기' },
                    ]}
                    onAction={(id) => console.log('Action:', id)}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Pressed State</p>
                  <ActionBar
                    actions={[
                      { id: 'like', icon: <Heart className="h-5 w-5" />, label: '좋아요', pressed: true },
                      { id: 'bookmark', icon: <Bookmark className="h-5 w-5" />, label: '북마크', pressed: false },
                    ]}
                    onAction={(id) => console.log('Action:', id)}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Small Size</p>
                  <ActionBar
                    actions={[
                      { id: 'bookmark', icon: <Bookmark className="h-4 w-4" />, label: '북마크' },
                      { id: 'share', icon: <Share2 className="h-4 w-4" />, label: '공유' },
                    ]}
                    onAction={(id) => console.log('Action:', id)}
                    size="sm"
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* Radio */}
            <ComponentShowcase
              title="Radio / RadioGroup"
              description="단일 선택 컴포넌트"
              usageContext="정렬(단일), 표시 밀도 선택"
            >
              <div className="space-y-4">
                <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="popular" id="popular" />
                    <Label htmlFor="popular">인기순</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="latest" id="latest" />
                    <Label htmlFor="latest">최신순</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oldest" id="oldest" />
                    <Label htmlFor="oldest">오래된순</Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-slate-600">선택: {radioValue}</p>
              </div>
            </ComponentShowcase>

            {/* Checkbox */}
            <ComponentShowcase
              title="Checkbox"
              description="다중 선택 컴포넌트"
              usageContext="다중 카테고리 필터"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cat1"
                      checked={checkboxChecked}
                      onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
                    />
                    <label htmlFor="cat1" className="text-sm font-medium leading-none cursor-pointer">
                      카테고리 1
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cat2" />
                    <label htmlFor="cat2" className="text-sm font-medium leading-none cursor-pointer">
                      카테고리 2
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cat3" />
                    <label htmlFor="cat3" className="text-sm font-medium leading-none cursor-pointer">
                      카테고리 3
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cat4" disabled />
                    <label htmlFor="cat4" className="text-sm font-medium leading-none text-slate-400">
                      비활성화
                    </label>
                  </div>
                </div>
              </div>
            </ComponentShowcase>

            {/* Switch */}
            <ComponentShowcase
              title="Switch"
              description="ON/OFF 설정 토글"
              usageContext="요약만 보기, 이미지 포함"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="summary" checked={switchChecked} onCheckedChange={setSwitchChecked} />
                  <Label htmlFor="summary">요약만 보기</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="images" />
                  <Label htmlFor="images">이미지 포함</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="disabled" disabled />
                  <Label htmlFor="disabled" className="text-slate-400">
                    비활성화
                  </Label>
                </div>
              </div>
            </ComponentShowcase>

            {/* Select */}
            <ComponentShowcase
              title="Select"
              description="단일 선택 드롭다운"
              usageContext="기간(24h/7d/30d) 선택"
            >
              <div className="max-w-xs space-y-4">
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="기간 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">지난 24시간</SelectItem>
                    <SelectItem value="7d">지난 7일</SelectItem>
                    <SelectItem value="30d">지난 30일</SelectItem>
                    <SelectItem value="all">전체</SelectItem>
                  </SelectContent>
                </Select>
                {selectValue && <p className="text-sm text-slate-600">선택: {selectValue}</p>}
              </div>
            </ComponentShowcase>

            {/* Slider */}
            <ComponentShowcase
              title="Slider"
              description="연속 값 선택 컴포넌트"
              usageContext="길이/인기 임계값(선택적)"
            >
              <div className="max-w-md space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>인기도 임계값</Label>
                    <span className="text-sm text-slate-600">{sliderValue[0]}%</span>
                  </div>
                  <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
                </div>
              </div>
            </ComponentShowcase>

            {/* LoadMore */}
            <ComponentShowcase
              title="LoadMore"
              description="페이지네이션/더보기 컴포넌트"
              usageContext="FeedList 하단"
            >
              <div className="space-y-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Has More Items</p>
                  <LoadMore
                    hasMore={loadMoreHasMore}
                    loading={loadMoreLoading}
                    onLoadMore={() => {
                      setLoadMoreLoading(true);
                      setTimeout(() => {
                        setLoadMoreLoading(false);
                        setLoadMoreHasMore(false);
                      }, 2000);
                    }}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Loading State</p>
                  <LoadMore hasMore={true} loading={true} onLoadMore={() => {}} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">End of List</p>
                  <LoadMore hasMore={false} loading={false} onLoadMore={() => {}} />
                </div>
              </div>
            </ComponentShowcase>

            {/* InterestSelectorPanel */}
            <ComponentShowcase
              title="InterestSelectorPanel"
              description="관심사 선택 패널"
              usageContext="Discover 개인화, 온보딩"
            >
              <div className="max-w-lg">
                <InterestSelectorPanel
                  categories={interestCategories}
                  selectedCategories={selectedInterests}
                  onToggle={(categoryId) => {
                    setSelectedInterests((prev) =>
                      prev.includes(categoryId)
                        ? prev.filter((id) => id !== categoryId)
                        : [...prev, categoryId]
                    );
                  }}
                  onSave={(selectedIds) => {
                    console.log('Saved interests:', selectedIds);
                  }}
                />
              </div>
            </ComponentShowcase>

            {/* DiscoverCategoryTabs */}
            <ComponentShowcase
              title="DiscoverCategoryTabs"
              description="Discover 카테고리 탭"
              usageContext="Discover 페이지 상단 탐색"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default Tabs</p>
                  <DiscoverCategoryTabs
                    activeId={discoverTab}
                    onChange={setDiscoverTab}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">With Custom Tabs</p>
                  <DiscoverCategoryTabs
                    tabs={[
                      { id: 'all', label: '전체', count: 128 },
                      { id: 'tech', label: '기술', count: 45 },
                      { id: 'design', label: '디자인', count: 32 },
                      { id: 'business', label: '비즈니스', count: 51 },
                    ]}
                    activeId={discoverTab}
                    onChange={setDiscoverTab}
                    showCounts={true}
                  />
                </div>

                <p className="text-sm text-slate-600">선택된 탭: {discoverTab}</p>
              </div>
            </ComponentShowcase>

            {/* ThreadActionBar */}
            <ComponentShowcase
              title="ThreadActionBar"
              description="검색 스레드 상단 액션 버튼 그룹"
              usageContext="검색 결과 페이지 Q/A 상단 오른쪽"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">All Actions</p>
                  <ThreadActionBar
                    onShare={() => console.log('Share')}
                    onBookmark={() => setIsBookmarked(!isBookmarked)}
                    onExport={() => console.log('Export')}
                    onRewrite={() => console.log('Rewrite')}
                    isBookmarked={isBookmarked}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Limited Actions</p>
                  <ThreadActionBar
                    onShare={() => console.log('Share')}
                    onBookmark={() => console.log('Bookmark')}
                  />
                </div>

                <p className="text-sm text-slate-600">북마크 상태: {isBookmarked ? '저장됨' : '저장 안됨'}</p>
              </div>
            </ComponentShowcase>

            {/* SuggestedFollowUpInput */}
            <ComponentShowcase
              title="SuggestedFollowUpInput"
              description="후속 질문 입력 컴포넌트"
              usageContext="검색 답변 하단, 빠른 후속 질문 입력"
            >
              <div className="space-y-4 max-w-2xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default</p>
                  <SuggestedFollowUpInput
                    value={followUpValue}
                    onChange={setFollowUpValue}
                    onSubmit={() => {
                      console.log('Follow-up:', followUpValue);
                      setFollowUpValue('');
                    }}
                    placeholder="Ask a follow-up question..."
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Custom Placeholder</p>
                  <SuggestedFollowUpInput
                    value=""
                    onChange={() => {}}
                    onSubmit={() => {}}
                    placeholder="더 궁금한 점을 물어보세요..."
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Disabled</p>
                  <SuggestedFollowUpInput
                    value=""
                    onChange={() => {}}
                    onSubmit={() => {}}
                    disabled
                    placeholder="비활성화됨"
                  />
                </div>

                <p className="text-sm text-slate-600">현재 입력값: {followUpValue || '(없음)'}</p>
              </div>
            </ComponentShowcase>

            {/* ModelSelectControl */}
            <ComponentShowcase
              title="ModelSelectControl"
              description="AI 모델 선택 컴포넌트"
              usageContext="검색 입력창 옆 또는 상단, 모델 전환"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default</p>
                  <ModelSelectControl
                    model={selectedModel}
                    models={[
                      { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
                      { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
                      { id: 'claude-3', name: 'Claude 3', description: 'Anthropic model' },
                      { id: 'claude-2', name: 'Claude 2', description: 'Previous generation' },
                    ]}
                    onSelectModel={setSelectedModel}
                    label="Model"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Custom Label</p>
                  <ModelSelectControl
                    model={selectedModel}
                    models={[
                      { id: 'gpt-4', name: 'GPT-4' },
                      { id: 'claude-3', name: 'Claude 3' },
                    ]}
                    onSelectModel={setSelectedModel}
                    label="AI 모델"
                  />
                </div>

                <p className="text-sm text-slate-600">선택된 모델: {selectedModel}</p>
              </div>
            </ComponentShowcase>

            {/* ViewModeToggle */}
            <ComponentShowcase
              title="ViewModeToggle"
              description="답변/출처 보기 모드 전환 토글"
              usageContext="검색 결과 페이지, Perplexity 스타일 모드 전환"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default</p>
                  <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Answer Mode</p>
                  <ViewModeToggle mode="answer" onChange={() => {}} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Sources Mode</p>
                  <ViewModeToggle mode="sources" onChange={() => {}} />
                </div>

                <p className="text-sm text-slate-600">현재 모드: {viewMode === 'answer' ? '답변 보기' : '출처 보기'}</p>
              </div>
            </ComponentShowcase>

            {/* SearchLimitBanner */}
            <ComponentShowcase
              title="SearchLimitBanner"
              description="검색 횟수 제한 안내 배너"
              usageContext="베타 기간 검색 제한, 사용량 표시"
            >
              <div className="space-y-4 max-w-2xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Warning State (남은 횟수 있음)</p>
                  <SearchLimitBanner
                    searchCount={7}
                    maxSearches={10}
                    resetTime={new Date(new Date().setHours(24, 0, 0, 0))}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Limited State (횟수 소진)</p>
                  <SearchLimitBanner
                    searchCount={10}
                    maxSearches={10}
                    resetTime={new Date(new Date().setHours(24, 0, 0, 0))}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Early Stage (여유 있음)</p>
                  <SearchLimitBanner
                    searchCount={2}
                    maxSearches={10}
                    resetTime={new Date(new Date().setHours(24, 0, 0, 0))}
                  />
                </div>
              </div>
            </ComponentShowcase>

            {/* SatisfactionSurvey */}
            <ComponentShowcase
              title="SatisfactionSurvey"
              description="검색 결과 만족도 조사"
              usageContext="검색 결과 페이지 하단, 품질 피드백 수집"
            >
              <div className="space-y-4 max-w-2xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Default</p>
                  <SatisfactionSurvey
                    searchId={surveySearchId}
                    onSubmit={(data) => console.log('Survey submitted:', data)}
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm text-slate-600">
                  <p><strong>기능:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>5점 별점 시스템 (호버 효과 포함)</li>
                    <li>선택적 피드백 텍스트 입력 (최대 500자)</li>
                    <li>제출 완료 후 감사 메시지 표시</li>
                    <li>다시 작성하기 기능</li>
                  </ul>
                </div>
              </div>
            </ComponentShowcase>

            <div className="mt-12 p-6 bg-white border border-slate-200 rounded-lg">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Inputs & Controls 가이드</h2>
              <div className="space-y-3 text-sm text-slate-700">
                <p>• 모든 입력 컴포넌트는 접근성(a11y)을 고려하여 설계되었습니다.</p>
                <p>• 키보드 조작과 스크린리더를 지원합니다.</p>
                <p>• 각 컴포넌트는 disabled 상태를 지원합니다.</p>
                <p>• Form 라이브러리(React Hook Form 등)와 호환됩니다.</p>
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
