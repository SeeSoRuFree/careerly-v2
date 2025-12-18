'use client';

import { cn } from '@/lib/utils';

export interface JobItemData {
  id: string;
  title: string;
  summary?: string;
  url?: string;
  companyName: string;
  companyLogo?: string;
  views?: number;
  likes?: number;
  createdAt?: string;
}

export interface JobListItemProps {
  job: JobItemData;
  variant?: 'purple' | 'teal' | 'slate';
  onClick?: () => void;
}

const variantConfig = {
  purple: {
    hoverText: 'group-hover:text-purple-700',
  },
  teal: {
    hoverText: 'group-hover:text-teal-700',
  },
  slate: {
    hoverText: 'group-hover:text-slate-700',
  },
};

export function JobListItem({ job, variant = 'slate', onClick }: JobListItemProps) {
  const config = variantConfig[variant];

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
    >
      <div className="w-8 h-8 rounded-md bg-white border border-slate-200 overflow-hidden flex-shrink-0">
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt={job.companyName}
            className="w-full h-full object-contain p-0.5"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50">
            {job.companyName.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            'font-medium text-slate-900 transition-colors truncate text-sm',
            config.hoverText
          )}
        >
          {job.title}
        </h4>
      </div>
      <span className="text-xs text-slate-500 flex-shrink-0">{job.companyName}</span>
    </div>
  );
}
