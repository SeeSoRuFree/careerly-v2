'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useChatSearchAllVersions } from '@/lib/api';
import type { ChatSearchResult, ApiVersion } from '@/lib/api';
import { cn } from '@/lib/utils';

// 10개 지정 컴포넌트 import
import { SearchQueryHeader } from '@/components/ui/search-query-header';
import { ThreadActionBar } from '@/components/ui/thread-action-bar';
import { AnswerResponsePanel } from '@/components/ui/answer-response-panel';
import { CitationSourceList, type CitationSource } from '@/components/ui/citation-source-list';
import { RelatedQueriesSection, type RelatedQuery } from '@/components/ui/related-queries-section';
import { SuggestedFollowUpInput } from '@/components/ui/suggested-follow-up-input';
import { ModelSelectControl, type Model } from '@/components/ui/model-select-control';
import { ViewModeToggle, type ViewMode } from '@/components/ui/view-mode-toggle';
import { SearchResultItem } from '@/components/ui/search-result-item';
import { ApiVersionToggle } from '@/components/ui/api-version-toggle';

// Mock 데이터
const MOCK_MODELS: Model[] = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
  { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  { id: 'claude-3', name: 'Claude 3', description: 'Long context support' },
];

const MOCK_ANSWER = `
<h1>프론트엔드 개발자로 성장하는 완벽한 로드맵 2024</h1>

<p>현대 웹 개발의 중심에 있는 프론트엔드 개발자는 사용자가 직접 경험하는 모든 것을 만들어냅니다. 이 가이드는 초보자부터 시니어 개발자까지, 체계적으로 성장할 수 있는 로드맵을 제시합니다.</p>

<hr />

<h2>🎯 커리어 성장 단계</h2>

<h3>1단계: 주니어 개발자 (0-2년) - 기초 다지기</h3>

<p>첫 번째 단계는 웹 개발의 <strong>핵심 기초</strong>를 탄탄히 다지는 시기입니다. 이 시기에는 다음과 같은 기술들을 습득해야 합니다:</p>

<h4>필수 학습 항목</h4>
<ul>
  <li><strong>HTML5 & CSS3</strong>
    <ul>
      <li>시맨틱 HTML 작성법</li>
      <li>Flexbox와 Grid 레이아웃</li>
      <li>CSS 애니메이션 및 트랜지션</li>
    </ul>
  </li>
  <li><strong>JavaScript (ES6+)</strong>
    <ul>
      <li>변수, 함수, 객체, 배열</li>
      <li>비동기 프로그래밍 (Promise, Async/Await)</li>
      <li>DOM 조작 및 이벤트 핸들링</li>
    </ul>
  </li>
  <li><strong>버전 관리</strong>
    <ul>
      <li>Git 기본 명령어 (add, commit, push, pull)</li>
      <li>브랜치 전략 이해하기</li>
      <li>GitHub/GitLab을 통한 협업</li>
    </ul>
  </li>
</ul>

<blockquote>
  <p><strong>💡 주니어 팁:</strong> 처음부터 완벽할 필요는 없습니다. 작은 프로젝트를 많이 만들어보면서 실수하고 배우는 것이 가장 빠른 성장 방법입니다.</p>
</blockquote>

<h4>첫 프로젝트 아이디어</h4>
<ol>
  <li><strong>Todo List 앱</strong> - CRUD 기능 학습</li>
  <li><strong>날씨 앱</strong> - API 호출 및 데이터 처리</li>
  <li><strong>포트폴리오 웹사이트</strong> - 반응형 디자인 실습</li>
</ol>

<pre><code class="language-javascript">// 간단한 비동기 함수 예제
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}
</code></pre>

<hr />

<h3>2단계: 미들 개발자 (2-5년) - 전문성 구축</h3>

<p>이제 <em>실무 경험</em>을 바탕으로 더 깊은 기술적 이해를 쌓아갈 때입니다. 이 단계에서는 다음과 같은 능력을 개발합니다:</p>

<h4>프레임워크 & 라이브러리 마스터</h4>
<ul>
  <li><strong>React / Vue / Angular</strong> 중 하나를 깊이 있게 학습
    <ul>
      <li>컴포넌트 설계 패턴</li>
      <li>상태 관리 (Redux, Pinia, NgRx)</li>
      <li>라우팅 및 네비게이션</li>
    </ul>
  </li>
  <li><strong>TypeScript</strong> - 타입 안정성 확보</li>
  <li><strong>테스팅</strong>
    <ul>
      <li>Unit Testing (Jest, Vitest)</li>
      <li>Integration Testing (React Testing Library)</li>
      <li>E2E Testing (Cypress, Playwright)</li>
    </ul>
  </li>
</ul>

<h4>성능 최적화 기법</h4>

<table>
  <thead>
    <tr>
      <th>기법</th>
      <th>설명</th>
      <th>효과</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Code Splitting</td>
      <td>번들을 작은 청크로 분리</td>
      <td>초기 로딩 시간 50% 단축</td>
    </tr>
    <tr>
      <td>Lazy Loading</td>
      <td>필요할 때만 컴포넌트 로드</td>
      <td>페이지 성능 개선</td>
    </tr>
    <tr>
      <td>Memoization</td>
      <td>계산 결과 캐싱</td>
      <td>리렌더링 최소화</td>
    </tr>
  </tbody>
</table>

<pre><code class="language-typescript">// TypeScript 인터페이스 예제
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

const getUserById = async (id: number): Promise&lt;User&gt; =&gt; {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
};
</code></pre>

<blockquote>
  <p><strong>⚡ 미들 레벨 인사이트:</strong> 단순히 코드가 작동하는 것을 넘어서, <em>왜</em> 그렇게 작동하는지 이해하고 <em>어떻게</em> 더 개선할 수 있는지 고민하세요.</p>
</blockquote>

<hr />

<h3>3단계: 시니어 개발자 (5년 이상) - 리더십 발휘</h3>

<p>시니어 개발자는 단순히 코드를 잘 작성하는 것을 넘어, <strong>팀과 프로젝트를 이끄는 역할</strong>을 수행합니다.</p>

<h4>핵심 역량</h4>
<ul>
  <li><strong>시스템 아키텍처 설계</strong>
    <ul>
      <li>확장 가능한 구조 설계</li>
      <li>마이크로 프론트엔드 아키텍처</li>
      <li>모노레포 관리 (Nx, Turborepo)</li>
    </ul>
  </li>
  <li><strong>기술 리더십</strong>
    <ul>
      <li>코드 리뷰 및 멘토링</li>
      <li>기술 스택 의사결정</li>
      <li>베스트 프랙티스 정립</li>
    </ul>
  </li>
  <li><strong>성능 & 보안</strong>
    <ul>
      <li>Core Web Vitals 최적화</li>
      <li>XSS, CSRF 방어</li>
      <li>접근성 (WCAG 2.1) 준수</li>
    </ul>
  </li>
</ul>

<h4>최신 트렌드 & 미래 기술</h4>
<ol>
  <li><strong>서버 컴포넌트</strong> - Next.js 13+, React Server Components</li>
  <li><strong>엣지 컴퓨팅</strong> - Vercel Edge, Cloudflare Workers</li>
  <li><strong>AI 통합</strong> - ChatGPT API, GitHub Copilot 활용</li>
  <li><strong>Web3 & 블록체인</strong> - dApp 개발, Ethers.js</li>
</ol>

<hr />

<h2>🚀 추가 학습 경로</h2>

<h3>풀스택으로 확장하기</h3>

<p>프론트엔드 역량을 넘어 <strong>풀스택 개발자</strong>로 성장하고 싶다면 다음 기술들을 학습하세요:</p>

<ul>
  <li><strong>백엔드 프레임워크</strong>
    <ul>
      <li>Node.js + Express</li>
      <li>Next.js API Routes</li>
      <li>NestJS (TypeScript 기반)</li>
    </ul>
  </li>
  <li><strong>데이터베이스</strong>
    <ul>
      <li>PostgreSQL, MySQL (관계형)</li>
      <li>MongoDB (NoSQL)</li>
      <li>Prisma, TypeORM (ORM)</li>
    </ul>
  </li>
  <li><strong>DevOps 기초</strong>
    <ul>
      <li>Docker 컨테이너화</li>
      <li>CI/CD (GitHub Actions, Jenkins)</li>
      <li>클라우드 배포 (AWS, Vercel, Netlify)</li>
    </ul>
  </li>
</ul>

<h3>연봉 성장 가이드</h3>

<table>
  <thead>
    <tr>
      <th>경력</th>
      <th>평균 연봉 (대한민국)</th>
      <th>핵심 역량</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>주니어 (0-2년)</td>
      <td>3,500만원 - 4,500만원</td>
      <td>기본기, 코드 작성</td>
    </tr>
    <tr>
      <td>미들 (2-5년)</td>
      <td>5,000만원 - 7,000만원</td>
      <td>문제 해결, 최적화</td>
    </tr>
    <tr>
      <td>시니어 (5년+)</td>
      <td>7,500만원 - 1억원+</td>
      <td>아키텍처, 리더십</td>
    </tr>
  </tbody>
</table>

<blockquote>
  <p><strong>🎓 최종 조언:</strong> 개발자로서의 성장은 <em>선형적이지 않습니다</em>. 때로는 정체기도 있고, 때로는 급성장하기도 합니다. 중요한 것은 <strong>꾸준히 배우고, 만들고, 공유하는 것</strong>입니다. 여러분의 여정을 응원합니다!</p>
</blockquote>

<hr />

<p><small>마지막 업데이트: 2024년 1월 | 작성자: Careerly AI</small></p>
`;

