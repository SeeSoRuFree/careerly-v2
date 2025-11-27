'use client';

/**
 * 위젯 컨테이너 - 모든 위젯을 감싸는 공통 래퍼
 */

import { RefreshCw, X, Settings } from 'lucide-react';
import { WidgetContainerProps } from './types';
import { WidgetError } from './WidgetError';
import { WidgetSkeleton } from './WidgetSkeleton';

const sizeClasses = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-2 row-span-1',
  large: 'col-span-2 row-span-2',
  full: 'col-span-full row-span-2',
};

export function WidgetContainer({
  config,
  children,
  actions = [],
  onRemove,
  onRefresh,
  isLoading = false,
  isError = false,
  error,
}: WidgetContainerProps) {
  const sizeClass = sizeClasses[config.size];

  return (
    <div
      className={`
        ${sizeClass}
        bg-white dark:bg-gray-800
        rounded-lg shadow-sm
        border border-gray-200 dark:border-gray-700
        overflow-hidden
        transition-all duration-200
        hover:shadow-md
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {config.title}
        </h3>

        <div className="flex items-center gap-2">
          {/* 커스텀 액션 */}
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title={action.label}
            >
              {action.icon}
            </button>
          ))}

          {/* 새로고침 */}
          {onRefresh && (
            <button
              onClick={() => onRefresh(config.id)}
              disabled={isLoading}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* 제거 */}
          {onRemove && (
            <button
              onClick={() => onRemove(config.id)}
              className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="제거"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 h-[calc(100%-56px)] overflow-auto">
        {isLoading ? (
          <WidgetSkeleton size={config.size} />
        ) : isError ? (
          <WidgetError error={error} onRetry={() => onRefresh?.(config.id)} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
