'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageCircleQuestion, Eye, User, ChevronDown, ChevronUp } from 'lucide-react';

export interface QuestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  question: string;
  viewCount?: number;
}

// 프롬프트에서 질문과 프로필 분리
function parsePrompt(text: string): { question: string; profile: string | null } {
  const separator = '\n---\n';
  const separatorIndex = text.indexOf(separator);

  if (separatorIndex === -1) {
    return { question: text, profile: null };
  }

  const question = text.substring(0, separatorIndex).trim();
  const profileSection = text.substring(separatorIndex + separator.length).trim();
  const profile = profileSection.replace(/^내정보:\s*/i, '').trim();

  return { question, profile };
}

// 프로필 요약 (한 줄)
function summarizeProfile(profile: string, maxLength: number = 60): string {
  const oneLine = profile.replace(/\n+/g, ' · ').replace(/\s+/g, ' ').trim();
  if (oneLine.length <= maxLength) return oneLine;
  return oneLine.substring(0, maxLength) + '...';
}

const QuestionCard = React.forwardRef<HTMLDivElement, QuestionCardProps>(
  ({ question: rawQuestion, viewCount, className, ...props }, ref) => {
    const [isProfileExpanded, setIsProfileExpanded] = useState(false);
    const { question, profile } = parsePrompt(rawQuestion);
    const hasProfile = !!profile;

    // 일반 질문 (프로필 없음)
    if (!hasProfile) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-6 shadow-sm',
            className
          )}
          {...props}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
              <MessageCircleQuestion className="h-4 w-4 text-teal-600" />
              <span className="text-xs font-medium text-teal-700">질문</span>
            </div>
            {viewCount !== undefined && (
              <div className="flex items-center gap-1.5 text-slate-500">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">{viewCount.toLocaleString()}</span>
              </div>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-relaxed">
            {rawQuestion}
          </h2>
          <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-gradient-to-br from-teal-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        </div>
      );
    }

    // 개인화 질문 - 단순하게 프로필 텍스트 표시
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-xl bg-white border border-slate-200 p-6 shadow-sm',
          className
        )}
        {...props}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
            <MessageCircleQuestion className="h-4 w-4 text-teal-600" />
            <span className="text-xs font-medium text-teal-700">질문</span>
          </div>
          {viewCount !== undefined && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">{viewCount.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* 질문 */}
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-relaxed mb-4">
          {question}
        </h2>

        {/* 프로필 섹션 - 단순 텍스트 */}
        <div className="border-t border-slate-200 pt-4">
          {isProfileExpanded ? (
            // 펼쳐진 상태 - 프로필 텍스트 그대로 표시
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                <User className="h-3.5 w-3.5" />
                <span>내 프로필 정보</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {profile}
              </p>
              <button
                onClick={() => setIsProfileExpanded(false)}
                className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                접기
                <ChevronUp className="h-3 w-3" />
              </button>
            </div>
          ) : (
            // 접힌 상태 - 요약만 표시
            <button
              onClick={() => setIsProfileExpanded(true)}
              className="w-full text-left group"
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                <User className="h-3.5 w-3.5" />
                <span className="flex-1 truncate">
                  {summarizeProfile(profile)}
                </span>
                <span className="flex items-center gap-0.5 flex-shrink-0">
                  더 보기
                  <ChevronDown className="h-3 w-3" />
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }
);

QuestionCard.displayName = 'QuestionCard';

export { QuestionCard };
