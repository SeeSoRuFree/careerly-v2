'use client';

import { useEffect, useState } from 'react';
import { WidgetGrid, registerAllWidgets } from '@/components/widgets';

export default function WidgetsDemoPage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    registerAllWidgets();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">위젯 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            위젯 대시보드
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            모듈화된 위젯 시스템 데모 - 날씨, 주식, 채용정보
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <WidgetGrid editable={true} />
      </main>

      {/* Footer */}
      <footer className="fixed bottom-4 right-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500">
          💡 위젯을 추가/삭제하고 새로고침해도 설정이 유지됩니다
        </div>
      </footer>
    </div>
  );
}
