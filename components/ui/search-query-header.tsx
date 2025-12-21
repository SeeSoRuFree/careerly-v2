'use client';

import * as React from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchQueryHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  queryText: string;
}

// 접기 기준 (이 값 이상이면 접기 가능)
const COLLAPSE_THRESHOLD_CHARS = 150;
const COLLAPSE_THRESHOLD_LINES = 3;
const PREVIEW_CHARS = 100;

// 프롬프트에서 질문과 프로필 분리
function parsePrompt(text: string): { question: string; profile: string | null } {
  // "---" 구분자로 질문과 프로필 분리
  const separator = '\n---\n';
  const separatorIndex = text.indexOf(separator);

  if (separatorIndex === -1) {
    // 구분자가 없으면 전체가 질문
    return { question: text, profile: null };
  }

  const question = text.substring(0, separatorIndex).trim();
  const profileSection = text.substring(separatorIndex + separator.length).trim();

  // "내정보:" 제거
  const profile = profileSection.replace(/^내정보:\s*/i, '').trim();

  return { question, profile };
}

// 텍스트가 접기 기준을 넘는지 확인
function shouldCollapse(text: string): boolean {
  const lineCount = (text.match(/\n/g) || []).length + 1;
  return text.length > COLLAPSE_THRESHOLD_CHARS || lineCount > COLLAPSE_THRESHOLD_LINES;
}

// 프로필 텍스트를 한 줄로 요약 (미리보기용)
function summarizeProfile(profile: string, maxLength: number = 80): string {
  // 줄바꿈을 공백으로, 여러 공백을 하나로
  const oneLine = profile.replace(/\n+/g, ' · ').replace(/\s+/g, ' ').trim();
  if (oneLine.length <= maxLength) return oneLine;
  return oneLine.substring(0, maxLength) + '...';
}

// 텍스트 미리보기 생성
function getPreviewText(text: string, maxLength: number = PREVIEW_CHARS): string {
  if (text.length <= maxLength) return text;
  // 단어 경계에서 자르기
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...';
  }
  return truncated + '...';
}

const SearchQueryHeader = React.forwardRef<HTMLDivElement, SearchQueryHeaderProps>(
  ({ queryText, className, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { question, profile } = parsePrompt(queryText);

    // 프로필이 있는 경우 (개인화 질문)
    const hasProfile = !!profile;

    // 질문이 길어서 접어야 하는지 (프로필 없는 경우)
    const questionNeedsCollapse = !hasProfile && shouldCollapse(question);

    // Case 1: 일반 짧은 질문
    if (!hasProfile && !questionNeedsCollapse) {
      return (
        <div
          ref={ref}
          className={cn('flex items-start justify-between gap-4 p-4 border-b border-slate-200', className)}
          {...props}
        >
          <h1 className="text-2xl font-semibold text-slate-900 flex-1 leading-tight">
            {queryText}
          </h1>
        </div>
      );
    }

    // Case 2: 프로필 없지만 긴 질문 - 접기 가능
    if (!hasProfile && questionNeedsCollapse) {
      return (
        <div
          ref={ref}
          className={cn('p-4', className)}
          {...props}
        >
          <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
            {isExpanded ? (
              // 펼쳐진 상태
              <div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {question}
                </p>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  접기
                  <ChevronUp className="h-3 w-3" />
                </button>
              </div>
            ) : (
              // 접힌 상태
              <div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {getPreviewText(question)}
                </p>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  더 보기
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Case 3: 개인화 질문 (프로필 있음) - Perplexity 스타일
    return (
      <div
        ref={ref}
        className={cn('p-4', className)}
        {...props}
      >
        {/* 질문 박스 - Perplexity 스타일 */}
        <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
          {/* 질문 */}
          <p className="text-sm text-slate-700 leading-relaxed">
            {question}
          </p>

          {/* 프로필 섹션 */}
          <div className="mt-3 pt-3 border-t border-slate-200">
            {isExpanded ? (
              // 펼쳐진 상태
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User className="h-3 w-3" />
                  <span>내 프로필 정보</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                  {profile}
                </p>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  접기
                  <ChevronUp className="h-3 w-3" />
                </button>
              </div>
            ) : (
              // 접힌 상태
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full text-left group"
              >
                <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                  <User className="h-3 w-3" />
                  <span className="flex-1 truncate">
                    {summarizeProfile(profile!)}
                  </span>
                  <span className="flex items-center gap-0.5 text-slate-400 group-hover:text-slate-600 flex-shrink-0">
                    더 보기
                    <ChevronDown className="h-3 w-3" />
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

SearchQueryHeader.displayName = 'SearchQueryHeader';

export { SearchQueryHeader };
