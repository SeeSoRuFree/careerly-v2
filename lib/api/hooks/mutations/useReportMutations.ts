/**
 * Report 관련 React Query Mutation 훅
 */

'use client';

import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reportContent } from '../../services/report.service';
import type { ReportResponse } from '../../types/report.types';

/**
 * 콘텐츠 신고 mutation 파라미터
 */
interface ReportContentParams {
  contentType: number;
  contentId: number;
}

/**
 * 콘텐츠 신고 mutation
 */
export function useReportContent(
  options?: Omit<UseMutationOptions<ReportResponse, Error, ReportContentParams>, 'mutationFn'>
) {
  return useMutation<ReportResponse, Error, ReportContentParams>({
    mutationFn: ({ contentType, contentId }) => reportContent(contentType, contentId),
    onSuccess: (data) => {
      if (data.success && data.reported) {
        toast.success('신고가 접수되었습니다.');
      } else {
        toast.info(data.message || '이미 신고한 콘텐츠입니다.');
      }
    },
    onError: (error) => {
      toast.error(error.message || '신고에 실패했습니다.');
    },
    ...options,
  });
}
