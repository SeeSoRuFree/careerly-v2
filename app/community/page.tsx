'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CommunityFeedCard } from '@/components/ui/community-feed-card';
import { QnaCard } from '@/components/ui/qna-card';
import { PromotionCard } from '@/components/ui/promotion-card';
import { Chip } from '@/components/ui/chip';
import { RecommendedPostsPanel } from '@/components/ui/recommended-posts-panel';
import { RecommendedFollowersPanel } from '@/components/ui/recommended-followers-panel';
import { LoadMore } from '@/components/ui/load-more';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Users, X, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInfinitePosts, useInfiniteQuestions } from '@/lib/api';
import { QnaDetail } from '@/components/ui/qna-detail';
import type { QuestionListItem, PaginatedPostResponse, PaginatedQuestionResponse } from '@/lib/api';

// Mock data for sections that don't have APIs yet
const mockFeedDataBackup = [
  {
    "comments": [
      {
        "seq": 21,
        "postId": 122238,
        "title": null,
        "description": "냉장 기술로 돈을 가장 크게 버는 회사는, 냉장 기술을 보유한 회사도 아니고 냉장고 회사도 아니고 코카콜라라고한다. 같은 것으로, 금으로 가장 돈을 많이 버는 회사는 금광 회사도 아니고 청바지 회사도 아니고 Nvidia나 애플같은데라는 사실.",
        "descriptionHtml": "<p>냉장 기술로 돈을 가장 크게 버는 회사는, 냉장 기술을 보유한 회사도 아니고 냉장고 회사도 아니고 코카콜라라고한다. 같은 것으로, 금으로 가장 돈을 많이 버는 회사는 금광 회사도 아니고 청바지 회사도 아니고 Nvidia나 애플같은데라는 사실.</p>",
        "userId": 38284,
        "createdAt": "2025-09-12 04:48:02",
        "updatedAt": "2025-09-12 04:48:02",
        "postType": 0,
        "originUrl": null,
        "photoUrl": null,
        "articleId": null,
        "isDisplay": null,
        "name": null,
        "domain": null,
        "likeCount": 2,
        "repostCount": 0,
        "quoteRepostCount": 0,
        "shareCount": 0,
        "saveCount": 0,
        "postViewCount": 1628,
        "userProfile": {
          "id": 39820,
          "name": "골빈해커",
          "image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg",
          "headline": "Chief Maker",
          "description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "admin_note": "",
          "links": null,
          "hashtags": null,
          "long_description": null,
          "created_at": "2020-07-08 06:16:56",
          "updated_at": "2024-06-14 03:32:01",
          "user_id": 38284,
          "note": "",
          "title": "Chief Maker",
          "short_description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "post_count": 0,
          "subscriber_count": 0,
          "small_image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg"
        },
        "repliesCount": 0,
        "sampledLikedUsers": []
      }
    ],
    "postId": 122238,
    "imageUrl": ["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"],
    "article": null,
    "cardType": "comment-first",
    "feedType": "RECOMMENDED.INTERESTS",
    "selectedReason": null,
    "payload": {}
  },
  {
    "comments": [
      {
        "seq": 22,
        "postId": 122235,
        "title": null,
        "description": "오늘의 탐라는 git rebase로군요.\n\n작은 팀에서는 rebase없이 그냥 날것의 커밋을 공유하는게 좋다고 생각하고, 큰 팀에서는 로컬 커밋에서만 자잘한 커밋을 약간 정리하는 차원에서 rebase를 하는게 좋다고 생각합니다.",
        "descriptionHtml": "<p>오늘의 탐라는 git rebase로군요.</p><p><br></p><p>작은 팀에서는 rebase없이 그냥 날것의 커밋을 공유하는게 좋다고 생각하고, 큰 팀에서는 로컬 커밋에서만 자잘한 커밋을 약간 정리하는 차원에서 rebase를 하는게 좋다고 생각합니다.</p>",
        "userId": 38284,
        "createdAt": "2025-09-12 03:38:29",
        "updatedAt": "2025-09-12 03:38:29",
        "postType": 0,
        "originUrl": null,
        "photoUrl": null,
        "articleId": null,
        "isDisplay": null,
        "name": null,
        "domain": null,
        "likeCount": 4,
        "repostCount": 0,
        "quoteRepostCount": 0,
        "shareCount": 0,
        "saveCount": 0,
        "postViewCount": 1527,
        "userProfile": {
          "id": 39820,
          "name": "골빈해커",
          "image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg",
          "headline": "Chief Maker",
          "description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "admin_note": "",
          "links": null,
          "hashtags": null,
          "long_description": null,
          "created_at": "2020-07-08 06:16:56",
          "updated_at": "2024-06-14 03:32:01",
          "user_id": 38284,
          "note": "",
          "title": "Chief Maker",
          "short_description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "post_count": 0,
          "subscriber_count": 0,
          "small_image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg"
        },
        "repliesCount": 0,
        "sampledLikedUsers": []
      }
    ],
    "postId": 122235,
    "imageUrl": [],
    "article": null,
    "cardType": "comment-first",
    "feedType": "RECOMMENDED.INTERESTS",
    "selectedReason": null,
    "payload": {}
  },
  {
    "comments": [
      {
        "seq": 23,
        "postId": 122225,
        "title": null,
        "description": "애플빠로써, 애플의 이번 아이폰 발표는 좀 별로여서 진짜 20년만에 포스팅도 안했는데, 다시 찬찬히 생각해보니 이번에 아이폰 또 역대급으로 팔릴 것 같음.\n\n일단 아이폰 프로. 유튜버, 틱톡커를 대상으로 정밀 타격해서 만든 것 같음. 아마 왠만한 프로 크리에이터는 대부분 다 살 것 같음.\n\n아이폰 에어. 디자인이 Liquid Glass 통합 경험을 타겟하고 만든 것 같음. 아주 힙함. 사고 싶음. 프로보다는 이게 프리미엄 라인 같은 느낌으로 많이 팔릴 것 같음.\n\n일반 아이폰. 성능만 봤을 땐 가성비 끝내줌. 근데 좀 비싸긴 해서 어떨지 모르겠음. 그동안 팔린 만큼은 팔릴 것 같음.\n\n워치와 에어팟. 웨어러블이 어디까지 할 수 있는지 이번에도 한계를 뛰어넘음. 건강에 미친 현대인들 타겟 진짜 끝내주게 함. 에어팟은 아이폰이나 워치 안쓰는 사람들도 건강 목적으로 살테니 더 많이 팔릴 것 같음.\n\n이번에도 역시 엔지니어링의 진수는 보여줬는데, 아쉽게도 소프트웨어는 한계에 봉착한듯. 이번에 헤어포스원 안나온게 그것때문인가?\n\nLiquid Glass를 대대적으로 내 놓은 것은 아무래도 AR/VR에서 그 진가를 보여주려고 하는 것 같은데, 빨리 다음세대 비전 프로나 그 이상의 무엇인가가 나오길 기대해봄.",
        "descriptionHtml": "<p>애플빠로써, 애플의 이번 아이폰 발표는 좀 별로여서 진짜 20년만에 포스팅도 안했는데, 다시 찬찬히 생각해보니 이번에 아이폰 또 역대급으로 팔릴 것 같음.</p><p><br></p><p>일단 아이폰 프로. 유튜버, 틱톡커를 대상으로 정밀 타격해서 만든 것 같음. 아마 왠만한 프로 크리에이터는 대부분 다 살 것 같음.</p><p><br></p><p>아이폰 에어. 디자인이 Liquid Glass 통합 경험을 타겟하고 만든 것 같음. 아주 힙함. 사고 싶음. 프로보다는 이게 프리미엄 라인 같은 느낌으로 많이 팔릴 것 같음.</p><p><br></p><p>일반 아이폰. 성능만 봤을 땐 가성비 끝내줌. 근데 좀 비싸긴 해서 어떨지 모르겠음. 그동안 팔린 만큼은 팔릴 것 같음.</p><p><br></p><p>워치와 에어팟. 웨어러블이 어디까지 할 수 있는지 이번에도 한계를 뛰어넘음. 건강에 미친 현대인들 타겟 진짜 끝내주게 함. 에어팟은 아이폰이나 워치 안쓰는 사람들도 건강 목적으로 살테니 더 많이 팔릴 것 같음.</p><p><br></p><p>이번에도 역시 엔지니어링의 진수는 보여줬는데, 아쉽게도 소프트웨어는 한계에 봉착한듯. 이번에 헤어포스원 안나온게 그것때문인가?</p><p><br></p><p>Liquid Glass를 대대적으로 내 놓은 것은 아무래도 AR/VR에서 그 진가를 보여주려고 하는 것 같은데, 빨리 다음세대 비전 프로나 그 이상의 무엇인가가 나오길 기대해봄.</p>",
        "userId": 38284,
        "createdAt": "2025-09-11 14:06:25",
        "updatedAt": "2025-09-11 14:06:25",
        "postType": 0,
        "originUrl": null,
        "photoUrl": null,
        "articleId": null,
        "isDisplay": null,
        "name": null,
        "domain": null,
        "likeCount": 3,
        "repostCount": 0,
        "quoteRepostCount": 0,
        "shareCount": 0,
        "saveCount": 1,
        "postViewCount": 1376,
        "userProfile": {
          "id": 39820,
          "name": "골빈해커",
          "image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg",
          "headline": "Chief Maker",
          "description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "admin_note": "",
          "links": null,
          "hashtags": null,
          "long_description": null,
          "created_at": "2020-07-08 06:16:56",
          "updated_at": "2024-06-14 03:32:01",
          "user_id": 38284,
          "note": "",
          "title": "Chief Maker",
          "short_description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "post_count": 0,
          "subscriber_count": 0,
          "small_image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg"
        },
        "repliesCount": 0,
        "sampledLikedUsers": []
      }
    ],
    "postId": 122225,
    "imageUrl": ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80", "https://images.unsplash.com/photo-1694048095408-1f4d6c5e4cf0?w=800&q=80"],
    "article": null,
    "cardType": "comment-first",
    "feedType": "RECOMMENDED.INTERESTS",
    "selectedReason": null,
    "payload": {}
  },
  {
    "comments": [
      {
        "seq": 24,
        "postId": 122223,
        "title": null,
        "description": "특허가 오픈소스 프로젝트의 방패이자 무기가 된다는 것이 참으로 아이러니하다.",
        "descriptionHtml": "<p>특허가 오픈소스 프로젝트의 방패이자 무기가 된다는 것이 참으로 아이러니하다.</p>",
        "userId": 38284,
        "createdAt": "2025-09-11 13:20:05",
        "updatedAt": "2025-09-11 13:20:05",
        "postType": 0,
        "originUrl": null,
        "photoUrl": null,
        "articleId": null,
        "isDisplay": null,
        "name": null,
        "domain": null,
        "likeCount": 0,
        "repostCount": 0,
        "quoteRepostCount": 0,
        "shareCount": 0,
        "saveCount": 0,
        "postViewCount": 1938,
        "userProfile": {
          "id": 39820,
          "name": "골빈해커",
          "image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg",
          "headline": "Chief Maker",
          "description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "admin_note": "",
          "links": null,
          "hashtags": null,
          "long_description": null,
          "created_at": "2020-07-08 06:16:56",
          "updated_at": "2024-06-14 03:32:01",
          "user_id": 38284,
          "note": "",
          "title": "Chief Maker",
          "short_description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "post_count": 0,
          "subscriber_count": 0,
          "small_image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg"
        },
        "repliesCount": 0,
        "sampledLikedUsers": []
      }
    ],
    "postId": 122223,
    "imageUrl": [],
    "article": null,
    "cardType": "comment-first",
    "feedType": "RECOMMENDED.INTERESTS",
    "selectedReason": null,
    "payload": {}
  },
  {
    "comments": [
      {
        "seq": 25,
        "postId": 122201,
        "title": null,
        "description": "진짜로 자랑하고 싶은게 하나 있는데 괜히 \"해치웠나?\" 효과 날까봐 못하겠다. 🤣 결과 완전히 나오면 자랑해야지. 커밍 쑨~ 자랑거리 많이 생기게 해주세요. 🙏",
        "descriptionHtml": "<p>진짜로 자랑하고 싶은게 하나 있는데 괜히 \"해치웠나?\" 효과 날까봐 못하겠다. 🤣 결과 완전히 나오면 자랑해야지. 커밍 쑨~ 자랑거리 많이 생기게 해주세요. 🙏</p>",
        "userId": 38284,
        "createdAt": "2025-09-10 07:01:52",
        "updatedAt": "2025-09-10 07:01:52",
        "postType": 0,
        "originUrl": null,
        "photoUrl": null,
        "articleId": null,
        "isDisplay": null,
        "name": null,
        "domain": null,
        "likeCount": 2,
        "repostCount": 0,
        "quoteRepostCount": 0,
        "shareCount": 0,
        "saveCount": 0,
        "postViewCount": 1959,
        "userProfile": {
          "id": 39820,
          "name": "골빈해커",
          "image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg",
          "headline": "Chief Maker",
          "description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "admin_note": "",
          "links": null,
          "hashtags": null,
          "long_description": null,
          "created_at": "2020-07-08 06:16:56",
          "updated_at": "2024-06-14 03:32:01",
          "user_id": 38284,
          "note": "",
          "title": "Chief Maker",
          "short_description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "post_count": 0,
          "subscriber_count": 0,
          "small_image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg"
        },
        "repliesCount": 0,
        "sampledLikedUsers": []
      }
    ],
    "postId": 122201,
    "imageUrl": [],
    "article": null,
    "cardType": "comment-first",
    "feedType": "RECOMMENDED.INTERESTS",
    "selectedReason": null,
    "payload": {}
  },
  {
    "comments": [
      {
        "seq": 26,
        "postId": 122200,
        "title": null,
        "description": "우리 회사 첫번째 특허 출원 완료! 🎉\n\n💡실시간 음성 대화를 위한 xxx 이용 및 xxx 기반 대화 생성 장치 및 방법\n\n오늘날의 대화형 AI 시스템은 단순히 단편적인 질의에 응답하는 것을 넘어, 이전 대화의 내용을 기억하고 맥락을 유지하며 일관성 있는 상호작용을 제공하는 것을 목표…대화가 길어질수록 처리해야 할 데이터의 양이 기하급수적으로 증가하여, 벡터를 생성하고 검색하는 과정에서 상당한 응답지연(latency)을 유발하는 문제…모든 대화 로그를 벡터 형태로 저장하고 인덱싱하는 것은 상당한 저장 공간과 연산 비용을 요구하여 효율성이 저하…사용자의 수준이나 대화의 상황에 따라 상호작용 방식을 동적으로 변경하기 어려워 개인화된 경험을 제공하는 데 한계…음성을 이용한 실시간 대화 환경에서는 AI가 응답하는 도중에 사용자가 끼어드는(barge-in) 상황을 자연스럽게 처리하지 못하거나…원활한 상호작용이 어려운 기술적 한계가 존재…\n\n…종래 기술의 문제점인 응답 지연 및 자원 비효율성, 프롬프트 관리의 경직성, 그리고 부자연스러운 실시간 상호작용 문제를 종합적으로 해결할 수 있는…새로운 시스템 아키텍처",
        "descriptionHtml": "<p>우리 회사 첫번째 특허 출원 완료! 🎉</p><p><br></p><p>💡실시간 음성 대화를 위한 xxx 이용 및 xxx 기반 대화 생성 장치 및 방법</p><p><br></p><p>오늘날의 대화형 AI 시스템은 단순히 단편적인 질의에 응답하는 것을 넘어,&nbsp;이전 대화의 내용을 기억하고 맥락을 유지하며 일관성 있는 상호작용을 제공하는 것을 목표…대화가 길어질수록 처리해야 할 데이터의 양이 기하급수적으로 증가하여, 벡터를 생성하고 검색하는 과정에서 상당한 응답지연(latency)을 유발하는 문제…모든 대화 로그를 벡터 형태로 저장하고 인덱싱하는 것은 상당한 저장 공간과 연산 비용을 요구하여 효율성이 저하…사용자의 수준이나 대화의 상황에 따라 상호작용 방식을 동적으로 변경하기 어려워 개인화된 경험을 제공하는 데 한계…음성을 이용한 실시간 대화 환경에서는 AI가 응답하는 도중에 사용자가 끼어드는(barge-in) 상황을 자연스럽게 처리하지 못하거나…원활한 상호작용이 어려운 기술적 한계가 존재…</p><p><br></p><p>…종래 기술의 문제점인&nbsp;응답 지연 및 자원 비효율성, 프롬프트 관리의 경직성, 그리고 부자연스러운 실시간 상호작용 문제를 종합적으로 해결할 수 있는…새로운 시스템 아키텍처</p>",
        "userId": 38284,
        "createdAt": "2025-09-10 06:40:26",
        "updatedAt": "2025-09-10 06:40:26",
        "postType": 0,
        "originUrl": null,
        "photoUrl": null,
        "articleId": null,
        "isDisplay": null,
        "name": null,
        "domain": null,
        "likeCount": 2,
        "repostCount": 0,
        "quoteRepostCount": 0,
        "shareCount": 0,
        "saveCount": 0,
        "postViewCount": 1362,
        "userProfile": {
          "id": 39820,
          "name": "골빈해커",
          "image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg",
          "headline": "Chief Maker",
          "description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "admin_note": "",
          "links": null,
          "hashtags": null,
          "long_description": null,
          "created_at": "2020-07-08 06:16:56",
          "updated_at": "2024-06-14 03:32:01",
          "user_id": 38284,
          "note": "",
          "title": "Chief Maker",
          "short_description": "Code addict, AI/ML believer, 25+ years' coding experienced start-up guy, Built a unicorn and building another big one!",
          "post_count": 0,
          "subscriber_count": 0,
          "small_image_url": "https://publy-cdn.s3.ap-northeast-2.amazonaws.com/user-uploaded/38284/2023.04/a1ac5346e0b9226ba4179ec02245cde386659a84e8b5e015849f588179f0d86e.jpeg"
        },
        "repliesCount": 0,
        "sampledLikedUsers": []
      }
    ],
    "postId": 122200,
    "imageUrl": ["https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80"],
    "article": null,
    "cardType": "comment-first",
    "feedType": "RECOMMENDED.INTERESTS",
    "selectedReason": null,
    "payload": {}
  }
];

