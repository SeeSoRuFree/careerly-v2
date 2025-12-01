/**
 * 위젯 등록 함수
 */

import { WidgetRegistry } from './core/WidgetRegistry';

// 기존 위젯
import { WeatherWidget } from './implementations/WeatherWidget/WeatherWidget';
import { useWeatherData } from './implementations/WeatherWidget/useWeatherData';
import { StockWidget } from './implementations/StockWidget/StockWidget';
import { useStockData } from './implementations/StockWidget/useStockData';
import type { StockWidgetConfig } from './implementations/StockWidget/types';
import { JobWidget } from './implementations/JobWidget/JobWidget';
import { useJobData } from './implementations/JobWidget/useJobData';
import type { JobWidgetConfig } from './implementations/JobWidget/types';

// 새로운 커리어 위젯
import { GeekNewsWidget } from './implementations/GeekNewsWidget/GeekNewsWidget';
import { useGeekNewsData } from './implementations/GeekNewsWidget/useGeekNewsData';
import { TechStackWidget } from './implementations/TechStackWidget/TechStackWidget';
import { useTechStackData } from './implementations/TechStackWidget/useTechStackData';
import { BigTechBlogWidget } from './implementations/BigTechBlogWidget/BigTechBlogWidget';
import { useBigTechBlogData } from './implementations/BigTechBlogWidget/useBigTechBlogData';
import { GitHubTrendingWidget } from './implementations/GitHubTrendingWidget/GitHubTrendingWidget';
import { useGitHubTrendingData } from './implementations/GitHubTrendingWidget/useGitHubTrendingData';
import { ITNewsWidget } from './implementations/ITNewsWidget/ITNewsWidget';
import { useITNewsData } from './implementations/ITNewsWidget/useITNewsData';
import { AITrendWidget } from './implementations/AITrendWidget/AITrendWidget';
import { useAITrendData } from './implementations/AITrendWidget/useAITrendData';

let registered = false;

export function registerAllWidgets() {
  if (registered) return;
  registered = true;

  // ============================================
  // 커리어 관련 위젯 (신규)
  // ============================================

  // GeekNews 트렌드
  WidgetRegistry.register({
    metadata: {
      type: 'geeknews',
      name: 'GeekNews 트렌드',
      description: '한국 개발자 기술 뉴스',
      icon: '🔥',
      defaultSize: 'medium',
      supportedSizes: ['medium', 'large'],
      dataSource: 'rest',
      refreshInterval: 10 * 60 * 1000,
      category: '커리어',
    },
    component: GeekNewsWidget,
    useData: useGeekNewsData,
    defaultConfig: {
      limit: 5,
      category: 'all',
    },
  });

  // 기술 스택 트렌드
  WidgetRegistry.register({
    metadata: {
      type: 'techstack',
      name: '기술 스택 트렌드',
      description: 'npm 다운로드 기반 기술 트렌드',
      icon: '📊',
      defaultSize: 'medium',
      supportedSizes: ['medium', 'large'],
      dataSource: 'rest',
      refreshInterval: 60 * 60 * 1000,
      category: '커리어',
    },
    component: TechStackWidget,
    useData: useTechStackData,
    defaultConfig: {
      category: 'frontend',
      period: 'week',
    },
  });

  // 빅테크 기술 블로그
  WidgetRegistry.register({
    metadata: {
      type: 'bigtech-blog',
      name: '빅테크 기술 블로그',
      description: '카카오, 네이버, 토스 기술 블로그',
      icon: '🏢',
      defaultSize: 'medium',
      supportedSizes: ['medium', 'large'],
      dataSource: 'rest',
      refreshInterval: 60 * 60 * 1000,
      category: '커리어',
    },
    component: BigTechBlogWidget,
    useData: useBigTechBlogData,
    defaultConfig: {
      companies: ['kakao', 'naver', 'toss'],
      limit: 5,
    },
  });

  // GitHub 트렌딩
  WidgetRegistry.register({
    metadata: {
      type: 'github-trending',
      name: 'GitHub 트렌딩',
      description: '오늘의 인기 오픈소스',
      icon: '⭐',
      defaultSize: 'medium',
      supportedSizes: ['medium', 'large'],
      dataSource: 'rest',
      refreshInterval: 60 * 60 * 1000,
      category: '커리어',
    },
    component: GitHubTrendingWidget,
    useData: useGitHubTrendingData,
    defaultConfig: {
      since: 'daily',
      limit: 5,
    },
  });

  // IT 뉴스 헤드라인
  WidgetRegistry.register({
    metadata: {
      type: 'itnews',
      name: 'IT 뉴스',
      description: '블로터, ZDNet, IT조선 헤드라인',
      icon: '📰',
      defaultSize: 'medium',
      supportedSizes: ['medium', 'large'],
      dataSource: 'rest',
      refreshInterval: 30 * 60 * 1000,
      category: '커리어',
    },
    component: ITNewsWidget,
    useData: useITNewsData,
    defaultConfig: {
      sources: ['bloter', 'zdnet', 'itchosun'],
      limit: 5,
    },
  });

  // AI 트렌드 통합
  WidgetRegistry.register({
    metadata: {
      type: 'ai-trend',
      name: 'AI 트렌드',
      description: 'Hugging Face, GitHub, AI 뉴스 통합',
      icon: '🤖',
      defaultSize: 'large',
      supportedSizes: ['medium', 'large'],
      dataSource: 'rest',
      refreshInterval: 15 * 60 * 1000,
      category: '커리어',
    },
    component: AITrendWidget,
    useData: useAITrendData,
    defaultConfig: {
      sources: ['huggingface', 'github', 'news'],
      limit: 5,
      period: 'daily',
      showTabs: true,
    },
  });

  // ============================================
  // 기존 위젯
  // ============================================

  // 날씨 위젯
  WidgetRegistry.register({
    metadata: {
      type: 'weather',
      name: '날씨',
      description: '현재 날씨와 주간 예보',
      icon: '🌤️',
      defaultSize: 'medium',
      supportedSizes: ['small', 'medium', 'large'],
      dataSource: 'rest',
      refreshInterval: 10 * 60 * 1000,
      category: '생활',
    },
    component: WeatherWidget,
    useData: useWeatherData,
    defaultConfig: {
      location: '서울',
      units: 'metric',
    },
  });

  // 주식 위젯
  WidgetRegistry.register({
    metadata: {
      type: 'stock',
      name: '주식/지수',
      description: 'KOSPI, KOSDAQ, 미국 주식',
      icon: '📈',
      defaultSize: 'medium',
      supportedSizes: ['small', 'medium', 'large'],
      dataSource: 'rest',
      refreshInterval: 60 * 1000,
      category: '금융',
    },
    component: StockWidget,
    useData: useStockData,
    defaultConfig: {
      symbols: ['KOSPI', 'KOSDAQ'],
      market: 'KOSPI',
    } as StockWidgetConfig,
  });

  // 채용 위젯
  WidgetRegistry.register({
    metadata: {
      type: 'job',
      name: '추천 채용',
      description: '오늘의 추천 채용공고',
      icon: '💼',
      defaultSize: 'large',
      supportedSizes: ['medium', 'large', 'full'],
      dataSource: 'internal',
      refreshInterval: 5 * 60 * 1000,
      category: '채용',
    },
    component: JobWidget,
    useData: useJobData,
    defaultConfig: {
      limit: 5,
    } as JobWidgetConfig,
  });
}
