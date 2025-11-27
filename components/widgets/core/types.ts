/**
 * 위젯 시스템 코어 타입 정의
 */

import { ReactNode } from 'react';

/**
 * 위젯 크기 옵션
 */
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

/**
 * 위젯 데이터 소스 타입
 */
export type WidgetDataSource = 'rest' | 'graphql' | 'sse' | 'mcp' | 'internal';

/**
 * 위젯 상태
 */
export interface WidgetState {
  isLoading: boolean;
  isError: boolean;
  error?: Error;
}

/**
 * 위젯 설정 (사용자 커스터마이징)
 */
export interface WidgetConfig<T = any> {
  id: string; // 위젯 고유 ID
  type: string; // 위젯 타입 (weather, stock, job 등)
  title: string; // 위젯 제목
  size: WidgetSize; // 위젯 크기
  order: number; // 정렬 순서
  enabled: boolean; // 활성화 여부
  config?: T; // 위젯별 커스텀 설정
}

/**
 * 위젯 메타데이터
 */
export interface WidgetMetadata {
  type: string;
  name: string;
  description: string;
  icon?: ReactNode;
  defaultSize: WidgetSize;
  supportedSizes: WidgetSize[];
  dataSource: WidgetDataSource;
  refreshInterval?: number; // ms 단위
  category?: string; // 카테고리 (날씨, 금융, 채용 등)
}

/**
 * 위젯 데이터 훅 반환 타입
 */
export interface WidgetDataHook<T = any> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 위젯 컴포넌트 Props
 */
export interface WidgetProps<T = any, C = any> {
  config: WidgetConfig<C>;
  onRemove?: (id: string) => void;
  onRefresh?: (id: string) => void;
  onResize?: (id: string, size: WidgetSize) => void;
  onConfigChange?: (id: string, config: C) => void;
}

/**
 * 위젯 정의
 */
export interface WidgetDefinition<T = any, C = any> {
  metadata: WidgetMetadata;
  component: React.ComponentType<WidgetProps<T, C>>;
  useData: (config: C) => WidgetDataHook<T>;
  defaultConfig?: C;
  validateConfig?: (config: C) => boolean;
}

/**
 * 위젯 액션
 */
export interface WidgetAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

/**
 * 위젯 컨테이너 Props
 */
export interface WidgetContainerProps {
  config: WidgetConfig;
  children: ReactNode;
  actions?: WidgetAction[];
  onRemove?: (id: string) => void;
  onRefresh?: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error;
}
