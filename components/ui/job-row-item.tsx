import * as React from 'react';

export type AICategory = 'ai-core' | 'ai-enabled' | 'traditional';

export interface JobRowItemProps {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  url?: string;
  aiCategory?: AICategory;
  onClick?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  return `${Math.floor(diffDays / 30)}개월 전`;
}

// AI 카테고리 라벨 설정
const aiCategoryConfig: Record<AICategory, { label: string; icon: string; className: string }> = {
  'ai-core': {
    label: 'AI 직무',
    icon: '🤖',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  'ai-enabled': {
    label: 'AI 활용',
    icon: '🔧',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  'traditional': {
    label: '',
    icon: '',
    className: '',
  },
};

export const JobRowItem = React.memo(function JobRowItem({
  title,
  summary,
  createdAt,
  aiCategory,
  onClick,
}: JobRowItemProps) {
  const aiConfig = aiCategory ? aiCategoryConfig[aiCategory] : null;
  const showAiLabel = aiConfig && aiCategory !== 'traditional';

  return (
    <div
      onClick={onClick}
      className="group flex flex-col sm:flex-row sm:items-start gap-3 py-4 px-5 hover:bg-slate-50/50 transition-colors cursor-pointer"
    >
      {/* Left: Title + Summary */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
            {title}
          </h4>
          {showAiLabel && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${aiConfig.className}`}>
              <span>{aiConfig.icon}</span>
              <span>{aiConfig.label}</span>
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 line-clamp-2 mt-1">
          {summary}
        </p>
      </div>

      {/* Right: Date only */}
      <div className="flex items-center sm:flex-shrink-0">
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {formatDate(createdAt)}
        </span>
      </div>
    </div>
  );
});
