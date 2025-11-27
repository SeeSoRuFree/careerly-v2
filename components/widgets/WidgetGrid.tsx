'use client';

import { useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Plus } from 'lucide-react';
import { WidgetRegistry } from './core/WidgetRegistry';
import { WidgetConfig, WidgetSize } from './core/types';

interface WidgetGridProps {
  initialWidgets?: WidgetConfig[];
  onWidgetsChange?: (widgets: WidgetConfig[]) => void;
  editable?: boolean;
}

const STORAGE_KEY = 'careerly-widgets';

function loadWidgets(): WidgetConfig[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveWidgets(widgets: WidgetConfig[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

export function WidgetGrid({
  initialWidgets,
  onWidgetsChange,
  editable = true,
}: WidgetGridProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Load widgets on mount
  useEffect(() => {
    const saved = loadWidgets();
    if (saved.length > 0) {
      setWidgets(saved);
    } else if (initialWidgets) {
      setWidgets(initialWidgets);
    } else {
      // Default widgets
      const defaults = createDefaultWidgets();
      setWidgets(defaults);
      saveWidgets(defaults);
    }
  }, [initialWidgets]);

  // Save on change
  useEffect(() => {
    if (widgets.length > 0) {
      saveWidgets(widgets);
      onWidgetsChange?.(widgets);
    }
  }, [widgets, onWidgetsChange]);

  const handleRemove = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleRefresh = useCallback((id: string) => {
    // Trigger refetch via key change
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, _refreshKey: Date.now() } : w))
    );
  }, []);

  const handleAdd = useCallback((type: string) => {
    const definition = WidgetRegistry.get(type);
    if (!definition) return;

    const newWidget: WidgetConfig = {
      id: nanoid(),
      type,
      title: definition.metadata.name,
      size: definition.metadata.defaultSize,
      order: widgets.length,
      enabled: true,
      config: definition.defaultConfig,
    };

    setWidgets((prev) => [...prev, newWidget]);
    setShowAddMenu(false);
  }, [widgets.length]);

  const availableWidgets = WidgetRegistry.getMetadataList();

  return (
    <div className="space-y-4">
      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
        {widgets
          .filter((w) => w.enabled)
          .sort((a, b) => a.order - b.order)
          .map((widgetConfig) => {
            const definition = WidgetRegistry.get(widgetConfig.type);
            if (!definition) return null;

            const WidgetComponent = definition.component;
            return (
              <WidgetComponent
                key={widgetConfig.id}
                config={widgetConfig}
                onRemove={editable ? handleRemove : undefined}
                onRefresh={handleRefresh}
              />
            );
          })}

        {/* Add Widget Button */}
        {editable && (
          <div className="relative col-span-1">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Plus className="w-8 h-8" />
              <span className="text-sm">위젯 추가</span>
            </button>

            {/* Add Menu */}
            {showAddMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="p-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 font-medium">
                    사용 가능한 위젯
                  </p>
                  {availableWidgets.map((metadata) => (
                    <button
                      key={metadata.type}
                      onClick={() => handleAdd(metadata.type)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{metadata.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {metadata.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {metadata.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function createDefaultWidgets(): WidgetConfig[] {
  const defaults: WidgetConfig[] = [];
  let order = 0;

  const widgetTypes = ['weather', 'stock', 'job'];

  for (const type of widgetTypes) {
    const definition = WidgetRegistry.get(type);
    if (definition) {
      defaults.push({
        id: nanoid(),
        type,
        title: definition.metadata.name,
        size: definition.metadata.defaultSize,
        order: order++,
        enabled: true,
        config: definition.defaultConfig,
      });
    }
  }

  return defaults;
}
