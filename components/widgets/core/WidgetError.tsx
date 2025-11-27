'use client';

/**
 * 위젯 에러 상태 컴포넌트
 */

import { AlertCircle, RefreshCw } from 'lucide-react';

interface WidgetErrorProps {
  error?: Error;
  onRetry?: () => void;
}

export function WidgetError({ error, onRetry }: WidgetErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        데이터를 불러올 수 없습니다
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        {error?.message || '알 수 없는 오류가 발생했습니다'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          다시 시도
        </button>
      )}
    </div>
  );
}