const mockQnaDataBackup = [
  {
    "id": 10645,
    "title": "AI개발 포트폴리오",
    "description": "안녕하세요\n6개월간의 AI 부트캠프를 수료하였고 미니 프로젝트 4개와 최종 프로젝트 1개를 만들었습니다.\n이를 기반으로 입사 지원을 하려고 하는데 개발 직군은 처음 지원해봐서 여러 궁금한 점들이 많습니다.\n\n현재 제가 포트폴리오로 만들고자 하는 프로젝트는 ML과 LLM 합쳐서 3개정도 있고 이 중 2개는 미니 프로젝트, 1개는 최종 프로젝트입니다.\n\n포트폴리오 작성 형식이 궁금합니다.\n1) 노션 정리 -> 링크 or PDF 공유\n2) PPT로 제작 -> PDF 공유\n3) 단순 Github 링크 제출\n*이 경우 저희 부트캠프에서 사용한 제출저장소 외에 제가 개인 레포지토리를 만들어서 정리해놓아야 하는지\n*README 정리 방법(현재는 각각의 프로젝트가 각각의 레포지토리에 들어있어서 레포지토리 당 하나의 README가 노출되어 있습니다.)",
    "createdAt": "2025-10-29 11:33:54",
    "updatedAt": "2025-10-29 11:33:54",
    "status": 0,
    "isPublic": 0,
    "tagIds": "9",
    "hashTagNames": "포트폴리오 취업",
    "answerCount": 0,
    "commentCount": 0,
    "likeCount": 0,
    "dislikeCount": 0,
    "viewCount": 17,
    "questionPollId": null,
    "contentUpdatedAt": "2025-10-29 11:33:54",
    "updatedReason": 0,
    "contentUpdatedUserName": "익명"
  },
  {
    "id": 10644,
    "title": "진로 설계를 어떻게 해야할지 모르겠어요",
    "description": "안녕하세요 현재 국립 4년제 전자공학과에 재학중인 학생입니다.\n우선 나이는 23살이고 막학기를 다니고 있는데 진로에 대한 고민이 뒤늦게 들어 조언을 구하고자 글을 씁니다. \n참고로 학점은 2점대로 매우 낮습니다ㅜㅜ\n선배님들은 진로 설계를 어떻게 하셨는지 여쭙고 싶습니다.\n막연히 개발자가 되고싶다는 생각만 조금 있는 상태인데요, 개발자에도 종류가 매우 다양하더라고요..\n\n1. 백엔드나 프론트엔드 등등 다양한 분야중에서 어떻게 본인의 분야를 찾게 되셨는지 궁급합니다.\n\n2. 전자공학과를 졸업하면 그냥 개발자보다도 전공인 회로 등을 연관시켜 취업하는 것이 낫다고 하는데 어떻게 생각하시나요?\n\n3. 개발자가 된다면 지방에서 취업하기 많이 어려울까요?\n\n4. 포트폴리오는 부트캠프 등을 다니며 쌓는건가요?\n\n위에 적은 질문 외에도 도움이 될만한 정보가 있으시다면 적어주시면 감사하겠습니다.\n학점도 낮고 해놓은 것도 없는데 기초적인 질문을 드려 부끄럽지만 시간 내주셔서 짧게라도 답변해주시면 정말 감사하겠습니다.",
    "createdAt": "2025-10-29 11:33:28",
    "updatedAt": "2025-10-29 11:33:28",
    "status": 0,
    "isPublic": 0,
    "tagIds": "9",
    "hashTagNames": "취업 취업-고민 전자공학과 진로상담 진로설정",
    "answerCount": 1,
    "commentCount": 2,
    "likeCount": 0,
    "dislikeCount": 0,
    "viewCount": 25,
    "questionPollId": null,
    "contentUpdatedAt": "2025-10-29 23:30:23",
    "updatedReason": 5,
    "contentUpdatedUserName": "aigoia"
  },
  {
    "id": 10643,
    "title": "취업 준비에 대해 고민중인 3학년입니다",
    "description": "\n백앤드, 보안, 클라우드 쪽을 생각중인 학생입니다. \n1년 반동안 집중적으로 준비해서 4학년 졸업과 동시에 취업이 목표인데 도저히 준비를 어떡해 해야하는지 모르겠습니다.\n보안이나 클라우드 쪽이 더 마음이 가는데 신입은 아무래도 취업자리가 없기도 해서 백앤드도 같이 생각중입니다.\n풀스택은 제가 프론트쪽이 너무 안맞아서 백앤드만 하는게 좋다고 생각이 들었습니다.\n\n1년 반동안 빡세게 하고 싶은데 처음 가이드라인이랑 어떡해 준비하면 좋을지 조언해주시면 감사합니다. ",
    "createdAt": "2025-10-29 06:10:20",
    "updatedAt": "2025-10-29 06:10:20",
    "status": 0,
    "isPublic": 0,
    "tagIds": "9",
    "hashTagNames": "백앤드 클라우드-서버 보안",
    "answerCount": 1,
    "commentCount": 0,
    "likeCount": 0,
    "dislikeCount": 0,
    "viewCount": 24,
    "questionPollId": null,
    "contentUpdatedAt": "2025-10-29 19:19:47",
    "updatedReason": 3,
    "contentUpdatedUserName": "aigoia"
  }
];

