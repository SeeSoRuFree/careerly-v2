'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { Markdown } from '@/components/common/Markdown';
import type { ChatSources } from '@/lib/api';

export interface AIAnswerSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  answer: string;
  sources?: ChatSources;
}

const AIAnswerSection = React.forwardRef<HTMLDivElement, AIAnswerSectionProps>(
  ({ answer, sources, className, ...props }, ref) => {
    // Combine all sources for display
    const allSources = sources?.all || [];

    return (
      <div
        ref={ref}
        className={cn('bg-white rounded-xl border border-slate-200 shadow-sm', className)}
        {...props}
      >
        {/* AI Badge Header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-600">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">AI 답변</span>
          </div>
        </div>

        {/* Answer Content */}
        <div className="p-6">
          <Markdown
            content={answer}
            className="prose prose-sm prose-slate max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-code:text-slate-900 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:overflow-x-auto prose-ul:list-disc prose-ol:list-decimal"
          />
        </div>

        {/* Citations */}
        {allSources.length > 0 && (
          <div className="px-6 pb-6">
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                참고 자료 ({allSources.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {allSources.map((source, index) => {
                  // Extract domain from URL for display
                  let domain = source;
                  try {
                    const url = new URL(source);
                    domain = url.hostname.replace('www.', '');
                  } catch {
                    // If not a valid URL, use as is
                  }

                  return (
                    <a
                      key={index}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 hover:text-slate-900 transition-colors"
                    >
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="truncate max-w-[200px]">{domain}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

AIAnswerSection.displayName = 'AIAnswerSection';

export { AIAnswerSection };
