'use client';

import * as React from 'react';
import { QnaDetail } from '@/components/ui/qna-detail';
import { AiChatPanel, Message } from '@/components/ui/ai-chat-panel';
import { useParams } from 'next/navigation';
import { useQuestion } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function QnaDetailPage() {
  const params = useParams();
  const qnaId = params.qnaId as string;

  // API 호출
  const { data: qnaData, isLoading, error } = useQuestion(Number(qnaId));

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [sharedAiContent, setSharedAiContent] = React.useState<string>('');

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="ml-3 text-slate-600">Loading...</span>
      </div>
    );
  }

  // 에러 또는 데이터 없음
  if (error || !qnaData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            질문을 찾을 수 없습니다
          </h1>
          <p className="text-slate-600">
            요청하신 질문이 존재하지 않거나 삭제되었습니다.
          </p>
        </div>
      </div>
    );
  }

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
        content: `"${content}"에 대한 답변입니다.\n\n현재 ${qnaData.answers?.length || 0}개의 답변이 달려있습니다. 추가로 궁금하신 점이 있으시면 언제든지 물어보세요!`,
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
        <QnaDetail
          qnaId={qnaData.id.toString()}
          title={qnaData.title}
          description={qnaData.description}
          createdAt={qnaData.createdat}
          updatedAt={qnaData.updatedat}
          hashTagNames=""
          viewCount={0}
          likeCount={0}
          dislikeCount={0}
          status={qnaData.status}
          isPublic={qnaData.ispublic}
          answers={qnaData.answers.map(answer => ({
            id: answer.id,
            userId: answer.userid,
            userName: answer.author?.name || '익명',
            userImage: answer.author?.image_url || '',
            userHeadline: answer.author?.headline || '',
            content: answer.content,
            createdAt: answer.createdat,
            likeCount: 0,
            dislikeCount: 0,
            isAccepted: false,
            liked: false,
            disliked: false,
          }))}
          onLike={() => console.log('Like question')}
          onDislike={() => console.log('Dislike question')}
          onAnswerLike={(answerId) => console.log('Like answer', answerId)}
          onAnswerDislike={(answerId) => console.log('Dislike answer', answerId)}
          onAnswerSubmit={(content) => console.log('Submit answer', content)}
          onAcceptAnswer={(answerId) => console.log('Accept answer', answerId)}
          sharedAiContent={sharedAiContent}
          onClearSharedContent={() => setSharedAiContent('')}
        />
      </div>

      {/* 플로팅 AI 어시스턴트 패널 - 오른쪽에 항상 표시 */}
      <div className="hidden lg:block fixed top-0 right-0 h-screen w-[480px] bg-white border-l border-slate-200 z-40">
        <AiChatPanel
          qnaId={qnaId}
          type="qna"
          messages={messages}
          loading={aiLoading}
          onSendMessage={handleSendMessage}
          onShareMessage={(content) => setSharedAiContent(content)}
          contextData={{
            title: qnaData.title,
          }}
        />
      </div>
    </div>
  );
}
