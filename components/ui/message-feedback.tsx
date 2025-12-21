'use client';

import * as React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMessageFeedback } from '@/lib/api';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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
  /** 강조 모드 (베타 피드백 수집용) */
  emphasized?: boolean;
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
  emphasized = false,
}: MessageFeedbackProps) {
  const [localFeedback, setLocalFeedback] = React.useState<boolean | null>(
    currentFeedback ?? null
  );
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [selectedFeedback, setSelectedFeedback] = React.useState<boolean | null>(null);
  const [detailText, setDetailText] = React.useState('');

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

    // 첫 피드백 시 상세 피드백 모달 열기
    if (localFeedback === null) {
      setSelectedFeedback(isLiked);
      setShowDetailModal(true);
      return;
    }

    // 이미 피드백을 남긴 경우 바로 변경
    feedbackMutation.mutate({
      messageId,
      isLiked,
    });
  };

  const handleDetailSubmit = () => {
    if (selectedFeedback === null) return;

    feedbackMutation.mutate({
      messageId,
      isLiked: selectedFeedback,
      feedbackText: detailText.trim() || undefined,
    });

    setShowDetailModal(false);
    setDetailText('');
  };

  const handleDetailCancel = () => {
    // 건너뛰기: 텍스트 없이 좋아요/싫어요만 전송
    if (selectedFeedback !== null) {
      feedbackMutation.mutate({
        messageId,
        isLiked: selectedFeedback,
      });
    }
    setShowDetailModal(false);
    setSelectedFeedback(null);
    setDetailText('');
  };

  const isLoading = feedbackMutation.isPending;

  // 강조 모드
  if (emphasized) {
    return (
      <>
        <div className={cn(
          'rounded-xl border-2 border-teal-200 bg-gradient-to-br from-teal-50/50 to-white p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2',
          className
        )}>
          {/* 베타 배지 */}
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-100 border border-teal-200">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span className="text-xs font-semibold text-teal-700">BETA</span>
            </div>
          </div>

          {/* 메인 텍스트 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              AI 답변이 도움이 되셨나요?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              베타 서비스 개선을 위해 여러분의 피드백이 큰 힘이 됩니다.<br />
              솔직한 평가를 남겨주세요!
            </p>
          </div>

          {/* 피드백 버튼 */}
          {localFeedback === null ? (
            <div className="flex gap-3">
              <Button
                onClick={() => handleFeedback(true)}
                disabled={disabled || isLoading}
                className="flex-1 h-14 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <ThumbsUp className="h-5 w-5 mr-2" />
                <span className="font-semibold">도움이 되었어요</span>
              </Button>
              <Button
                onClick={() => handleFeedback(false)}
                disabled={disabled || isLoading}
                variant="outline"
                className="flex-1 h-14 border-2 border-slate-300 hover:border-red-400 hover:bg-red-50 transition-all"
              >
                <ThumbsDown className="h-5 w-5 mr-2" />
                <span className="font-semibold">아쉬워요</span>
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-teal-100 border border-teal-200">
                {localFeedback ? (
                  <ThumbsUp className="h-5 w-5 text-teal-600 fill-current" />
                ) : (
                  <ThumbsDown className="h-5 w-5 text-red-600 fill-current" />
                )}
                <span className="text-sm font-semibold text-teal-900">
                  피드백 감사합니다! 더 나은 서비스로 찾아뵙겠습니다.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 상세 피드백 모달 */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-600" />
                상세한 피드백을 남겨주세요
              </DialogTitle>
              <DialogDescription>
                {selectedFeedback
                  ? '어떤 점이 특히 도움이 되었나요?'
                  : '어떤 점이 아쉬웠나요? 개선하고 싶은 부분을 알려주세요.'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={detailText}
                onChange={(e) => setDetailText(e.target.value)}
                placeholder={selectedFeedback
                  ? '예: 정확한 정보를 빠르게 찾을 수 있었어요'
                  : '예: 답변이 너무 길어요, 핵심만 알려주면 좋겠어요'}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                선택사항입니다. 건너뛰셔도 됩니다.
              </p>
            </div>
            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={handleDetailCancel}
                className="flex-1"
              >
                건너뛰기
              </Button>
              <Button
                onClick={handleDetailSubmit}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
                disabled={isLoading}
              >
                {isLoading ? '제출 중...' : '제출하기'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // 일반 모드 (기존 UI)
  return (
    <>
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

      {/* 상세 피드백 모달 */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-600" />
              상세한 피드백을 남겨주세요
            </DialogTitle>
            <DialogDescription>
              {selectedFeedback
                ? '어떤 점이 특히 도움이 되었나요?'
                : '어떤 점이 아쉬웠나요? 개선하고 싶은 부분을 알려주세요.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={detailText}
              onChange={(e) => setDetailText(e.target.value)}
              placeholder={selectedFeedback
                ? '예: 정확한 정보를 빠르게 찾을 수 있었어요'
                : '예: 답변이 너무 길어요, 핵심만 알려주면 좋겠어요'}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">
              선택사항입니다. 건너뛰셔도 됩니다.
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={handleDetailCancel}
              className="flex-1"
            >
              건너뛰기
            </Button>
            <Button
              onClick={handleDetailSubmit}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              disabled={isLoading}
            >
              {isLoading ? '제출 중...' : '제출하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MessageFeedback;