const MOCK_SOURCES: CitationSource[] = [
  {
    id: '1',
    title: 'Frontend Developer Roadmap 2024 - roadmap.sh',
    faviconUrl: 'https://roadmap.sh/favicon.ico',
    href: 'https://roadmap.sh/frontend',
  },
  {
    id: '2',
    title: 'MDN Web Docs - JavaScript Guide',
    faviconUrl: 'https://developer.mozilla.org/favicon.ico',
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  },
  {
    id: '3',
    title: 'React Official Documentation',
    faviconUrl: 'https://react.dev/favicon.ico',
    href: 'https://react.dev',
  },
  {
    id: '4',
    title: 'State of JS 2023 - Developer Survey',
    faviconUrl: 'https://stateofjs.com/favicon.ico',
    href: 'https://stateofjs.com',
  },
  {
    id: '5',
    title: 'Web.dev - Performance Best Practices',
    faviconUrl: 'https://web.dev/favicon.ico',
    href: 'https://web.dev/learn-core-web-vitals',
  },
  {
    id: '6',
    title: 'TypeScript Handbook',
    faviconUrl: 'https://www.typescriptlang.org/favicon.ico',
    href: 'https://www.typescriptlang.org/docs/handbook/intro.html',
  },
];

const MOCK_SEARCH_RESULTS = [
  {
    id: 'r1',
    title: 'The Complete Frontend Developer Career Roadmap 2024',
    snippet: '초보자부터 시니어까지 단계별 학습 경로와 필수 기술 스택을 상세하게 안내합니다. HTML, CSS, JavaScript 기초부터 React, TypeScript, 성능 최적화까지 완벽 가이드.',
    href: 'https://roadmap.sh/frontend',
    faviconUrl: 'https://roadmap.sh/favicon.ico',
  },
  {
    id: 'r2',
    title: 'Frontend Developer Salary Guide - Korea Tech Industry',
    snippet: '2024년 한국 IT 업계 프론트엔드 개발자 연봉 가이드. 경력별, 기술 스택별 평균 연봉과 연봉 협상 팁, 주요 채용 기업 정보를 제공합니다.',
    href: 'https://www.jobplanet.co.kr/contents/salary',
  },
  {
    id: 'r3',
    title: 'React vs Vue vs Angular: 2024년 어떤 프레임워크를 선택해야 할까?',
    snippet: '주요 프론트엔드 프레임워크 비교 분석. 각 프레임워크의 장단점, 학습 곡선, 채용 시장 수요, 커뮤니티 규모를 데이터 기반으로 분석합니다.',
    href: 'https://stateofjs.com/en-US/libraries/front-end-frameworks',
    faviconUrl: 'https://stateofjs.com/favicon.ico',
  },
  {
    id: 'r4',
    title: 'MDN Web Docs - JavaScript Complete Guide',
    snippet: 'Mozilla에서 제공하는 JavaScript 공식 문서. 기초부터 고급까지, ES6+ 최신 문법과 Web API를 포괄적으로 다룹니다.',
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    faviconUrl: 'https://developer.mozilla.org/favicon.ico',
  },
  {
    id: 'r5',
    title: '프론트엔드 포트폴리오 작성 가이드 - 합격하는 포트폴리오 만들기',
    snippet: '채용 담당자가 주목하는 포트폴리오 작성법. 프로젝트 선정, 코드 구조, README 작성, 배포 전략까지 실전 노하우를 공유합니다.',
    href: 'https://github.com/topics/portfolio',
  },
];

