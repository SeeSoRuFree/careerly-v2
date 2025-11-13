'use client';

import * as React from 'react';
import { PostDetail } from '@/components/ui/post-detail';
import { AiChatPanel, Message } from '@/components/ui/ai-chat-panel';
import { useParams } from 'next/navigation';

// Mock data - 실제로는 API에서 가져올 데이터
const mockPostData = {
  "122238": {
    postId: "122238",
    userProfile: {
      id: 39820,
      name: "골빈해커",
      image_url: "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg",
      headline: "Chief Maker",
      title: "Chief Maker",
    },
    content: "냉장 기술로 돈을 가장 크게 버는 회사는, 냉장 기술을 보유한 회사도 아니고 냉장고 회사도 아니고 코카콜라라고한다. 같은 것으로, 금으로 가장 돈을 많이 버는 회사는 금광 회사도 아니고 청바지 회사도 아니고 Nvidia나 애플같은데라는 사실.",
    contentHtml: "<p>냉장 기술로 돈을 가장 크게 버는 회사는, 냉장 기술을 보유한 회사도 아니고 냉장고 회사도 아니고 코카콜라라고한다. 같은 것으로, 금으로 가장 돈을 많이 버는 회사는 금광 회사도 아니고 청바지 회사도 아니고 Nvidia나 애플같은데라는 사실.</p>",
    createdAt: "2025-09-12 04:48:02",
    stats: {
      likeCount: 2,
      replyCount: 8,
      repostCount: 0,
      viewCount: 1628,
    },
    imageUrls: ["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"],
    feedType: "RECOMMENDED.INTERESTS",
    comments: [
      {
        id: 2,
        userId: 1001,
        userName: "김개발",
        userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
        userHeadline: "Frontend Developer",
        content: "정말 흥미로운 관점이네요! 결국 기술을 어떻게 활용하느냐가 중요한 것 같습니다.",
        createdAt: "2025-09-12 05:10:00",
        likeCount: 5,
        liked: false,
      },
      {
        id: 3,
        userId: 1002,
        userName: "이디자인",
        userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
        userHeadline: "Product Designer",
        content: "코카콜라의 유통망과 브랜드 파워를 생각하면 당연한 것 같기도 하네요.",
        createdAt: "2025-09-12 06:30:00",
        likeCount: 3,
        liked: false,
      },
      {
        id: 4,
        userId: 1003,
        userName: "박마케터",
        userHeadline: "Growth Marketer",
        content: "비즈니스 모델의 중요성을 다시 한번 느끼게 됩니다.",
        createdAt: "2025-09-12 07:15:00",
        likeCount: 1,
        liked: false,
      },
      {
        id: 5,
        userId: 1004,
        userName: "최스타트업",
        userImage: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&q=80",
        userHeadline: "Startup Founder",
        content: "이게 바로 '기술 스택'과 '비즈니스 모델'의 차이죠. 스타트업을 하면서 많이 배우는 부분입니다. 좋은 기술도 중요하지만, 그걸 어떻게 수익화하고 확장하느냐가 더 중요하더라고요.",
        createdAt: "2025-09-12 08:45:00",
        likeCount: 12,
        liked: false,
      },
      {
        id: 6,
        userId: 1005,
        userName: "정데이터",
        userImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
        userHeadline: "Data Analyst",
        content: "실제로 냉장 기술의 ROI를 분석해보면 코카콜라의 마케팅과 유통 전략이 얼마나 효과적인지 알 수 있습니다. 데이터로 봐도 놀라운 수치예요 📊",
        createdAt: "2025-09-12 09:20:00",
        likeCount: 7,
        liked: false,
      },
      {
        id: 7,
        userId: 1006,
        userName: "송엔지니어",
        userHeadline: "Backend Engineer",
        content: "비슷한 예로 AWS도 그렇죠. 클라우드 기술 자체보다 그걸 서비스로 만들어서 수많은 기업들에게 제공하는 비즈니스 모델이 혁신적이었던 것 같습니다.",
        createdAt: "2025-09-12 10:05:00",
        likeCount: 9,
        liked: false,
      },
      {
        id: 8,
        userId: 1007,
        userName: "한기획자",
        userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        userHeadline: "Product Manager",
        content: "이런 인사이트를 얻을 수 있는 게 커리어리의 매력이네요. 덕분에 제품 기획할 때 새로운 관점을 얻었습니다 💡",
        createdAt: "2025-09-12 11:30:00",
        likeCount: 4,
        liked: false,
      },
      {
        id: 1,
        userId: 1008,
        userName: "조스타트업",
        userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
        userHeadline: "Startup Founder",
        content: "> 사용자 질문:\n> 이 게시글의 핵심 내용을 요약해줘\n\n> AI 답변:\n> 이 게시글의 핵심은 '기술 소유'와 '기술 활용'의 차이입니다. 냉장 기술을 직접 개발한 회사가 아닌 코카콜라가 해당 기술을 활용한 유통망으로 더 큰 수익을 창출했다는 점이 중요합니다. 마찬가지로 Nvidia나 Apple도 반도체 기술을 활용하여 생태계를 구축하고 막대한 가치를 만들어냈습니다.\n\nAI 분석이 정말 도움됐어요! 저희 스타트업도 지금 '기술을 어떻게 활용할 것인가'에 집중하고 있는데, 이 관점이 정확히 맞는 것 같습니다. 플랫폼 비즈니스로 전환을 고려 중입니다.",
        createdAt: "2025-09-12 02:15:00",
        likeCount: 18,
        liked: false,
      },
    ],
  },
  "122235": {
    postId: "122235",
    userProfile: {
      id: 39820,
      name: "골빈해커",
      image_url: "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg",
      headline: "Chief Maker",
      title: "Chief Maker",
    },
    content: "오늘의 탐라는 git rebase로군요.\n\n작은 팀에서는 rebase없이 그냥 날것의 커밋을 공유하는게 좋다고 생각하고, 큰 팀에서는 로컬 커밋에서만 자잘한 커밋을 약간 정리하는 차원에서 rebase를 하는게 좋다고 생각합니다.",
    contentHtml: "<p>오늘의 탐라는 git rebase로군요.</p><p><br></p><p>작은 팀에서는 rebase없이 그냥 날것의 커밋을 공유하는게 좋다고 생각하고, 큰 팀에서는 로컬 커밋에서만 자잘한 커밋을 약간 정리하는 차원에서 rebase를 하는게 좋다고 생각합니다.</p>",
    createdAt: "2025-09-12 03:38:29",
    stats: {
      likeCount: 4,
      replyCount: 6,
      repostCount: 0,
      viewCount: 1527,
    },
    imageUrls: [],
    feedType: "RECOMMENDED.INTERESTS",
    comments: [
      {
        id: 1,
        userId: 1013,
        userName: "임개발자",
        userImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&q=80",
        userHeadline: "Full Stack Developer",
        content: "> 사용자 질문:\n> 팀 규모에 따라 git rebase를 어떻게 다르게 사용해야 할까?\n\n> AI 답변:\n> git rebase는 커밋 히스토리를 선형으로 정리하는 강력한 도구입니다. 작은 팀에서는 자연스러운 개발 흐름을 보존하는 것이 협업에 도움이 될 수 있고, 큰 팀에서는 깔끔한 히스토리가 코드 리뷰와 디버깅에 유리합니다. 핵심은 팀의 워크플로우에 맞게 선택하는 것입니다.\n\n정확한 분석이네요! 저희 팀도 5명에서 20명으로 늘어나면서 rebase 정책을 도입했는데, 확실히 PR 리뷰할 때 히스토리가 깔끔해서 좋더라구요. 다만 신입분들 교육이 필요했어요.",
        createdAt: "2025-09-12 02:20:00",
        likeCount: 11,
        liked: false,
      },
      {
        id: 2,
        userId: 1008,
        userName: "최개발자",
        userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
        userHeadline: "Backend Engineer",
        content: "저도 같은 생각입니다. 팀의 규모와 문화에 따라 다르게 접근해야 하는 것 같아요.",
        createdAt: "2025-09-12 04:20:00",
        likeCount: 2,
        liked: false,
      },
      {
        id: 3,
        userId: 1009,
        userName: "정테크",
        userHeadline: "Tech Lead",
        content: "rebase는 히스토리를 깔끔하게 유지할 수 있지만, 사용에 주의가 필요하죠.",
        createdAt: "2025-09-12 05:00:00",
        likeCount: 1,
        liked: false,
      },
      {
        id: 4,
        userId: 1010,
        userName: "강시니어",
        userImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80",
        userHeadline: "Senior Developer",
        content: "작은 팀에서는 커밋 히스토리가 개발 과정을 보여주는 스토리텔링이 될 수 있어서 날것 그대로가 더 좋다고 생각합니다. 큰 팀에서는 정리된 히스토리가 코드 리뷰에 도움이 되고요.",
        createdAt: "2025-09-12 05:30:00",
        likeCount: 8,
        liked: false,
      },
      {
        id: 5,
        userId: 1011,
        userName: "윤프론트",
        userImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
        userHeadline: "Frontend Developer",
        content: "저는 개인적으로 squash merge를 선호하는데, rebase도 좋은 방법이네요. 다만 팀 컨벤션을 잘 맞추는 게 중요한 것 같아요.",
        createdAt: "2025-09-12 06:15:00",
        likeCount: 5,
        liked: false,
      },
      {
        id: 6,
        userId: 1012,
        userName: "오주니어",
        userHeadline: "Junior Developer",
        content: "신입 개발자 입장에서는 rebase가 처음엔 어렵더라고요. 하지만 연습하면서 git의 동작 원리를 더 잘 이해하게 됐습니다 👍",
        createdAt: "2025-09-12 07:00:00",
        likeCount: 3,
        liked: false,
      },
    ],
  },
};

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;
  const postData = mockPostData[postId as keyof typeof mockPostData];

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [sharedAiContent, setSharedAiContent] = React.useState<string>('');

  if (!postData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            게시글을 찾을 수 없습니다
          </h1>
          <p className="text-slate-600">
            요청하신 게시글이 존재하지 않거나 삭제되었습니다.
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
        content: `"${content}"에 대한 답변입니다.\n\n이 게시글은 기술 그 자체보다 그 기술을 활용한 비즈니스 모델이 더 중요하다는 점을 강조하고 있습니다. 코카콜라는 냉장 기술을 직접 개발하지 않았지만, 이를 활용해 글로벌 유통망을 구축하고 막대한 수익을 창출했습니다. 마찬가지로 Nvidia와 Apple은 반도체 기술을 활용해 혁신적인 제품과 생태계를 만들어냈습니다.\n\n핵심은 '기술 보유'보다 '기술 활용'이며, 이것이 진정한 비즈니스 가치를 만들어낸다는 것입니다.`,
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
          {...postData}
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
            title: postData.content,
          }}
        />
      </div>
    </div>
  );
}
