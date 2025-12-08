'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { MessageCircleQuestion } from 'lucide-react';

export interface QuestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  question: string;
}

const QuestionCard = React.forwardRef<HTMLDivElement, QuestionCardProps>(
  ({ question, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-6 shadow-sm',
          className
        )}
        {...props}
      >
        {/* Question Icon Badge */}
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
          <MessageCircleQuestion className="h-4 w-4 text-teal-600" />
          <span className="text-xs font-medium text-teal-700">질문</span>
        </div>

        {/* Question Text */}
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-relaxed">
          {question}
        </h2>

        {/* Decorative gradient overlay */}
        <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-gradient-to-br from-teal-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
      </div>
    );
  }
);

QuestionCard.displayName = 'QuestionCard';

export { QuestionCard };
