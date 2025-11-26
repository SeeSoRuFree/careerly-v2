'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { PenSquare, X, ImagePlus, Link2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCreatePost } from '@/lib/api';

// Mock user data
const mockUser = {
  id: 38284,
  name: '골빈해커',
  image_url: 'https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg',
  headline: 'Chief Maker',
};

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = React.useState('');
  const createPostMutation = useCreatePost();

  const canSubmit = content.trim().length > 0;

  const handleCancel = () => {
    if (content.trim().length > 0) {
      if (confirm('작성 중인 내용이 있습니다. 정말 나가시겠습니까?')) {
        router.push('/community');
      }
    } else {
      router.push('/community');
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      await createPostMutation.mutateAsync({
        title: '',
        description: content,
        posttype: 0, // Regular post
      });

      // Success - redirect to community
      router.push('/community');
    } catch (error) {
      console.error('Failed to create post:', error);
      // Error handling is done by the mutation hook
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Main Content */}
      <main className="lg:col-span-9">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="pt-16 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PenSquare className="h-10 w-10 text-slate-700" />
                <h1 className="text-3xl font-bold text-slate-900">새 게시글</h1>
              </div>

              {/* Cancel Button */}
              <Button variant="ghost" onClick={handleCancel}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Create Form Card */}
          <Card elevation="sm">
            {/* Profile Header */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mockUser.image_url} alt={mockUser.name} />
                  <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">{mockUser.name}</p>
                  <p className="text-sm text-slate-500">{mockUser.headline}</p>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="무슨 생각을 하고 계신가요?"
                className="min-h-[200px] border-0 focus:ring-0 resize-none text-base"
              />
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled>
                  <ImagePlus className="h-5 w-5 mr-2" />
                  사진
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <Link2 className="h-5 w-5 mr-2" />
                  링크
                </Button>
              </div>
              <Button
                variant="coral"
                onClick={handleSubmit}
                disabled={!canSubmit || createPostMutation.isPending}
              >
                {createPostMutation.isPending ? '게시 중...' : '게시하기'}
              </Button>
            </div>
          </Card>

          {/* Error Message */}
          {createPostMutation.isError && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">게시글 작성 실패</p>
                    <p className="text-sm text-red-700 mt-1">
                      {createPostMutation.error instanceof Error
                        ? createPostMutation.error.message
                        : '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="lg:col-span-3">
        <div className="space-y-4 pt-16">
          {/* Writing Tips */}
          <Card elevation="sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">작성 팁</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600">경험과 인사이트를 공유해보세요</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600">구체적인 사례를 들어 설명하면 좋아요</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600">질문을 던져 토론을 유도해보세요</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-600">간결하고 명확하게 작성해주세요</span>
              </div>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-900 mb-2">커뮤니티 가이드라인</h3>
              <p className="text-sm text-slate-600 mb-3">
                서로 존중하고 배려하는 커뮤니티를 만들어주세요
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>타인을 비방하거나 모욕하지 않기</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>개인정보 보호 준수하기</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>스팸이나 홍보성 게시글 지양하기</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>저작권 침해 금지하기</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">도움이 필요하신가요?</h3>
              <p className="text-sm text-blue-700">
                작성에 어려움이 있으시면 커뮤니티 가이드를 참고해보세요
              </p>
              <Button variant="link" className="text-blue-600 p-0 h-auto mt-2 text-sm">
                가이드 보기
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  );
}
