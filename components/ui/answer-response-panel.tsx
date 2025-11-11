'use client';

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

export interface AnswerResponsePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  answerHtml?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

const AnswerResponsePanel = React.forwardRef<HTMLDivElement, AnswerResponsePanelProps>(
  ({ answerHtml, loading = false, error, onRetry, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 bg-white rounded-lg border border-slate-200', className)}
        {...props}
      >
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-900">Error</h4>
                <p className="text-sm text-amber-700 mt-1">{error}</p>
              </div>
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        )}

        {!loading && !error && answerHtml && (
          <div
            className="prose prose-slate max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-coral-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-code:text-slate-900 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-ul:list-disc prose-ol:list-decimal"
            dangerouslySetInnerHTML={{ __html: answerHtml }}
          />
        )}

        {!loading && !error && !answerHtml && (
          <p className="text-slate-500 text-center py-8">No answer available</p>
        )}
      </div>
    );
  }
);

AnswerResponsePanel.displayName = 'AnswerResponsePanel';

export { AnswerResponsePanel };
