'use client';

import * as React from 'react';
import { Users, Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShareToCommunity } from '@/lib/api';

export interface CommunityShareCTAProps extends React.HTMLAttributes<HTMLDivElement> {
  sessionId: string;
  isShared?: boolean;
  onShareSuccess?: () => void;
}

const CommunityShareCTA = React.forwardRef<HTMLDivElement, CommunityShareCTAProps>(
  ({ sessionId, isShared = false, onShareSuccess, className, ...props }, ref) => {
    const shareToCommunity = useShareToCommunity();
    const [localShared, setLocalShared] = React.useState(isShared);

    React.useEffect(() => {
      setLocalShared(isShared);
    }, [isShared]);

    const handleShare = async () => {
      if (localShared) return;

      try {
        await shareToCommunity.mutateAsync({ sessionId });
        setLocalShared(true);
        onShareSuccess?.();
      } catch (error) {
        console.error('Share to community failed:', error);
      }
    };

    if (localShared) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative overflow-hidden rounded-lg border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 p-6',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-teal-100">
              <Check className="h-6 w-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                커뮤니티에 공유되었습니다
              </h3>
              <p className="text-sm text-slate-600">
                다른 사용자들도 이 답변을 확인할 수 있습니다
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-white via-teal-50/30 to-cyan-50/30 p-6 hover:border-teal-300 transition-all duration-300',
          className
        )}
        {...props}
      >
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-teal-100 rounded-full opacity-20 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-cyan-100 rounded-full opacity-20 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100">
              <Users className="h-6 w-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  내 피드에 공유하기
                </h3>
                <Sparkles className="h-4 w-4 text-teal-500" />
              </div>
              <p className="text-sm text-slate-600 mb-4">
                이 답변이 도움이 되셨나요? 커뮤니티와 함께 나누고 다른 사용자들에게도 유용한 정보를 공유해보세요
              </p>
              <button
                onClick={handleShare}
                disabled={shareToCommunity.isPending}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200',
                  'bg-gradient-to-r from-teal-500 to-cyan-500 text-white',
                  'hover:from-teal-600 hover:to-cyan-600',
                  'hover:shadow-lg hover:shadow-teal-500/30',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
                  'active:scale-95'
                )}
              >
                {shareToCommunity.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>공유 중...</span>
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    <span>커뮤니티에 공유하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CommunityShareCTA.displayName = 'CommunityShareCTA';

export { CommunityShareCTA };
