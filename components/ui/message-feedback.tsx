'use client';

import * as React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMessageFeedback } from '@/lib/api';
import { Button } from './button';

export interface MessageFeedbackProps {
  /** 메시지 ID */
  messageId: string;
  /** 현재 피드백 상태 (null=미평가, true=좋아요, false=싫어요) */
  currentFeedback?: boolean | null;
  /** 피드백 변경 콜백 */
  onFeedbackChange?: (isLiked: boolean) => void;
  /** 추가 className */
  className?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 메시지 피드백 컴포넌트 (좋아요/싫어요)
 * AI 응답 하단에 표시되어 사용자 만족도를 수집
 */
export function MessageFeedback({
  messageId,
  currentFeedback,
  onFeedbackChange,
  className,
  disabled = false,
}: MessageFeedbackProps) {
  const [localFeedback, setLocalFeedback] = React.useState<boolean | null>(
    currentFeedback ?? null
  );

  const feedbackMutation = useMessageFeedback({
    onSuccess: (data) => {
      setLocalFeedback(data.is_liked ?? null);
      onFeedbackChange?.(data.is_liked ?? false);
    },
  });

  // currentFeedback이 외부에서 변경되면 동기화
  React.useEffect(() => {
    setLocalFeedback(currentFeedback ?? null);
  }, [currentFeedback]);

  const handleFeedback = (isLiked: boolean) => {
    // 같은 피드백을 다시 클릭하면 무시 (토글 비활성화)
    if (localFeedback === isLiked) return;

    feedbackMutation.mutate({
      messageId,
      isLiked,
    });
  };

  const isLoading = feedbackMutation.isPending;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* 좋아요 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(true)}
        disabled={disabled || isLoading}
        className={cn(
          'h-8 w-8 p-0 rounded-full transition-all',
          localFeedback === true
            ? 'text-green-600 bg-green-50 hover:bg-green-100'
            : 'text-muted-foreground hover:text-green-600 hover:bg-green-50'
        )}
        aria-label="좋아요"
        title="도움이 되었어요"
      >
        <ThumbsUp
          className={cn(
            'h-4 w-4 transition-all',
            localFeedback === true && 'fill-current'
          )}
        />
      </Button>

      {/* 싫어요 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(false)}
        disabled={disabled || isLoading}
        className={cn(
          'h-8 w-8 p-0 rounded-full transition-all',
          localFeedback === false
            ? 'text-red-600 bg-red-50 hover:bg-red-100'
            : 'text-muted-foreground hover:text-red-600 hover:bg-red-50'
        )}
        aria-label="싫어요"
        title="도움이 안 되었어요"
      >
        <ThumbsDown
          className={cn(
            'h-4 w-4 transition-all',
            localFeedback === false && 'fill-current'
          )}
        />
      </Button>

      {/* 피드백 완료 메시지 */}
      {localFeedback !== null && (
        <span className="ml-2 text-xs text-muted-foreground animate-in fade-in">
          피드백 감사합니다!
        </span>
      )}
    </div>
  );
}

export default MessageFeedback;
