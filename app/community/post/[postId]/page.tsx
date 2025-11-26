'use client';

import * as React from 'react';
import { PostDetail } from '@/components/ui/post-detail';
import { AiChatPanel, Message } from '@/components/ui/ai-chat-panel';
import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/lib/api';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;

  // 실제 API 호출
  const { data: post, isLoading, error } = usePost(Number(postId));

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [sharedAiContent, setSharedAiContent] = React.useState<string>('');

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 또는 게시글 없음
  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            게시글을 찾을 수 없습니다
          </h1>
          <p className="text-slate-600 mb-4">
            요청하신 게시글이 존재하지 않거나 삭제되었습니다.
          </p>
          <button
            onClick={() => router.push('/community')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            커뮤니티로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // author가 null인 경우 기본값 설정
  const userProfile = post.author
    ? {
        id: post.author.id,
        name: post.author.name,
        image_url: post.author.image_url,
        headline: post.author.headline,
        title: post.author.headline,
      }
    : {
        id: post.userid,
        name: '알 수 없는 사용자',
        image_url: undefined,
        headline: '탈퇴한 사용자',
        title: '탈퇴한 사용자',
      };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setAiLoading(true);

    // Mock AI response - 실제로는 SSE API 호출
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `"${content}"에 대한 답변입니다.\n\n이 게시글에 대한 AI 분석 내용입니다.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setAiLoading(false);
    }, 1500);
  };

  return (
    <div className="relative">
      {/* 콘텐츠 영역 - 오른쪽 여백 확보 */}
      <div className="container mx-auto px-2 py-2 md:py-3 pr-2 lg:pr-[520px]">
        <PostDetail
          postId={postId}
          userProfile={userProfile}
          content={post.description}
          contentHtml={post.descriptionhtml}
          createdAt={post.createdat}
          stats={{
            likeCount: 0,
            replyCount: post.comment_count || 0,
            repostCount: 0,
            viewCount: 0,
          }}
          imageUrls={[]}
          comments={[]}
          onLike={() => console.log('Like post')}
          onReply={() => console.log('Reply to post')}
          onRepost={() => console.log('Repost')}
          onShare={() => console.log('Share')}
          onBookmark={() => console.log('Bookmark')}
          onCommentLike={(commentId) => console.log('Like comment', commentId)}
          onCommentSubmit={(content) => console.log('Submit comment', content)}
          sharedAiContent={sharedAiContent}
          onClearSharedContent={() => setSharedAiContent('')}
        />
      </div>

      {/* 플로팅 AI 어시스턴트 패널 - 오른쪽에 항상 표시 */}
      <div className="hidden lg:block fixed top-0 right-0 h-screen w-[480px] bg-white border-l border-slate-200 z-40">
        <AiChatPanel
          postId={postId}
          type="post"
          messages={messages}
          loading={aiLoading}
          onSendMessage={handleSendMessage}
          onShareMessage={(content) => setSharedAiContent(content)}
          contextData={{
            title: post.title || post.description,
          }}
        />
      </div>
    </div>
  );
}