// Mock promotion data
const mockPromotionData = [
  {
    title: "2024 개발자 채용 박람회",
    description: "국내 최대 규모의 개발자 채용 박람회에 참여하세요. 100개 이상의 기업이 참가하며, 현장 면접 및 채용 상담이 진행됩니다.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80",
    company: "Career Fair Inc.",
    category: "채용 이벤트",
    tags: ["채용", "개발자", "박람회", "IT"],
    startDate: "2024-11-15",
    endDate: "2024-11-17",
    href: "#",
    ctaText: "사전 등록하기",
    sponsored: true,
  },
  {
    title: "AI 부트캠프 6기 모집",
    description: "6개월 만에 AI 엔지니어로 전환하세요. 현직 AI 엔지니어의 1:1 멘토링과 실전 프로젝트를 통해 포트폴리오를 완성할 수 있습니다.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80",
    company: "AI Academy",
    category: "교육",
    tags: ["AI", "부트캠프", "취업 연계"],
    startDate: "2024-12-01",
    endDate: "2025-05-31",
    href: "#",
    ctaText: "지원하기",
    sponsored: true,
  },
  {
    title: "개발자를 위한 영문 이력서 첨삭 서비스",
    description: "글로벌 기업 지원을 위한 전문 영문 이력서 첨삭 서비스를 제공합니다. 경력 10년 이상의 전문가가 직접 첨삭해드립니다.",
    logoUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&q=80",
    company: "Resume Pro",
    category: "커리어 서비스",
    tags: ["이력서", "첨삭", "글로벌"],
    href: "#",
    ctaText: "상담 신청",
    sponsored: true,
  },
];

