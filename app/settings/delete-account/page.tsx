'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLogout, useRequestDeleteAccount } from '@/lib/api';
import { cn } from '@/lib/utils';

const DELETE_REASONS = [
  { value: 'not_using', label: '더 이상 사용하지 않음' },
  { value: 'privacy', label: '개인정보 보호 우려' },
  { value: 'new_account', label: '다른 계정으로 가입하려고' },
  { value: 'dissatisfied', label: '콘텐츠/서비스 불만족' },
  { value: 'other', label: '기타' },
];

export default function DeleteAccountPage() {
  const router = useRouter();
  const [reason, setReason] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [agreed, setAgreed] = useState(false);

  const { logoutWithConfirm } = useLogout();
  const requestDelete = useRequestDeleteAccount();

  const handleSubmit = async () => {
    if (!agreed) return;

    const confirmed = window.confirm(
      '정말로 계정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
    );

    if (!confirmed) return;

    requestDelete.mutate(
      { reason, feedback },
      {
        onSuccess: () => {
          logoutWithConfirm();
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="w-full bg-slate-50 sticky top-0 z-50 pt-4 pb-2">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="-ml-2 hover:bg-slate-200"
            >
              <ChevronLeft className="h-6 w-6 text-slate-900" />
            </Button>
            <span className="font-semibold text-slate-900">계정 삭제 요청</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Warning Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-red-700 mb-2">계정 삭제 안내</h2>
              <p className="text-sm text-red-600 mb-3">
                계정을 삭제하면 다음 데이터가 모두 삭제되며 복구할 수 없습니다:
              </p>
              <ul className="text-sm text-red-600 space-y-1.5">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>프로필 정보</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>작성한 게시글 및 댓글</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>팔로우/팔로워 관계</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>북마크 및 좋아요</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Delete Reason Section */}
        <section>
          <h3 className="font-medium text-slate-900 mb-4">삭제 사유 (선택)</h3>
          <RadioGroup value={reason} onValueChange={setReason}>
            <div className="space-y-3">
              {DELETE_REASONS.map(r => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label
                    htmlFor={r.value}
                    className="text-sm text-slate-700 cursor-pointer font-normal"
                  >
                    {r.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </section>

        {/* Additional Feedback Section */}
        <section>
          <h3 className="font-medium text-slate-900 mb-4">추가 피드백 (선택)</h3>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="서비스 개선을 위한 의견을 남겨주세요."
            rows={4}
            className="resize-none"
          />
        </section>

        {/* Agreement Checkbox */}
        <div className="flex items-start space-x-3 p-4 bg-slate-100 rounded-lg">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            className="mt-0.5"
          />
          <Label
            htmlFor="agree"
            className="text-sm text-slate-700 cursor-pointer font-normal leading-relaxed"
          >
            위 내용을 확인했으며, 계정 삭제에 동의합니다.
          </Label>
        </div>

        {/* Delete Button */}
        <Button
          variant="coral"
          className={cn(
            "w-full h-12 font-semibold",
            agreed && !requestDelete.isPending && "hover:opacity-90"
          )}
          disabled={!agreed || requestDelete.isPending}
          onClick={handleSubmit}
        >
          {requestDelete.isPending ? '처리 중...' : '계정 삭제 요청하기'}
        </Button>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            계정 삭제 요청 후 관리자 검토가 진행되며,
            <br />
            처리 완료 시 이메일로 안내드립니다.
          </p>
        </div>
      </main>
    </div>
  );
}
