'use client';

import * as React from 'react';
import { X, ExternalLink, Bookmark, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/lib/api/hooks/queries/useUser';
import { useToggleDiscoverBookmark } from '@/lib/api/hooks/mutations/useDiscoverMutations';
import { analyzeJobsSpecific } from '@/lib/api/services/somoon-recruits.service';
import { toast } from 'sonner';
import Link from 'next/link';

export type ContentType = 'jobs' | 'blogs' | 'books' | 'courses';

export interface ContentDetailData {
  id: string;
  title: string;
  summary: string;
  externalUrl?: string;
  imageUrl?: string;
  companyName?: string;
  companyLogo?: string;
  isBookmarked: boolean;
}

export interface ContentDetailDrawerProps {
  open: boolean;
  content: ContentDetailData | null;
  contentType?: ContentType;
  onClose: () => void;
  onContentChange: (content: ContentDetailData | null) => void;
}

// ContentType을 API content_type으로 변환
function toApiContentType(contentType: ContentType): 'job' | 'blog' | 'book' | 'course' {
  const map: Record<ContentType, 'job' | 'blog' | 'book' | 'course'> = {
    jobs: 'job',
    blogs: 'blog',
    books: 'book',
    courses: 'course',
  };
  return map[contentType];
}

export function ContentDetailDrawer({
  open,
  content,
  contentType = 'jobs',
  onClose,
  onContentChange,
}: ContentDetailDrawerProps) {
  const { data: currentUser } = useCurrentUser();
  const { toggle: toggleBookmark, isLoading: isBookmarkLoading } = useToggleDiscoverBookmark();
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);

  // 요약이 없는지 확인 (빈 문자열, null/undefined, 또는 "아직 생성되지 않았습니다" 텍스트)
  const hasSummary = content?.summary &&
    content.summary.trim().length > 0 &&
    !content.summary.includes('아직 생성되지 않았습니다');

  // 요약 생성 핸들러
  const handleGenerateSummary = async () => {
    if (!content) return;

    // job ID 추출 (id가 "job-123" 형식일 수 있음)
    const jobIdStr = content.id.replace(/^job-/, '');
    const jobId = parseInt(jobIdStr, 10);

    if (isNaN(jobId)) {
      toast.error('채용공고 ID를 확인할 수 없습니다.');
      return;
    }

    setIsGeneratingSummary(true);

    try {
      const response = await analyzeJobsSpecific({
        jobs_ids: [jobId],
        force_reanalyze: false,
      });

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success && result.analysis?.요약) {
          // 요약 업데이트
          onContentChange({
            ...content,
            summary: result.analysis.요약,
          });
          toast.success('요약이 생성되었습니다.');
        } else if (result.error) {
          toast.error(`요약 생성 실패: ${result.error}`);
        } else {
          toast.error('요약을 생성할 수 없습니다.');
        }
      } else {
        toast.error('요약을 생성할 수 없습니다.');
      }
    } catch (error) {
      console.error('요약 생성 오류:', error);
      toast.error('요약 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleBookmarkContent = async () => {
    if (!content) return;

    // 로그인 체크
    if (!currentUser) {
      toast.error('로그인이 필요합니다.', {
        action: {
          label: '로그인',
          onClick: () => {
            window.location.href = '/login';
          },
        },
      });
      return;
    }

    try {
      const newBookmarkState = await toggleBookmark(
        {
          content_type: toApiContentType(contentType),
          external_id: content.id,
          url: content.externalUrl || '',
          title: content.title,
          summary: content.summary,
          image_url: content.imageUrl,
          company_name: content.companyName,
          company_logo: content.companyLogo,
        },
        content.isBookmarked
      );

      // 로컬 상태 업데이트
      onContentChange({
        ...content,
        isBookmarked: newBookmarkState,
      });
    } catch {
      // 에러는 useToggleDiscoverBookmark에서 처리
    }
  };

  // 콘텐츠 타입별 버튼 텍스트
  const getButtonText = () => {
    switch (contentType) {
      case 'jobs':
        return '공고 보기';
      case 'blogs':
        return '블로그 보기';
      case 'books':
        return '도서 보기';
      case 'courses':
        return '강의 보기';
      default:
        return '자세히 보기';
    }
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto border-l border-slate-100',
          // Mobile safe area
          'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
          'pr-[env(safe-area-inset-right)]',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {content && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="sticky top-[env(safe-area-inset-top)] z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {content.companyLogo && (
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden">
                    <img
                      src={content.companyLogo}
                      alt={content.companyName}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-slate-900">{content.companyName}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
                  {content.title}
                </h1>

                {/* Summary */}
                <div className="prose prose-slate max-w-none mb-6">
                  {hasSummary ? (
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line break-keep">{content.summary}</p>
                  ) : contentType === 'jobs' ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Sparkles className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 text-center mb-4">
                        아직 AI 요약이 생성되지 않았습니다.
                      </p>
                      <Button
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        {isGeneratingSummary ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            요약 생성 중...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI 요약 생성하기
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-4">요약 정보가 없습니다.</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-8">
                  <Button
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                    onClick={() => content.externalUrl && window.open(content.externalUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {getButtonText()}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      'border-slate-200',
                      content.isBookmarked && 'bg-teal-50 border-teal-200'
                    )}
                    onClick={handleBookmarkContent}
                    disabled={isBookmarkLoading}
                  >
                    {isBookmarkLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bookmark
                        className={cn(
                          'h-4 w-4',
                          content.isBookmarked && 'fill-teal-500 text-teal-500'
                        )}
                      />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
    </>
  );
}