// Mock recommended posts data
const mockRecommendedPosts = [
  {
    id: '1',
    title: '주니어 개발자가 알아야 할 Git 협업 전략 5가지',
    author: {
      name: '김개발',
      image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'
    },
    likeCount: 245,
    href: '#'
  },
  {
    id: '2',
    title: '프론트엔드 개발자 면접에서 자주 나오는 질문 TOP 10',
    author: {
      name: '이프론트',
      image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80'
    },
    likeCount: 189,
    href: '#'
  },
  {
    id: '3',
    title: 'React 19 새로운 기능 완벽 정리',
    author: {
      name: '박리액트',
      image_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80'
    },
    likeCount: 312,
    href: '#'
  },
  {
    id: '4',
    title: '스타트업 개발자로 1년 일하면서 배운 것들',
    author: {
      name: '최스타트',
      image_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&q=80'
    },
    likeCount: 156,
    href: '#'
  },
  {
    id: '5',
    title: 'TypeScript 타입 시스템 깊이 이해하기',
    author: {
      name: '정타입',
      image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80'
    },
    likeCount: 203,
    href: '#'
  }
];

// Mock recommended followers data
const mockRecommendedFollowers = [
  {
    id: '1',
    name: '김시니어',
    image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    headline: 'Senior Frontend Engineer @ Toss',
    isFollowing: false,
    href: '#'
  },
  {
    id: '2',
    name: '이테크리드',
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    headline: 'Tech Lead @ Kakao',
    isFollowing: false,
    href: '#'
  },
  {
    id: '3',
    name: '박백엔드',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    headline: 'Backend Engineer @ Naver',
    isFollowing: true,
    href: '#'
  },
  {
    id: '4',
    name: '최풀스택',
    image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    headline: 'Full Stack Developer @ Coupang',
    isFollowing: false,
    href: '#'
  },
  {
    id: '5',
    name: '정디자이너',
    image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=80',
    headline: 'Product Designer @ Line',
    isFollowing: false,
    href: '#'
  }
];

