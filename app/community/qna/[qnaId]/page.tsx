'use client';

import * as React from 'react';
import { QnaDetail } from '@/components/ui/qna-detail';
import { AiChatPanel, Message } from '@/components/ui/ai-chat-panel';
import { useParams } from 'next/navigation';

// Mock data - 실제로는 API에서 가져올 데이터
const mockQnaData = {
  "10645": {
    qnaId: "10645",
    title: "AI개발 포트폴리오",
    description: "안녕하세요\n6개월간의 AI 부트캠프를 수료하였고 미니 프로젝트 4개와 최종 프로젝트 1개를 만들었습니다.\n이를 기반으로 입사 지원을 하려고 하는데 개발 직군은 처음 지원해봐서 여러 궁금한 점들이 많습니다.\n\n현재 제가 포트폴리오로 만들고자 하는 프로젝트는 ML과 LLM 합쳐서 3개정도 있고 이 중 2개는 미니 프로젝트, 1개는 최종 프로젝트입니다.\n\n포트폴리오 작성 형식이 궁금합니다.\n1) 노션 정리 -> 링크 or PDF 공유\n2) PPT로 제작 -> PDF 공유\n3) 단순 Github 링크 제출\n*이 경우 저희 부트캠프에서 사용한 제출저장소 외에 제가 개인 레포지토리를 만들어서 정리해놓아야 하는지\n*README 정리 방법(현재는 각각의 프로젝트가 각각의 레포지토리에 들어있어서 레포지토리 당 하나의 README가 노출되어 있습니다.)",
    createdAt: "2025-10-29 11:33:54",
    hashTagNames: "포트폴리오 취업",
    viewCount: 17,
    likeCount: 3,
    dislikeCount: 0,
    status: 0,
    isPublic: 1,
    answers: [
      {
        id: 1,
        userId: 2001,
        userName: "김시니어",
        userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        userHeadline: "Senior AI Engineer @ Tech Corp",
        content: "AI 개발자 포트폴리오는 다음과 같이 준비하시면 좋습니다:\n\n1. GitHub을 메인으로 사용하되, README를 상세하게 작성하세요\n- 프로젝트 개요, 기술 스택, 주요 기능\n- 데모 영상이나 스크린샷\n- 성능 지표 (정확도, 속도 등)\n- 회고 및 개선 사항\n\n2. 노션이나 블로그로 프로젝트 상세 설명을 보강하세요\n- 문제 정의와 해결 과정\n- 기술적 의사결정 이유\n- 트러블슈팅 경험\n\n3. 개인 레포지토리를 새로 만들어 정리하는 것을 추천드립니다\n- 코드 품질을 높이고\n- 문서화를 체계적으로 하세요\n\n포트폴리오는 '무엇을 만들었나'보다 '어떻게 문제를 해결했나'를 보여주는 것이 중요합니다.",
        createdAt: "2025-10-29 13:15:00",
        likeCount: 8,
        dislikeCount: 0,
        isAccepted: true,
        liked: false,
        disliked: false,
      },
      {
        id: 2,
        userId: 2002,
        userName: "이채용담당",
        userImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
        userHeadline: "Tech Recruiter",
        content: "채용 담당자 입장에서 말씀드리면:\n\n- PDF보다는 GitHub + 라이브 링크를 선호합니다\n- README가 잘 작성된 GitHub 레포를 높이 평가합니다\n- 프로젝트가 실제로 작동하는 것을 확인할 수 있으면 좋습니다\n\n특히 AI 프로젝트는 Jupyter Notebook이나 Colab 링크를 함께 제공하면 좋습니다.",
        createdAt: "2025-10-29 14:30:00",
        likeCount: 5,
        dislikeCount: 0,
        liked: false,
        disliked: false,
      },
      {
        id: 3,
        userId: 2003,
        userName: "박머신러닝",
        userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
        userHeadline: "ML Engineer @ AI Startup",
        content: "부트캠프 졸업생 입장에서 조언드립니다.\n\n저도 비슷한 고민을 했었는데, 결국 GitHub 개인 레포를 새로 만들어서 정리했습니다. 부트캠프 제출용 레포는 그대로 두고, 포트폴리오용 레포를 따로 만들었어요.\n\n각 프로젝트마다:\n- 왜 이 문제를 선택했는지\n- 어떤 접근 방식을 시도했는지\n- 최종적으로 어떤 결과를 얻었는지\n- 아쉬운 점과 개선 방향\n\n이렇게 4가지를 중심으로 README를 작성했더니 면접에서 좋은 반응을 얻었습니다 🙂",
        createdAt: "2025-10-29 16:45:00",
        likeCount: 11,
        dislikeCount: 0,
        liked: false,
        disliked: false,
      },
      {
        id: 4,
        userId: 2004,
        userName: "정데이터사이언티스트",
        userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
        userHeadline: "Data Scientist",
        content: "개인적으로는 노션으로 포트폴리오 페이지를 만드는 것도 추천드립니다. GitHub은 기술적인 상세 내용을, 노션은 전체 스토리와 시각적 자료를 담는 용도로 활용하면 좋아요.\n\n노션에는:\n- 프로젝트 타임라인\n- 주요 결과 시각화\n- 배운 점과 성장 과정\n- 기술 스택 인포그래픽\n\n이런 걸 넣으면 비전공자나 HR 담당자도 쉽게 이해할 수 있습니다.",
        createdAt: "2025-10-29 18:20:00",
        likeCount: 6,
        dislikeCount: 0,
        liked: false,
        disliked: false,
      },
      {
        id: 1,
        userId: 2005,
        userName: "장신입",
        userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
        userHeadline: "AI Engineer",
        content: "> 사용자 질문:\n> AI 개발자 포트폴리오를 어떻게 준비하면 좋을까요?\n\n> AI 답변:\n> AI 개발자 포트폴리오는 GitHub을 중심으로 구성하되, 프로젝트의 '문제 해결 과정'을 강조하는 것이 중요합니다. 각 프로젝트마다 왜 이 문제를 선택했는지, 어떤 접근 방식을 시도했는지, 최종 결과와 성능 지표는 무엇인지를 명확히 보여주세요. 특히 AI 프로젝트는 모델의 정확도, 학습 시간, 개선 과정 등 정량적 지표를 포함하면 신뢰도가 높아집니다.\n\n저도 이 조언대로 포트폴리오를 재정비했더니 면접 제안이 확실히 늘었습니다! 특히 '문제 해결 과정'을 README에 자세히 적은 게 면접관들의 질문을 유도해서 좋더라고요. 부트캠프 제출용 레포는 그대로 두고, 채용용 개인 레포를 따로 만드는 것도 추천드립니다.",
        createdAt: "2025-10-29 12:45:00",
        likeCount: 22,
        dislikeCount: 0,
        liked: false,
        disliked: false,
      },
    ],
  },
  "10644": {
    qnaId: "10644",
    title: "진로 설계를 어떻게 해야할지 모르겠어요",
    description: "안녕하세요 현재 국립 4년제 전자공학과에 재학중인 학생입니다.\n우선 나이는 23살이고 막학기를 다니고 있는데 진로에 대한 고민이 뒤늦게 들어 조언을 구하고자 글을 씁니다. \n참고로 학점은 2점대로 매우 낮습니다ㅜㅜ\n선배님들은 진로 설계를 어떻게 하셨는지 여쭙고 싶습니다.\n막연히 개발자가 되고싶다는 생각만 조금 있는 상태인데요, 개발자에도 종류가 매우 다양하더라고요..\n\n1. 백엔드나 프론트엔드 등등 다양한 분야중에서 어떻게 본인의 분야를 찾게 되셨는지 궁급합니다.\n\n2. 전자공학과를 졸업하면 그냥 개발자보다도 전공인 회로 등을 연관시켜 취업하는 것이 낫다고 하는데 어떻게 생각하시나요?\n\n3. 개발자가 된다면 지방에서 취업하기 많이 어려울까요?\n\n4. 포트폴리오는 부트캠프 등을 다니며 쌓는건가요?\n\n위에 적은 질문 외에도 도움이 될만한 정보가 있으시다면 적어주시면 감사하겠습니다.\n학점도 낮고 해놓은 것도 없는데 기초적인 질문을 드려 부끄럽지만 시간 내주셔서 짧게라도 답변해주시면 정말 감사하겠습니다.",
    createdAt: "2025-10-29 11:33:28",
    hashTagNames: "취업 취업-고민 전자공학과 진로상담 진로설정",
    viewCount: 25,
    likeCount: 2,
    dislikeCount: 0,
    status: 0,
    isPublic: 1,
    answers: [
      {
        id: 3,
        userId: 2003,
        userName: "박멘토",
        userImage: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&q=80",
        userHeadline: "Engineering Manager",
        content: "진로 고민 많으시겠네요. 하나씩 답변드리겠습니다.\n\n1. 분야 선택: 직접 해보는 게 가장 중요합니다\n- 토이 프로젝트를 여러 개 만들어보세요\n- 백엔드, 프론트엔드, 모바일 등을 모두 경험해보고\n- 가장 재미있고 잘 맞는 분야를 선택하세요\n\n2. 전공 활용: 임베디드나 IoT 분야도 좋은 선택입니다\n- 하드웨어+소프트웨어 지식을 모두 활용할 수 있습니다\n- 하지만 순수 소프트웨어 개발자도 충분히 가능합니다\n\n3. 지방 취업: 가능하지만 기회는 적습니다\n- 리모트 워크를 지원하는 회사를 찾아보세요\n- 처음엔 수도권에서 경력을 쌓는 것도 방법입니다\n\n4. 포트폴리오: 독학으로도 충분히 가능합니다\n- 부트캠프는 선택사항입니다\n- GitHub에 프로젝트를 꾸준히 올리세요\n\n학점은 낮지만, 실력과 열정으로 충분히 극복할 수 있습니다. 지금부터라도 열심히 준비하세요!",
        createdAt: "2025-10-29 23:30:23",
        likeCount: 12,
        dislikeCount: 0,
        isAccepted: true,
        liked: false,
        disliked: false,
      },
      {
        id: 5,
        userId: 2005,
        userName: "오전자공학",
        userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
        userHeadline: "Embedded Software Engineer",
        content: "전자공학과 출신으로서 말씀드립니다. 저는 임베디드 쪽으로 갔는데요, 전공을 살리면서도 개발을 할 수 있어서 만족하고 있습니다.\n\n전자공학과라면:\n1. 임베디드 시스템 개발 (펌웨어)\n2. IoT 플랫폼 개발\n3. 로보틱스 소프트웨어\n4. 자율주행 시스템\n\n이런 분야들이 전공과 잘 맞습니다. 하드웨어 이해도가 높으면 디버깅할 때도 유리하고요.\n\n다만 순수 소프트웨어로 가고 싶다면 그것도 충분히 가능합니다. 학점보다는 실력이 중요하니까요!",
        createdAt: "2025-10-30 09:15:00",
        likeCount: 8,
        dislikeCount: 0,
        liked: false,
        disliked: false,
      },
      {
        id: 6,
        userId: 2006,
        userName: "김경력직",
        userImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80",
        userHeadline: "Senior Developer",
        content: "지방 취업 관련해서 현실적인 조언 드립니다.\n\n지방에도 좋은 기업들이 있긴 하지만, 선택의 폭이 훨씬 좁은 건 사실입니다. 제 추천은:\n\n1. 첫 직장은 수도권에서 2-3년 경력 쌓기\n2. 경력이 쌓이면 원격근무 가능한 회사로 이직\n3. 또는 지방 기업 중 좋은 곳 찾기\n\n요즘은 원격근무 문화가 많이 확산되어서, 경력만 있다면 지방에 살면서도 수도권 회사에서 일할 수 있습니다.",
        createdAt: "2025-10-30 14:40:00",
        likeCount: 14,
        dislikeCount: 0,
        liked: false,
        disliked: false,
      },
      {
        id: 1,
        userId: 2007,
        userName: "윤전자공학",
        userImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&q=80",
        userHeadline: "Software Engineer",
        content: "> 사용자 질문:\n> 전자공학과 학생인데 개발자 진로를 어떻게 선택해야 할까요?\n\n> AI 답변:\n> 진로 선택은 직접 경험해보는 것이 가장 중요합니다. 토이 프로젝트로 백엔드, 프론트엔드, 모바일 등을 모두 시도해보고 가장 재미있고 잘 맞는 분야를 선택하세요. 전자공학과 배경은 임베디드나 IoT 분야에서 강점이 될 수 있지만, 순수 소프트웨어 개발도 충분히 가능합니다. 학점보다는 실력과 열정이 더 중요하며, 포트폴리오는 독학으로도 충분히 쌓을 수 있습니다.\n\n완전 공감합니다. 저도 전자공학과 출신인데, 처음엔 임베디드 해야 하나 고민했지만 결국 웹 개발로 왔어요. 다양한 분야를 직접 만져보는 게 답인 것 같습니다. 학점은 정말 걱정 안 하셔도 돼요. 저도 3점대 초반이었는데 포트폴리오로 극복했습니다!",
        createdAt: "2025-10-29 20:20:00",
        likeCount: 19,
        dislikeCount: 0,
        liked: false,
        disliked: false,
      },
    ],
  },
  "10643": {
    qnaId: "10643",
    title: "취업 준비에 대해 고민중인 3학년입니다",
    description: "\n백앤드, 보안, 클라우드 쪽을 생각중인 학생입니다. \n1년 반동안 집중적으로 준비해서 4학년 졸업과 동시에 취업이 목표인데 도저히 준비를 어떡해 해야하는지 모르겠습니다.\n보안이나 클라우드 쪽이 더 마음이 가는데 신입은 아무래도 취업자리가 없기도 해서 백앤드도 같이 생각중입니다.\n풀스택은 제가 프론트쪽이 너무 안맞아서 백앤드만 하는게 좋다고 생각이 들었습니다.\n\n1년 반동안 빡세게 하고 싶은데 처음 가이드라인이랑 어떡해 준비하면 좋을지 조언해주시면 감사합니다. ",
    createdAt: "2025-10-29 06:10:20",
    hashTagNames: "백앤드 클라우드-서버 보안",
    viewCount: 24,
    likeCount: 1,
    dislikeCount: 0,
    status: 0,
    isPublic: 1,
    answers: [
      {
        id: 4,
        userId: 2004,
        userName: "최백엔드",
        userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
        userHeadline: "Backend Engineer @ Startup",
        content: "1년 반이면 충분한 시간입니다. 다음 로드맵을 추천드립니다:\n\n1-3개월: 기초 다지기\n- 프로그래밍 언어 마스터 (Python, Java, Go 중 선택)\n- 자료구조, 알고리즘 학습\n- 네트워크, OS 기초\n\n4-6개월: 백엔드 심화\n- 웹 프레임워크 (Spring, Django, Express 등)\n- 데이터베이스 (SQL, NoSQL)\n- REST API 설계\n- Git, Docker 학습\n\n7-9개월: 클라우드/보안\n- AWS/GCP 기초\n- CI/CD 파이프라인\n- 보안 기초 (OWASP Top 10)\n- 쿠버네티스 입문\n\n10-12개월: 프로젝트 & 취업 준비\n- 포트폴리오 프로젝트 2-3개\n- 기술 블로그 운영\n- 코딩테스트 준비\n\n13-18개월: 심화 & 취업 활동\n- 오픈소스 기여\n- 네트워킹\n- 면접 준비\n\n백엔드로 시작해서 경력을 쌓은 후 보안이나 클라우드로 전문화하는 것도 좋은 전략입니다.",
        createdAt: "2025-10-29 19:19:47",
        likeCount: 15,
        dislikeCount: 0,
        isAccepted: true,
        liked: false,
        disliked: false,
      },
      {
        id: 7,
        userId: 2007,
        userName: "송클라우드",
        userImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
        userHeadline: "Cloud Engineer @ Enterprise",
        content: "클라우드 엔지니어로 일하고 있는 입장에서 조언드립니다.\n\n신입으로 클라우드/보안 직무에 바로 가기는 어려운 게 맞습니다. 하지만 불가능한 건 아니에요.\n\n전략:\n1. 백엔드 개발 기본기를 탄탄히\n2. 개인 프로젝트를 클라우드에 배포하면서 AWS/GCP 경험 쌓기\n3. 자격증 취득 (AWS Solutions Architect 등)\n4. 보안은 OWASP, 인증/인가 등 백엔드 개발하면서 자연스럽게 학습\n\n그러면 백엔드 주니어로 입사해서, 내부에서 DevOps나 보안 팀으로 이동하는 경로를 만들 수 있습니다.",
        createdAt: "2025-10-29 21:05:00",
        likeCount: 9,
        dislikeCount: 0,
        liked: false,
        disliked: false,
      },
      {
        id: 8,
        userId: 2008,
        userName: "안보안전문가",
        userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        userHeadline: "Security Engineer",
        content: "보안 쪽으로 가고 싶다면 백엔드 개발을 먼저 하는 게 정말 도움이 됩니다.\n\n보안은 결국 '무엇을 보호하느냐'가 중요한데, 백엔드 시스템, API, 데이터베이스를 이해해야 제대로 된 보안 설계가 가능합니다.\n\n추천 학습 경로:\n- 웹 취약점 (XSS, CSRF, SQL Injection)\n- 인증/인가 구현 (JWT, OAuth)\n- HTTPS, TLS/SSL\n- 보안 코딩 가이드\n\n이런 걸 백엔드 개발하면서 직접 구현해보면, 나중에 보안 직무로 전환할 때 큰 강점이 됩니다 💪",
        createdAt: "2025-10-30 10:30:00",
        likeCount: 13,
        dislikeCount: 0,
        liked: false,
        disliked: false,
      },
      {
        id: 1,
        userId: 2009,
        userName: "이주니어",
        userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
        userHeadline: "Backend Developer",
        content: "> 사용자 질문:\n> 1년 반 동안 백엔드, 보안, 클라우드를 어떻게 준비하면 좋을까요?\n\n> AI 답변:\n> 1년 반은 충분한 시간입니다. 백엔드를 기본으로 하되 클라우드와 보안을 함께 학습하는 전략을 추천합니다. 초반 3개월은 프로그래밍 언어와 자료구조/알고리즘 기초를 다지고, 중반 6개월은 웹 프레임워크와 데이터베이스를 집중 학습하세요. 후반에는 AWS/GCP와 보안 기초(OWASP)를 학습하며 포트폴리오 프로젝트를 완성하세요. 백엔드로 입사 후 내부에서 DevOps나 보안 팀으로 전환하는 것도 좋은 경로입니다.\n\n정말 구체적인 로드맵 감사합니다! 저도 비슷한 고민이었는데, AI 조언대로 백엔드 베이스를 탄탄히 하고 클라우드/보안을 곁들이는 방향으로 가려고 합니다. 특히 '내부 전환' 전략이 현실적이네요. 1년 반 빡세게 달려보겠습니다 🔥",
        createdAt: "2025-10-29 16:50:00",
        likeCount: 16,
        dislikeCount: 0,
        liked: false,
        disliked: false,
      },
    ],
  },
};

export default function QnaDetailPage() {
  const params = useParams();
  const qnaId = params.qnaId as string;
  const qnaData = mockQnaData[qnaId as keyof typeof mockQnaData];

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [sharedAiContent, setSharedAiContent] = React.useState<string>('');

  if (!qnaData) {
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
        content: `"${content}"에 대한 답변입니다.\n\n이 질문은 ${qnaData.hashTagNames?.split(' ')[0]}에 관한 것으로, 많은 개발자들이 고민하는 주제입니다.\n\n현재 ${qnaData.answers?.length || 0}개의 답변이 달려있으며, 커뮤니티에서 ${qnaData.viewCount}번 조회되었습니다. 채택된 답변을 참고하시면 도움이 될 것 같습니다.\n\n추가로 궁금하신 점이 있으시면 언제든지 물어보세요!`,
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
          {...qnaData}
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
