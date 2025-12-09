import * as React from 'react';
import { JobRowItem, JobRowItemProps } from './job-row-item';

export interface CompanyJobGroupProps {
  companyName: string;
  logoUrl?: string;
  jobs: JobRowItemProps[];
  onJobClick?: (job: JobRowItemProps) => void;
}

export function CompanyJobGroup({
  companyName,
  logoUrl,
  jobs,
  onJobClick,
}: CompanyJobGroupProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Company Header */}
      <div className="flex items-center gap-4 p-5 border-b border-slate-100 bg-slate-50/30">
        <div className="w-12 h-12 rounded-lg border border-slate-100 overflow-hidden bg-white p-1">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-lg">
              {companyName.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-serif font-bold text-slate-900">{companyName}</h3>
          <p className="text-sm text-slate-500">{jobs.length}개 채용 중</p>
        </div>
      </div>

      {/* Jobs List - Row Based */}
      <div className="divide-y divide-slate-100">
        {jobs.map((job) => (
          <JobRowItem
            key={job.id}
            {...job}
            onClick={() => onJobClick?.(job)}
          />
        ))}
      </div>
    </div>
  );
}