const mockTodayJobs = [
  {
    company: {
      id: 'toss',
      name: 'Toss',
      symbolImageUrl: 'https://static.toss.im/png-icons/timeline/toss-symbol.png'
    },
    jobs: [
      { id: '1', url: '#', title: 'Frontend Engineer', company: { name: 'Toss', symbolImageUrl: 'https://static.toss.im/png-icons/timeline/toss-symbol.png' } },
      { id: '2', url: '#', title: 'Backend Engineer', company: { name: 'Toss', symbolImageUrl: 'https://static.toss.im/png-icons/timeline/toss-symbol.png' } }
    ]
  },
  {
    company: {
      id: 'kakao',
      name: 'Kakao',
      symbolImageUrl: 'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/5f9c58c2017800001.png'
    },
    jobs: [
      { id: '3', url: '#', title: 'iOS Developer', company: { name: 'Kakao', symbolImageUrl: 'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/5f9c58c2017800001.png' } }
    ]
  },
  {
    company: {
      id: 'naver',
      name: 'Naver',
      symbolImageUrl: 'https://s.pstatic.net/static/www/mobile/edit/2016/0705/mobile_212852414260.png'
    },
    jobs: [
      { id: '4', url: '#', title: 'Data Engineer', company: { name: 'Naver', symbolImageUrl: 'https://s.pstatic.net/static/www/mobile/edit/2016/0705/mobile_212852414260.png' } }
    ]
  },
  {
    company: {
      id: 'coupang',
      name: 'Coupang',
      symbolImageUrl: 'https://image7.coupangcdn.com/image/coupang/common/logo_coupang_w350.png'
    },
    jobs: [
      { id: '5', url: '#', title: 'Full Stack Developer', company: { name: 'Coupang', symbolImageUrl: 'https://image7.coupangcdn.com/image/coupang/common/logo_coupang_w350.png' } }
    ]
  },
  {
    company: {
      id: 'line',
      name: 'Line',
      symbolImageUrl: 'https://static.line-scdn.net/line_web/img/gnb_line_w.png'
    },
    jobs: [
      { id: '6', url: '#', title: 'Android Developer', company: { name: 'Line', symbolImageUrl: 'https://static.line-scdn.net/line_web/img/gnb_line_w.png' } }
    ]
  }
];

