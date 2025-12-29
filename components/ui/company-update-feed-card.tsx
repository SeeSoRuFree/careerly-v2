'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import { Bot } from 'lucide-react';

export interface CompanyContentItem {
  title: string;
  url: string;
  contentSummary: string;  // 실제 블로그/채용공고 내용 요약
  aiAnalysis: string;      // 내 프로필 기반 개인화 분석
  publishedAt: string;     // 발행일
}

export interface CompanyInfo {
  name: string;
  logoUrl: string;
  siteUrl: string;
  brandColor: string;
}

export interface CompanyUpdateFeedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'blog' | 'jobs';
  company: CompanyInfo;
  item: CompanyContentItem;
  onCardClick?: () => void;
}

// 목업 데이터 - 단일 콘텐츠
export const MOCK_COMPANY_CONTENTS = {
  blog: {
    company: {
      name: '토스',
      logoUrl: '',
      siteUrl: 'https://toss.tech',
      brandColor: '#0064FF',
    },
    item: {
      title: 'Server-Driven UI로 토스앱 효율 200% 높인 비결',
      url: 'https://toss.tech/article/server-driven-ui',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
      contentSummary: `토스팀은 앱 스토어 심사 없이 UI를 실시간으로 변경할 수 있는 Server-Driven UI(SDUI) 아키텍처를 도입했습니다. 기존에는 UI 변경을 위해 앱 배포 → 스토어 심사 → 사용자 업데이트라는 긴 사이클을 거쳐야 했지만, SDUI를 통해 서버에서 JSON 형태로 UI 스펙을 내려주고 클라이언트가 이를 렌더링하는 방식으로 전환했습니다.

핵심 구현 방식은 다음과 같습니다. 서버에서 컴포넌트 타입, 속성, 레이아웃 정보를 담은 JSON Schema를 정의하고, 클라이언트는 이 스키마를 파싱해 동적으로 UI를 구성합니다. 이벤트 배너, 프로모션 영역, A/B 테스트가 필요한 화면부터 점진적으로 적용해 리스크를 최소화했습니다.

도입 결과, 배포 주기가 2주에서 실시간으로 단축되었고, A/B 테스트 실행 속도가 200% 향상되었습니다. 다만 초기 구축 비용과 디버깅 복잡도 증가라는 트레이드오프가 있어, 변경이 잦은 영역에 선택적으로 적용하는 것을 권장합니다.`,
      aiAnalysis: `안녕하세요! 이 글은 당신의 프론트엔드 개발 관심사와 깊이 연결되어 있어서 추천드려요.

**당신에게 의미 있는 이유**

1. **빠른 이터레이션**: 프론트엔드 개발자로서 "배포 → 심사 → 출시"의 긴 사이클에 답답함을 느꼈다면, SDUI는 좋은 해결책이 될 수 있어요.

2. **React/Next.js 경험 활용**: 글에서 소개하는 JSON 기반 UI 렌더링 방식은 React의 선언적 UI 패턴과 잘 맞아요. 기존 경험을 활용하기 좋습니다.

3. **커리어 차별화**: SDUI는 아직 국내에서 도입 사례가 많지 않아요. 이 기술을 이해하고 있다면 면접에서 차별화된 이야기를 할 수 있어요.

**실무 적용 팁**

바로 전체 앱에 적용하기보다는, 자주 변경되는 이벤트 배너나 프로모션 영역부터 시작해보세요. 점진적으로 확장하는 게 리스크를 줄이는 방법이에요.`,
    },
  },
  jobs: {
    company: {
      name: '카카오',
      logoUrl: '',
      siteUrl: 'https://careers.kakao.com',
      brandColor: '#FEE500',
    },
    item: {
      title: 'Frontend Engineer (React/Next.js) - 카카오페이',
      url: 'https://careers.kakao.com/jobs/P-12345',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5시간 전
      contentSummary: `카카오페이 프론트엔드팀에서 결제 서비스의 UI/UX를 담당할 엔지니어를 채용합니다. 월 거래액 10조원 이상의 대규모 결제 플랫폼에서 안정적이고 직관적인 사용자 경험을 설계하고 구현하는 역할입니다.

주요 업무로는 결제 플로우 UI 개발, 실시간 거래 현황 대시보드 구축, 모바일 웹뷰 최적화, 접근성(a11y) 개선 등이 있습니다. React 18+와 TypeScript를 기반으로 하며, Next.js App Router 환경에서 개발합니다.

자격 요건은 프론트엔드 개발 경력 3년 이상, React/TypeScript 실무 경험, 대규모 트래픽 서비스 경험입니다. 우대사항으로는 금융/결제 도메인 경험, 성능 최적화 경험, 테스트 자동화 경험이 있습니다.

복리후생으로는 유연근무제, 자기개발비 연 200만원, 건강검진, 경조사 지원 등이 제공됩니다. 연봉은 경력에 따라 협의하며, 스톡옵션과 성과급이 별도로 있습니다.`,
      aiAnalysis: `이 채용 공고를 당신의 경력과 비교해서 분석해봤어요.

**당신과의 적합도: 85%**

✅ **강점 매칭**
- React/TypeScript 경험 3년 이상 → 당신의 프론트엔드 경력과 정확히 매칭
- Next.js 활용 경험 → 현재 프로젝트에서 사용 중
- 대규모 서비스 경험 → 이전 회사에서의 트래픽 처리 경험

⚠️ **보완하면 좋을 점**
- 금융/결제 도메인 경험 → 직접 경험은 없지만, 보안과 안정성에 대한 이해를 어필할 수 있어요
- 모바일 웹뷰 최적화 → 면접 전에 관련 내용을 공부해두면 좋을 것 같아요

**지원 전략**

이력서에 "안정성"과 "사용자 경험" 키워드를 강조하세요. 결제 서비스는 에러가 곧 매출 손실이기 때문에, 에러 핸들링과 모니터링 경험을 구체적으로 적으면 좋아요.`,
    },
  },
};

