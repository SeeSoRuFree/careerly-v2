'use client';

import { cn } from '@/lib/utils';

export type BlogAICategory = 'ai-dev' | 'ai-design' | 'ai-biz' | 'ai-general' | 'other';

export interface BlogCardData {
  id: string;
  title: string;
  summary: string;
  companyName: string;
  companyLogo?: string;
  blogMetaImage?: string;
  publishedAt?: string;
  aiCategory?: BlogAICategory;
  views: number;
  likes: number;
  url?: string;
}

export interface BlogCardProps {
  blog: BlogCardData;
  dateLabel?: string;
  onClick?: () => void;
}

const categoryConfig: Record<
  BlogAICategory,
  { label: string; icon: string; bgClass: string; textClass: string; borderClass: string }
> = {
  'ai-dev': {
    label: 'AI & Dev',
    icon: '🤖',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-600',
    borderClass: 'border-purple-200',
  },
  'ai-design': {
    label: 'AI & Design',
    icon: '🎨',
    bgClass: 'bg-pink-50',
    textClass: 'text-pink-600',
    borderClass: 'border-pink-200',
  },
  'ai-biz': {
    label: 'AI & Biz',
    icon: '💼',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-600',
    borderClass: 'border-amber-200',
  },
  'ai-general': {
    label: 'AI 일반',
    icon: '✨',
    bgClass: 'bg-teal-50',
    textClass: 'text-teal-600',
    borderClass: 'border-teal-200',
  },
  other: {
    label: '기타',
    icon: '📝',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-600',
    borderClass: 'border-slate-200',
  },
};

export function BlogCard({ blog, dateLabel, onClick }: BlogCardProps) {
  const aiCategory = blog.aiCategory || 'other';
  const catConfig = categoryConfig[aiCategory];
  const hasMetaImage =
    blog.blogMetaImage &&
    !blog.blogMetaImage.includes('favicon') &&
    !blog.blogMetaImage.includes('logo');

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex gap-4 p-4">
        {hasMetaImage && (
          <div className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
            <img src={blog.blogMetaImage} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {blog.companyLogo ? (
                <img
                  src={blog.companyLogo}
                  alt={blog.companyName}
                  className="w-full h-full object-contain p-0.5"
                />
              ) : (
                <span className="text-[10px] font-bold text-slate-400">
                  {blog.companyName.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-slate-700 truncate">{blog.companyName}</span>
            {dateLabel && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400">{dateLabel}</span>
              </>
            )}
          </div>

          <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 mb-1.5">
            {blog.title}
          </h3>

          <p className="text-sm text-slate-500 line-clamp-2 mb-2 flex-1">{blog.summary}</p>

          <div className="flex items-center justify-end">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border',
                catConfig.bgClass,
                catConfig.textClass,
                catConfig.borderClass
              )}
            >
              {catConfig.icon} {catConfig.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { categoryConfig as blogCategoryConfig };