const MOCK_RELATED_QUERIES: RelatedQuery[] = [
  {
    id: 'rq1',
    queryText: '프론트엔드 개발자 경력별 평균 연봉과 연봉 협상 전략은?',
    href: '/search?q=프론트엔드+개발자+연봉+협상',
  },
  {
    id: 'rq2',
    queryText: 'React vs Vue.js 2024년 기준 어떤 프레임워크를 선택해야 할까요?',
    href: '/search?q=React+vs+Vue+2024',
  },
  {
    id: 'rq3',
    queryText: '채용 담당자가 주목하는 프론트엔드 포트폴리오 작성법',
    href: '/search?q=프론트엔드+포트폴리오+작성법',
  },
  {
    id: 'rq4',
    queryText: '프론트엔드 기술 면접 단골 질문 TOP 20과 모범 답변',
    href: '/search?q=프론트엔드+면접+질문+답변',
  },
  {
    id: 'rq5',
    queryText: 'TypeScript를 반드시 배워야 하는 이유와 학습 로드맵',
    href: '/search?q=TypeScript+학습+로드맵',
  },
  {
    id: 'rq6',
    queryText: '주니어 개발자가 피해야 할 실수와 성장 전략',
    href: '/search?q=주니어+개발자+성장+전략',
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('answer');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [followUpValue, setFollowUpValue] = useState('');
  // API 버전 선택 상태 (화면 표시용)
  const [apiVersion, setApiVersion] = useState<ApiVersion>('v1');
  // 전체 비교 모드 토글
  const [compareMode, setCompareMode] = useState(false);
  // 3개 버전 결과 저장
  const [allVersionsData, setAllVersionsData] = useState<{
    v1: ChatSearchResult | null;
    v3: ChatSearchResult | null;
    v4: ChatSearchResult | null;
  }>({
    v1: null,
    v3: null,
    v4: null,
  });

  // 3개 버전 동시 호출 Mutation
  const chatMutation = useChatSearchAllVersions({
    onSuccess: (data) => {
      // 3개 버전 모두 저장
      setAllVersionsData({
        v1: data.v1Result,
        v3: data.v3Result,
        v4: data.v4Result,
      });
    },
    onError: (error) => {
      console.error('Chat API Error:', error);
    },
  });

  // 쿼리가 변경되면 3개 버전 동시 호출
  useEffect(() => {
    if (!query || query.trim().length === 0) return;

    chatMutation.mutate({
      query: query.trim(),
      userId: 'anonymous', // 실제로는 로그인 사용자 ID 사용
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleEdit = () => {
    console.log('Edit query');
  };

  const handleShare = () => {
    console.log('Share thread');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleExport = () => {
    console.log('Export thread');
  };

  const handleRewrite = () => {
    console.log('Rewrite answer');
    // 재작성 요청 (3개 버전 모두 다시 호출)
    if (query) {
      chatMutation.mutate({
        query: query.trim(),
        userId: 'anonymous',
      });
    }
  };

  const handleRetry = () => {
    // 재시도 (3개 버전 모두 다시 호출)
    if (query) {
      chatMutation.mutate({
        query: query.trim(),
        userId: 'anonymous',
      });
    }
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  // API 버전 변경 핸들러 (화면 표시용)
  const handleApiVersionChange = (version: ApiVersion) => {
    setApiVersion(version);
  };

  // 전체 비교 모드 토글 핸들러
  const handleCompareModeToggle = () => {
    setCompareMode(!compareMode);
  };

  const handleFollowUpSubmit = () => {
    if (!followUpValue.trim()) return;

    // 후속 질문으로 새로운 검색 수행 (선택된 버전의 session_id 전달)
    const currentData = allVersionsData[apiVersion];
    chatMutation.mutate({
      query: followUpValue.trim(),
      userId: 'anonymous',
      sessionId: currentData?.session_id,
    });

    setFollowUpValue('');
  };

  const handleRelatedQueryClick = (relatedQuery: RelatedQuery) => {
    // queryText에서 실제 검색어 추출하거나 href에서 쿼리 파라미터 추출
    const queryText = relatedQuery.queryText;

    // 새로운 검색 페이지로 라우팅
    router.push(`/search?q=${encodeURIComponent(queryText)}`);
  };

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">검색어를 입력해주세요.</p>
      </div>
    );
  }

  const isLoading = chatMutation.isPending;
  const hasError = chatMutation.isError;

  // 현재 선택된 버전의 데이터 (단일 모드용)
  const currentVersionData = allVersionsData[apiVersion];

  // Citations 변환 (단일 모드용)
  const citationSources: CitationSource[] = currentVersionData?.citations.map((citation) => ({
    id: citation.id,
    title: citation.title,
    href: citation.url,
    faviconUrl: undefined,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* 1. SearchQueryHeader */}
        <SearchQueryHeader
          queryText={query}
          onEdit={handleEdit}
          className="mb-3 border-b-0"
        />

        {/* 통합 컨트롤 바 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
          {/* 좌측: API 버전 토글 + 전체 비교 토글 */}
          <div className="flex items-center gap-3">
            <ApiVersionToggle
              version={apiVersion}
              onChange={handleApiVersionChange}
            />

            {/* 전체 비교 토글 - ViewModeToggle 스타일 적용 */}
            <div className="inline-flex items-center bg-slate-100 rounded-lg p-1">
              <button
                type="button"
                onClick={handleCompareModeToggle}
                className={cn(
                  'flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  compareMode
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
                aria-pressed={compareMode}
                aria-label="전체 비교 모드"
              >
                전체비교
              </button>
            </div>
          </div>

          {/* 우측: ViewModeToggle + ThreadActionBar */}
          <div className="flex items-center gap-3">
            <ViewModeToggle
              mode={viewMode}
              onChange={setViewMode}
            />
            <ThreadActionBar
              onShare={handleShare}
              onBookmark={handleBookmark}
              onExport={handleExport}
              onRewrite={handleRewrite}
              isBookmarked={isBookmarked}
            />
          </div>
        </div>

        {/* 비교 모드: 3컬럼 그리드, 단일 모드: 1열 레이아웃 */}
        <div className={compareMode ? 'grid grid-cols-3 gap-6' : 'space-y-6'}>
          {compareMode ? (
            // 비교 모드: 3개 버전 나란히 표시
            <>
              {(['v1', 'v3', 'v4'] as ApiVersion[]).map((version) => {
                const data = allVersionsData[version];
                const citations = data?.citations.map((c) => ({
                  id: c.id,
                  title: c.title,
                  href: c.url,
                  faviconUrl: undefined,
                })) || [];

                return (
                  <div
                    key={version}
                    className="border border-slate-200 rounded-lg p-4 bg-white"
                  >
                    {/* 버전 헤더 */}
                    <div className="mb-4 pb-4 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {version === 'v1' ? '기본 (v1)' : version === 'v3' ? '차세대 (v3)' : '테스트 (v4)'}
                      </h3>
                    </div>

                    {/* 답변 패널 */}
                    {isLoading && !data ? (
                      <div className="py-8 text-center text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        <p className="text-xs">조회 중...</p>
                      </div>
                    ) : data ? (
                      <>
                        <AnswerResponsePanel
                          answerHtml={data.answer}
                          loading={false}
                          error={undefined}
                          onRetry={handleRetry}
                          className="border-0 shadow-none bg-transparent p-0 mb-4"
                        />

                        {/* 인용 출처 */}
                        {citations.length > 0 && (
                          <div className="text-xs text-slate-600">
                            <span className="font-medium">출처: {citations.length}개</span>
                            <ul className="mt-2 space-y-1">
                              {citations.slice(0, 3).map((c) => (
                                <li key={c.id} className="truncate">
                                  <a
                                    href={c.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-teal-500 hover:underline"
                                  >
                                    {c.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        <p className="text-xs">데이터를 불러올 수 없습니다</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            // 단일 모드: 기존 레이아웃
            <>
              {viewMode === 'answer' && (
                <>
                  {/* 3. AnswerResponsePanel */}
                  <AnswerResponsePanel
                    answerHtml={currentVersionData?.answer || ''}
                    loading={isLoading}
                    error={hasError ? '답변을 가져오는 중 오류가 발생했습니다.' : undefined}
                    onRetry={handleRetry}
                    className="border-0 shadow-none bg-transparent p-0"
                  />

                  {/* 4. CitationSourceList */}
                  {!isLoading && currentVersionData && citationSources.length > 0 && (
                    <div className="py-4 border-t border-slate-200">
                      <CitationSourceList sources={citationSources} />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Sources 모드 (비교 모드에서는 표시 안함) */}
          {viewMode === 'sources' && !compareMode && !isLoading && currentVersionData && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Search Results
              </h2>
              {citationSources.map((source) => (
                <SearchResultItem
                  key={source.id}
                  title={source.title}
                  snippet=""
                  href={source.href}
                  faviconUrl={source.faviconUrl}
                />
              ))}
            </div>
          )}

          {/* 6. RelatedQueriesSection (비교 모드에서는 표시 안함) */}
          {!compareMode && !isLoading && currentVersionData && (
            <div className="py-6 border-t border-slate-200">
              <RelatedQueriesSection
                relatedQueries={MOCK_RELATED_QUERIES}
                onQueryClick={handleRelatedQueryClick}
              />
            </div>
          )}

          {/* 7. SuggestedFollowUpInput (비교 모드에서는 표시 안함) */}
          {!compareMode && !isLoading && currentVersionData && (
            <div className="py-6 border-t border-slate-200">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  Ask a follow-up question
                </h3>
                {/* 8. ModelSelectControl - 미니멀 버전 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Model:</span>
                  <select
                    value={selectedModel}
                    onChange={(e) => handleModelSelect(e.target.value)}
                    className="text-xs text-slate-700 bg-transparent border-none outline-none cursor-pointer hover:text-slate-900 font-medium"
                  >
                    {MOCK_MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <SuggestedFollowUpInput
                value={followUpValue}
                onChange={(value) => setFollowUpValue(value)}
                onSubmit={handleFollowUpSubmit}
                placeholder="더 궁금한 점이 있으신가요?"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-500" />
          <p className="text-slate-500">검색 중...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