export const CompanyUpdateFeedCard = React.forwardRef<HTMLDivElement, CompanyUpdateFeedCardProps>(
  (
    {
      type,
      company,
      item,
      onCardClick,
      className,
      ...props
    },
    ref
  ) => {
    const handleCardClick = () => {
      onCardClick?.();
    };


    return (
      <Card
        ref={ref}
        onClick={handleCardClick}
        className={cn(
          'p-6 transition-all duration-200 cursor-pointer',
          'hover:shadow-md hover:border-slate-300',
          className
        )}
        {...props}
      >
        {/* 헤더 - 기업 + AI 프로필 */}
        <div className="flex items-start gap-3 mb-4">
          {/* 기업 로고 + AI 아이콘 */}
          <div className="relative">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: company.brandColor }}
            >
              {company.name.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-coral-500 flex items-center justify-center ring-2 ring-white">
              <Bot className="h-3 w-3 text-white" />
            </div>
          </div>

          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{company.name}</span>
              <span className="text-slate-300">×</span>
              <span className="text-coral-500 font-medium">커리어리 AI</span>
            </div>
            <span className="text-sm text-slate-400">
              {formatRelativeTime(item.publishedAt)} {type === 'blog' ? '새 글이 올라왔어요' : '새 공고가 올라왔어요'}
            </span>
          </div>
        </div>

        {/* 콘텐츠 제목 */}
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug tracking-tight mb-2">
          {item.title}
        </h3>

        {/* 콘텐츠 요약 */}
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-6 mb-3">
          {item.contentSummary}
        </p>

        {/* 개인화 분석 받기 버튼 */}
        <p className="text-sm text-coral-500 font-medium">
          내 프로필 기반으로 분석 받기 →
        </p>
      </Card>
    );
  }
);

CompanyUpdateFeedCard.displayName = 'CompanyUpdateFeedCard';