const mockJobMarketTrends = [
  {
    id: '1',
    category: 'Frontend',
    position: 'React Developer',
    postingCount: 1250,
    change: 85,
    changePercent: 7.3,
    chart: [100, 105, 103, 110, 115, 120, 125]
  },
  {
    id: '2',
    category: 'Frontend',
    position: 'TypeScript Developer',
    postingCount: 980,
    change: 120,
    changePercent: 13.9,
    chart: [80, 85, 90, 95, 100, 105, 110]
  },
  {
    id: '3',
    category: 'Backend',
    position: 'Python Developer',
    postingCount: 1430,
    change: 45,
    changePercent: 3.2,
    chart: [140, 142, 141, 143, 145, 147, 150]
  },
  {
    id: '4',
    category: 'DevOps',
    position: 'AWS Engineer',
    postingCount: 760,
    change: 60,
    changePercent: 8.6,
    chart: [70, 72, 74, 76, 78, 80, 82]
  },
];

type UserProfile = {
  id: number;
  name: string;
  image_url: string;
  headline: string;
  description: string;
  small_image_url: string;
};

type SelectedContent = {
  type: 'post' | 'qna';
  id: string;
  userProfile?: UserProfile;
  questionData?: QuestionListItem;
};

export default function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 탭 읽기 (기본값: 'feed')
  const currentTab = (searchParams.get('tab') as 'feed' | 'qna' | 'promotion' | 'following') || 'feed';

  const [selectedInterests, setSelectedInterests] = React.useState<string[]>([]);
  const [contentFilter, setContentFilter] = React.useState<'feed' | 'qna' | 'promotion' | 'following'>(currentTab);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<SelectedContent | null>(null);

  // URL과 상태 동기화
  React.useEffect(() => {
    setContentFilter(currentTab);
  }, [currentTab]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'feed' | 'qna' | 'promotion' | 'following') => {
    setContentFilter(tab);
    // URL 업데이트
    if (tab === 'feed') {
      router.push('/community');
    } else {
      router.push(`/community?tab=${tab}`);
    }
  };

  // API Hooks
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts
  } = useInfinitePosts();

  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    error: questionsError,
    fetchNextPage: fetchNextQuestions,
    hasNextPage: hasNextQuestions,
    isFetchingNextPage: isFetchingNextQuestions
  } = useInfiniteQuestions();

  const handleOpenPost = (postId: string, userProfile?: UserProfile) => {
    setSelectedContent({ type: 'post', id: postId, userProfile });
    setDrawerOpen(true);
  };

  const handleOpenQna = (qnaId: string, questionData: QuestionListItem) => {
    setSelectedContent({ type: 'qna', id: qnaId, questionData });
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedContent(null), 300);
  };

  const handleLoadMore = () => {
    if (contentFilter === 'feed') {
      if (hasNextPosts && !isFetchingNextPosts) {
        fetchNextPosts();
      }
    } else if (contentFilter === 'qna') {
      if (hasNextQuestions && !isFetchingNextQuestions) {
        fetchNextQuestions();
      }
    } else {
      // promotion, following은 둘 다 fetch
      if (hasNextPosts && !isFetchingNextPosts) {
        fetchNextPosts();
      }
      if (hasNextQuestions && !isFetchingNextQuestions) {
        fetchNextQuestions();
      }
    }
  };

  // Interest categories
  const interestCategories = [
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'ai-ml', label: 'AI/ML' },
    { id: 'design', label: 'Design' },
    { id: 'management', label: 'Management' },
    { id: 'career', label: 'Career' },
  ];

  // Mix all content naturally by interleaving different types
  const allContent = React.useMemo(() => {
    // Use API data for feed and QnA, mock data for promotion
    // Flatten all pages
    const feedItems = ((postsData?.pages as PaginatedPostResponse[] | undefined)?.flatMap(page => page.results) || []).map((item, idx) => ({
      type: 'feed' as const,
      data: item,
      originalIndex: idx,
    }));

    const qnaItems = ((questionsData?.pages as PaginatedQuestionResponse[] | undefined)?.flatMap(page => page.results) || []).map((item, idx) => ({
      type: 'qna' as const,
      data: item,
      originalIndex: idx,
    }));

    const promotionItems = mockPromotionData.map((item, idx) => ({
      type: 'promotion' as const,
      data: item,
      originalIndex: idx,
    }));

    // Interleave items to mix them naturally
    const result = [];
    const maxLength = Math.max(feedItems.length, qnaItems.length, promotionItems.length);

    for (let i = 0; i < maxLength; i++) {
      // Add items in a rotating pattern: feed -> qna -> promotion -> feed -> qna...
      if (i < feedItems.length) result.push(feedItems[i]);
      if (i < qnaItems.length) result.push(qnaItems[i]);
      if (i < promotionItems.length) result.push(promotionItems[i]);
    }

    return result;
  }, [postsData, questionsData]);

  // Filter content based on selected filter
  const filteredContent = React.useMemo(() => {
    if (contentFilter === 'following') {
      // TODO: Implement following filter logic
      return allContent;
    }
    return allContent.filter(item => item.type === contentFilter);
  }, [allContent, contentFilter]);

  // Loading state
  const isLoading = isLoadingPosts || isLoadingQuestions || isFetchingNextPosts || isFetchingNextQuestions;

  // Error state
  const hasError = postsError || questionsError;

  // Check if there's more data to load
  const hasMoreData = contentFilter === 'feed'
    ? hasNextPosts
    : contentFilter === 'qna'
      ? hasNextQuestions
      : hasNextPosts || hasNextQuestions;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Main Content */}
      <main className="lg:col-span-9">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="pt-16 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-10 w-10 text-slate-700" />
                  <h1 className="text-3xl font-bold text-slate-900">Community</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Chip
                    variant={contentFilter === 'feed' ? 'selected' : 'default'}
                    onClick={() => handleTabChange('feed')}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Feed
                  </Chip>
                  <Chip
                    variant={contentFilter === 'qna' ? 'selected' : 'default'}
                    onClick={() => handleTabChange('qna')}
                  >
                    Q&A
                  </Chip>
                  <Chip
                    variant={contentFilter === 'promotion' ? 'selected' : 'default'}
                    onClick={() => handleTabChange('promotion')}
                  >
                    홍보
                  </Chip>
                  <Chip
                    variant={contentFilter === 'following' ? 'selected' : 'default'}
                    onClick={() => handleTabChange('following')}
                  >
                    <Users className="h-4 w-4" />
                    팔로잉
                  </Chip>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && filteredContent.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <span className="ml-3 text-slate-600">Loading content...</span>
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <div className="text-center py-12">
              <p className="text-slate-600">Failed to load content. Please try again later.</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasError && filteredContent.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No content available.</p>
            </div>
          )}

          {/* Unified 2-Column Grid */}
          {filteredContent.length > 0 && (
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              {filteredContent.map((item, idx) => {
                if (item.type === 'feed') {
                  const post = item.data;
                  // Map API response to component props
                  const userProfile: UserProfile = post.author ? {
                    id: post.author.id,
                    name: post.author.name,
                    image_url: post.author.image_url || '',
                    headline: post.author.headline || '',
                    description: post.author.description || '',
                    small_image_url: post.author.image_url || '',
                  } : {
                    id: post.userid,
                    name: '알 수 없는 사용자',
                    image_url: '',
                    headline: '',
                    description: '',
                    small_image_url: '',
                  };

                  return (
                    <div key={`feed-${post.id}`} className="break-inside-avoid mb-6">
                      <CommunityFeedCard
                        userProfile={userProfile}
                        content={post.description}
                        contentHtml={post.description} // API doesn't provide HTML separately in list
                        createdAt={post.createdat}
                        stats={{
                          likeCount: 0, // Not available in list view
                          replyCount: post.comment_count || 0,
                          repostCount: 0,
                          viewCount: 0,
                        }}
                        imageUrls={[]} // Not available in list view
                        onClick={() => handleOpenPost(post.id.toString(), userProfile)}
                        onLike={() => console.log('Like')}
                        onReply={() => console.log('Reply')}
                        onRepost={() => console.log('Repost')}
                        onShare={() => console.log('Share')}
                        onBookmark={() => console.log('Bookmark')}
                        onMore={() => console.log('More')}
                      />
                    </div>
                  );
                } else if (item.type === 'qna') {
                  const question = item.data;
                  return (
                    <div key={`qna-${question.id}`} className="break-inside-avoid mb-6">
                      <QnaCard
                        title={question.title}
                        description={question.description}
                        author={question.author}
                        createdAt={question.createdat}
                        updatedAt={question.updatedat}
                        status={question.status}
                        isPublic={question.ispublic}
                        answerCount={question.answer_count || 0}
                        commentCount={0}
                        likeCount={0}
                        dislikeCount={0}
                        viewCount={0}
                        hashTagNames=""
                        qnaId={question.id}
                        onClick={() => handleOpenQna(question.id.toString(), question)}
                        onLike={() => console.log('Like')}
                        onDislike={() => console.log('Dislike')}
                      />
                    </div>
                  );
                } else if (item.type === 'promotion') {
                  const promo = item.data;
                  return (
                    <div key={`promotion-${idx}`} className="break-inside-avoid mb-6">
                      <PromotionCard
                        variant="default"
                        {...promo}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Load More */}
          {filteredContent.length > 0 && (
            <LoadMore
              hasMore={!!hasMoreData}
              loading={isLoading}
              onLoadMore={handleLoadMore}
            />
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="lg:col-span-3">
        <div className="space-y-4 pt-16">
          {/* Recommended Posts */}
          <RecommendedPostsPanel
            posts={mockRecommendedPosts}
            maxItems={5}
          />

          {/* Recommended Followers */}
          <RecommendedFollowersPanel
            followers={mockRecommendedFollowers}
            maxItems={5}
            onFollow={(userId) => console.log('Follow:', userId)}
            onUnfollow={(userId) => console.log('Unfollow:', userId)}
          />
        </div>
      </aside>

      {/* Right Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selectedContent && (
          <div className="h-full flex flex-col">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              {selectedContent.type === 'post' && selectedContent.userProfile ? (
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => window.open(`/profile/${selectedContent.userProfile?.id}`, '_blank')}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                    aria-label="프로필 보기"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedContent.userProfile.small_image_url || selectedContent.userProfile.image_url}
                        alt={selectedContent.userProfile.name}
                      />
                      <AvatarFallback>
                        {selectedContent.userProfile.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">
                          {selectedContent.userProfile.name}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                      </div>
                      <span className="text-xs text-slate-600">
                        {selectedContent.userProfile.headline}
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedContent.type === 'post' ? '게시글' : '질문'}
                </h2>
              )}
              <button
                onClick={handleCloseDrawer}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="닫기"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedContent.type === 'post' && (
                <iframe
                  src={`/community/post/${selectedContent.id}?drawer=true`}
                  className="w-full h-full border-0"
                  title="Post Detail"
                />
              )}
              {selectedContent.type === 'qna' && selectedContent.questionData && (
                <div className="h-full overflow-y-auto p-6">
                  <QnaDetail
                    qnaId={selectedContent.questionData.id.toString()}
                    title={selectedContent.questionData.title}
                    description={selectedContent.questionData.description}
                    createdAt={selectedContent.questionData.createdat}
                    updatedAt={selectedContent.questionData.updatedat}
                    hashTagNames=""
                    viewCount={0}
                    likeCount={0}
                    dislikeCount={0}
                    status={selectedContent.questionData.status}
                    isPublic={selectedContent.questionData.ispublic}
                    answers={selectedContent.questionData.answers.map(answer => ({
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
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={handleCloseDrawer}
        />
      )}
    </div>
  );
}
