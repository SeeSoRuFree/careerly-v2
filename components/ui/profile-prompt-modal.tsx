'use client';

import { useState } from 'react';
import { User, FileText, ChevronDown, Send, Briefcase, GraduationCap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ProfileSummaryForAI } from '@/lib/api/types';

interface ProfilePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileSummaryForAI | null;
  onSubmit: (fullPrompt: string) => void;
}

export function ProfilePromptModal({
  isOpen,
  onClose,
  profileData,
  onSubmit,
}: ProfilePromptModalProps) {
  const [question, setQuestion] = useState(
    'AI 시대 어떤 커리어를 구축하는게 좋을까?'
  );
  const [isProfileExpanded, setIsProfileExpanded] = useState(true);

  const handleSubmit = () => {
    if (!question.trim()) return;

    // 프로필 텍스트 구성
    const profileText = buildProfileText(profileData);

    // 전체 프롬프트 구성
    const fullPrompt = `내정보:\n${profileText}\n\n----\n\n나는 이런사람인데 ${question}`;

    onSubmit(fullPrompt);
    onClose();
  };

  if (!profileData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            내 프로필 기반 질문
          </DialogTitle>
          <DialogDescription>
            아래 프로필 정보가 AI에게 전달됩니다. 질문을 수정하고 제출하세요.
          </DialogDescription>
        </DialogHeader>

        {/* 프로필 섹션 - 접기/펼치기 가능 */}
        <div className="flex-1 overflow-auto space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50">
            <button
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
              className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-t-lg transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                내 프로필 정보
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isProfileExpanded && 'rotate-180'
                )}
              />
            </button>

            {isProfileExpanded && (
              <div className="px-4 pb-4 space-y-3">
                {/* 이름 */}
                <ProfileField label="이름" value={profileData.name} />

                {/* 소개 */}
                {profileData.headline && (
                  <ProfileField label="소개" value={profileData.headline} />
                )}

                {/* 스킬 - 태그로 표시 */}
                {profileData.skills && profileData.skills.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1.5">
                      스킬
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {profileData.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 경력 요약 */}
                {profileData.career_years > 0 && (
                  <ProfileField
                    label="경력"
                    value={`총 ${profileData.career_years}년 (${profileData.total_experience_months}개월)`}
                  />
                )}

                {/* 경력 상세 */}
                {profileData.careers && profileData.careers.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-2">
                      <Briefcase className="h-3.5 w-3.5" />
                      경력 상세
                    </label>
                    <div className="space-y-3">
                      {profileData.careers.map((career, idx) => (
                        <div
                          key={idx}
                          className="pl-3 border-l-2 border-blue-200 space-y-1"
                        >
                          <div className="text-sm font-medium text-slate-700">
                            {career.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {career.company} • {career.duration}
                          </div>
                          {career.description && (
                            <div className="text-xs text-slate-600 line-clamp-2">
                              {career.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 학력 */}
                {profileData.educations && profileData.educations.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-2">
                      <GraduationCap className="h-3.5 w-3.5" />
                      학력
                    </label>
                    <div className="space-y-2">
                      {profileData.educations.map((edu, idx) => (
                        <div key={idx} className="text-sm text-slate-700">
                          {edu.school}
                          {edu.major && (
                            <span className="text-slate-500"> • {edu.major}</span>
                          )}
                          {edu.duration && (
                            <span className="text-xs text-slate-400 block">
                              {edu.duration}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 상세 설명 */}
                {profileData.description && (
                  <ProfileField label="상세 설명" value={profileData.description} />
                )}

                {/* 긴 설명 */}
                {profileData.long_description && (
                  <ProfileField
                    label="추가 정보"
                    value={profileData.long_description}
                  />
                )}
              </div>
            )}
          </div>

          {/* 질문 입력 영역 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block">
              질문 (수정 가능)
            </label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="AI에게 물어볼 질문을 입력하세요..."
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-slate-500">
              위 프로필 정보와 함께 "나는 이런사람인데 {question}" 형식으로
              전달됩니다.
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!question.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            질문하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 프로필 필드 컴포넌트
function ProfileField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 block mb-1">
        {label}
      </label>
      <div className="text-sm text-slate-700 whitespace-pre-wrap">{value}</div>
    </div>
  );
}

// 프로필 텍스트 구성 함수
function buildProfileText(profileData: ProfileSummaryForAI | null): string {
  if (!profileData) return '';

  const parts: string[] = [];

  // 이름
  if (profileData.name) {
    parts.push(`이름: ${profileData.name}`);
  }

  // 소개
  if (profileData.headline) {
    parts.push(`소개: ${profileData.headline}`);
  }

  // 스킬
  if (profileData.skills && profileData.skills.length > 0) {
    parts.push(`스킬: ${profileData.skills.join(', ')}`);
  }

  // 경력
  if (profileData.career_years > 0) {
    parts.push(
      `경력: 총 ${profileData.career_years}년 (${profileData.total_experience_months}개월)`
    );
  }

  // 경력 상세
  if (profileData.careers && profileData.careers.length > 0) {
    const careersText = profileData.careers
      .map((career) => {
        const desc = career.description ? `\n  ${career.description}` : '';
        return `- ${career.title} @ ${career.company} (${career.duration})${desc}`;
      })
      .join('\n');
    parts.push(`경력 상세:\n${careersText}`);
  }

  // 학력
  if (profileData.educations && profileData.educations.length > 0) {
    const educationsText = profileData.educations
      .map((edu) => {
        const major = edu.major ? ` - ${edu.major}` : '';
        const duration = edu.duration ? ` (${edu.duration})` : '';
        return `- ${edu.school}${major}${duration}`;
      })
      .join('\n');
    parts.push(`학력:\n${educationsText}`);
  }

  // 설명
  if (profileData.description) {
    parts.push(`상세 설명: ${profileData.description}`);
  }

  // 긴 설명
  if (profileData.long_description) {
    parts.push(`추가 정보: ${profileData.long_description}`);
  }

  return parts.join('\n\n');
}
