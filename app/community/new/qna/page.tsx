'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Chip } from '@/components/ui/chip';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { HelpCircle, X, Globe, Lock, CheckCircle2 } from 'lucide-react';
import { useCreateQuestion } from '@/lib/api';
import type { QuestionCreateRequest } from '@/lib/api';

// 인기 태그 목록
const POPULAR_TAGS = ['취업', '이직', '포트폴리오', '면접', 'React'];

/**
 * Community Q&A 등록 페이지
 *
 * 기존 /app/community/page.tsx의 정확한 패턴을 따릅니다.
 */
export default function NewQnaPage() {
  const router = useRouter();
  const createQuestion = useCreateQuestion();

  // Form state
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [isPublic, setIsPublic] = React.useState(true);

  /**
   * 태그 입력 핸들러 (Enter 키)
   */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && tags.length < 5) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  /**
   * 인기 태그 클릭으로 추가
   */
  const addTag = (tag: string) => {
    if (tags.length < 5 && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  /**
   * 태그 삭제
   */
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  /**
   * 질문 등록
   */
  const handleSubmit = async () => {
    if (!canSubmit) return;

    const requestData: QuestionCreateRequest = {
      title: title.trim(),
      description: description.trim(),
      ispublic: isPublic ? 1 : 0,
    };

    try {
      await createQuestion.mutateAsync(requestData);
      router.push('/community?tab=qna');
    } catch (error) {
      console.error('Failed to create question:', error);
    }
  };

  /**
   * 취소
   */
  const handleCancel = () => {
    if (title || description || tags.length > 0) {
      if (confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const canSubmit = title.trim() && description.trim() && !createQuestion.isPending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Main Content */}
      <main className="lg:col-span-9">
        <div className="space-y-4">
          {/* Header */}
          <div className="pt-16 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-10 w-10 text-slate-700" />
                <h1 className="text-3xl font-bold text-slate-900">질문하기</h1>
              </div>
              <Button variant="ghost" onClick={handleCancel}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* 질문 폼 카드 */}
          <Card elevation="sm">
            <CardContent className="p-6 space-y-6">
              {/* 제목 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">제목</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="질문을 한 줄로 요약해주세요"
                  className="h-12"
                  maxLength={200}
                />
              </div>

              {/* 내용 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">내용</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="질문 내용을 자세히 작성해주세요"
                  className="min-h-[200px] resize-none"
                  maxLength={5000}
                />
              </div>

              {/* 태그 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">태그 (선택)</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg min-h-[48px]">
                  {tags.map((tag) => (
                    <Chip key={tag} dismissible onDismiss={() => removeTag(tag)}>
                      {tag}
                    </Chip>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length < 5 ? '태그 입력 후 Enter' : ''}
                    disabled={tags.length >= 5}
                    className="flex-1 min-w-[100px] bg-transparent border-0 outline-none text-sm"
                  />
                </div>
              </div>

              {/* 공개 설정 */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="h-5 w-5 text-teal-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-slate-500" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">
                      {isPublic ? '공개' : '비공개'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {isPublic ? '모든 사용자가 볼 수 있어요' : '나만 볼 수 있어요'}
                    </p>
                  </div>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </CardContent>

            {/* 하단 액션 */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={handleCancel}>
                취소
              </Button>
              <Button variant="coral" onClick={handleSubmit} disabled={!canSubmit}>
                질문 등록
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="lg:col-span-3">
        <div className="space-y-4 pt-16">
          {/* 좋은 질문 작성법 */}
          <Card elevation="sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">좋은 질문 작성법</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600">구체적인 상황을 설명해주세요</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600">이미 시도해본 것을 알려주세요</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600">관련 코드나 에러를 첨부하세요</span>
              </div>
            </CardContent>
          </Card>

          {/* 인기 태그 */}
          <Card elevation="sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">인기 태그</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <Chip
                    key={tag}
                    variant="default"
                    onClick={() => addTag(tag)}
                    className="cursor-pointer"
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  );
}
