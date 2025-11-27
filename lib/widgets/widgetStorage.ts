/**
 * 위젯 설정 로컬 스토리지 관리
 */

import { WidgetConfig } from '@/components/widgets/core/types';

const STORAGE_KEY = 'careerly_widget_configs';

/**
 * 위젯 설정 저장
 */
export function saveWidgetConfigs(configs: WidgetConfig[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch (error) {
    console.error('Failed to save widget configs:', error);
  }
}

/**
 * 위젯 설정 불러오기
 */
export function loadWidgetConfigs(): WidgetConfig[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const configs = JSON.parse(stored) as WidgetConfig[];
    return configs.filter((config) => config.enabled).sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Failed to load widget configs:', error);
    return [];
  }
}

/**
 * 위젯 추가
 */
export function addWidgetConfig(config: WidgetConfig): void {
  const configs = loadWidgetConfigs();
  const maxOrder = configs.reduce((max, c) => Math.max(max, c.order), -1);

  const newConfig: WidgetConfig = {
    ...config,
    order: maxOrder + 1,
    enabled: true,
  };

  saveWidgetConfigs([...configs, newConfig]);
}

/**
 * 위젯 제거
 */
export function removeWidgetConfig(id: string): void {
  const configs = loadWidgetConfigs();
  const filtered = configs.filter((config) => config.id !== id);
  saveWidgetConfigs(filtered);
}

/**
 * 위젯 업데이트
 */
export function updateWidgetConfig(id: string, updates: Partial<WidgetConfig>): void {
  const configs = loadWidgetConfigs();
  const updated = configs.map((config) =>
    config.id === id ? { ...config, ...updates } : config
  );
  saveWidgetConfigs(updated);
}

/**
 * 위젯 순서 변경
 */
export function reorderWidgets(startIndex: number, endIndex: number): void {
  const configs = loadWidgetConfigs();
  const [removed] = configs.splice(startIndex, 1);
  configs.splice(endIndex, 0, removed);

  // 순서 재정렬
  const reordered = configs.map((config, index) => ({
    ...config,
    order: index,
  }));

  saveWidgetConfigs(reordered);
}

/**
 * 위젯 활성화/비활성화 토글
 */
export function toggleWidgetEnabled(id: string): void {
  const configs = loadWidgetConfigs();
  const updated = configs.map((config) =>
    config.id === id ? { ...config, enabled: !config.enabled } : config
  );
  saveWidgetConfigs(updated);
}

/**
 * 모든 위젯 초기화 (기본값으로 리셋)
 */
export function resetWidgetConfigs(defaultConfigs: WidgetConfig[]): void {
  saveWidgetConfigs(defaultConfigs);
}

/**
 * 특정 위젯 찾기
 */
export function findWidgetConfig(id: string): WidgetConfig | undefined {
  const configs = loadWidgetConfigs();
  return configs.find((config) => config.id === id);
}
