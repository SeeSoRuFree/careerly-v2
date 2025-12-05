/**
 * Report API 서비스
 */

import { authClient, handleApiError } from '../clients/rest-client';
import type { ReportRequest, ReportResponse, ContentType } from '../types/report.types';

/**
 * 콘텐츠 신고
 * 인증 필요
 *
 * @param contentType - 신고할 콘텐츠 타입 (0=프로필, 1=게시글, 2=Q&A질문, 3=투표, 4=댓글, 5=답변, 6=투표댓글)
 * @param contentId - 신고할 콘텐츠 ID
 */
export async function reportContent(contentType: number, contentId: number): Promise<ReportResponse> {
  try {
    const data: ReportRequest = {
      content_type: contentType as ContentType,
      content_id: contentId,
    };

    const response = await authClient.post<ReportResponse>('/api/v1/reports/', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
