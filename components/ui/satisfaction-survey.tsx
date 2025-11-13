'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SatisfactionSurveyProps {
  searchId: string;
  onSubmit: (data: { searchId: string; rating: number; feedback: string }) => void;
  className?: string;
}

const SatisfactionSurvey = React.forwardRef<HTMLDivElement, SatisfactionSurveyProps>(
  ({ searchId, onSubmit, className }, ref) => {
    const [rating, setRating] = React.useState<number>(0);
    const [hoveredRating, setHoveredRating] = React.useState<number>(0);
    const [feedback, setFeedback] = React.useState<string>('');
    const [submitted, setSubmitted] = React.useState<boolean>(false);

    const handleSubmit = () => {
      if (rating === 0) return;

      onSubmit({ searchId, rating, feedback });
      setSubmitted(true);
    };

    const handleReset = () => {
      setRating(0);
      setFeedback('');
      setSubmitted(false);
    };

    if (submitted) {
      return (
        <Card ref={ref} className={cn('border-slate-200', className)}>
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="text-lg font-semibold text-slate-900">피드백 감사합니다!</div>
              <p className="text-sm text-slate-600">
                여러분의 소중한 의견이 더 나은 서비스를 만드는 데 큰 도움이 됩니다.
              </p>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                다시 작성하기
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card ref={ref} className={cn('border-slate-200', className)}>
        <CardHeader>
          <CardTitle className="text-lg">검색 결과가 만족스러우셨나요?</CardTitle>
          <CardDescription>
            검색 품질 향상을 위해 여러분의 의견을 들려주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Star Rating */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className={cn(
                  'transition-all duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded',
                  'cursor-pointer'
                )}
                aria-label={`${star}점`}
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    (hoveredRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-transparent text-slate-300'
                  )}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm font-medium text-slate-700">{rating}점</span>
            )}
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium text-slate-700">
              추가 의견 (선택사항)
            </label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="개선이 필요한 부분이나 좋았던 점을 자유롭게 작성해주세요..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-slate-500 text-right">
              {feedback.length}/500
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="solid"
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full"
          >
            제출하기
          </Button>
        </CardFooter>
      </Card>
    );
  }
);

SatisfactionSurvey.displayName = 'SatisfactionSurvey';

export { SatisfactionSurvey };
