'use client';

import { User, Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import type { SSEProfileSummaryEvent } from '@/lib/api/types/chat.types';
import { cn } from '@/lib/utils';

interface ProfileSummaryBannerProps {
  profile: SSEProfileSummaryEvent;
  className?: string;
}

export function ProfileSummaryBanner({ profile, className }: ProfileSummaryBannerProps) {
  const { profile_data, summary_text } = profile;

  return (
    <div
      className={cn(
        'rounded-lg border border-purple-200 bg-purple-50/50 p-4 mb-4',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <User className="h-4 w-4 text-purple-500" />
        <span className="text-sm font-medium text-purple-700">내 프로필 기반 분석</span>
      </div>

      {/* Dimmed 프로필 요약 */}
      <p className="text-sm text-slate-500 leading-relaxed">{summary_text}</p>

      {/* 경력 정보 */}
      {profile_data.careers && profile_data.careers.length > 0 && (
        <div className="mt-3 flex items-start gap-2">
          <Briefcase className="h-3.5 w-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {profile_data.careers.slice(0, 2).map((career, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-white text-purple-600 rounded-full border border-purple-100"
              >
                {career.title} @ {career.company}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 스킬 태그 */}
      {profile_data.skills && profile_data.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile_data.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full"
            >
              {skill}
            </span>
          ))}
          {profile_data.skills.length > 5 && (
            <span className="px-2 py-0.5 text-xs text-purple-400">
              +{profile_data.skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* 학력 정보 */}
      {profile_data.educations && profile_data.educations.length > 0 && (
        <div className="mt-3 flex items-start gap-2">
          <GraduationCap className="h-3.5 w-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {profile_data.educations.slice(0, 2).map((education, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-white text-purple-600 rounded-full border border-purple-100"
              >
                {education.school}
                {education.major && ` · ${education.major}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
