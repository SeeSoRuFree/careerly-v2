/**
 * 위젯 레지스트리 - 모든 위젯을 등록하고 관리
 */

import { WidgetDefinition } from './types';

class WidgetRegistryClass {
  private widgets: Map<string, WidgetDefinition> = new Map();

  /**
   * 위젯 등록
   */
  register<T = any, C = any>(definition: WidgetDefinition<T, C>): void {
    const { type } = definition.metadata;

    if (this.widgets.has(type)) {
      console.warn(`Widget type "${type}" is already registered. Overwriting.`);
    }

    this.widgets.set(type, definition);
  }

  /**
   * 여러 위젯을 한 번에 등록
   */
  registerMany(definitions: WidgetDefinition[]): void {
    definitions.forEach((definition) => this.register(definition));
  }

  /**
   * 위젯 가져오기
   */
  get(type: string): WidgetDefinition | undefined {
    return this.widgets.get(type);
  }

  /**
   * 모든 위젯 가져오기
   */
  getAll(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }

  /**
   * 카테고리별 위젯 가져오기
   */
  getByCategory(category: string): WidgetDefinition[] {
    return this.getAll().filter((widget) => widget.metadata.category === category);
  }

  /**
   * 위젯 존재 여부 확인
   */
  has(type: string): boolean {
    return this.widgets.has(type);
  }

  /**
   * 위젯 제거
   */
  unregister(type: string): boolean {
    return this.widgets.delete(type);
  }

  /**
   * 모든 위젯 제거
   */
  clear(): void {
    this.widgets.clear();
  }

  /**
   * 등록된 위젯 수
   */
  get size(): number {
    return this.widgets.size;
  }

  /**
   * 위젯 타입 목록
   */
  getTypes(): string[] {
    return Array.from(this.widgets.keys());
  }

  /**
   * 위젯 메타데이터 목록
   */
  getMetadataList() {
    return this.getAll().map((widget) => widget.metadata);
  }
}

// 싱글톤 인스턴스
export const WidgetRegistry = new WidgetRegistryClass();
