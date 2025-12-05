# 커뮤니티 페이지 TODO 리스트

> 커뮤니티 페이지 완성도 향상을 위한 작업 목록
> 작성일: 2025-12-02

---

## ✅ 프론트엔드만으로 구현 가능

### 🎨 UI 개선 (사용자 요청)

| # | 항목 | 파일 | 현재 상태 | 작업 내용 |
|---|------|------|-----------|-----------|
| 1 | ✅ **인기글 프로필 이미지 + 테두리** | `components/ui/top-posts-panel.tsx` | 순위 배지만 있음 | 1~3위: 금/은/동 테두리 + 프로필 이미지 추가 |
| 2 | ✅ **피드 좋아요 숫자 0 표시** | `app/community/page.tsx` L364 | `likeCount: 0` 하드코딩 | API의 `like_count` 필드 사용 |
| 3 | ✅ **좋아요 상태 피드 표시** | `app/community/page.tsx` | liked 상태 미연동 | 개별 isPostLiked 또는 bulk 조회 연동 |
| 4 | ✅ **카드 정렬 확인** | `app/community/page.tsx` L335 | `columns-2` (세로 채움) | grid로 변경하여 가로 순서 (1,2 / 3,4) |

### 🔧 기능 구현 (API 존재)

| # | 항목 | 파일 | API | 작업 내용 |
|---|------|------|-----|-----------|
| 5 | ✅ **공유하기** | `app/community/page.tsx` L374 | 프론트만 | 클립보드 복사 + toast 알림 |
| 6 | ✅ **팔로우/언팔로우** | `app/community/page.tsx` L446-447 | `followUser`, `unfollowUser` | API 연동 + 상태 업데이트 |
| 7 | ✅ **임시저장** | `app/community/new/post/page.tsx` L155 | localStorage | 작성 중 내용 자동 저장 |

### 📝 하드코딩 제거

| # | 항목 | 파일 | 현재 상태 | 작업 내용 |
|---|------|------|-----------|-----------|
| 8 | ✅ **Q&A 미리보기 텍스트** | `app/community/page.tsx` L394 | "질문 내용을 확인하려면 클릭하세요" | 실제 description 표시 |
| 9 | ✅ **드로어 Q&A description** | `app/community/page.tsx` L520 | "질문 상세 내용" | API description 사용 |
| 10 | ✅ **댓글 작성자 아바타** | `components/ui/post-detail.tsx` L311 | "U" 하드코딩 | useCurrentUser 데이터 사용 |
| 11 | ✅ **답변 작성자 아바타** | `components/ui/qna-detail.tsx` L244 | "U" 하드코딩 | useCurrentUser 데이터 사용 |

---

## ❌ 백엔드 API 필요

### 🚫 API 미구현 (백엔드 작업 필요)

| # | 항목 | 필요 API | 우선순위 |
|---|------|----------|----------|
| 12 | **댓글 좋아요** | `POST /api/v1/comments/{id}/like/` | HIGH |
| 13 | **Q&A 좋아요/싫어요** | `POST /api/v1/questions/{id}/like/`, `/dislike/` | HIGH |
| 14 | **답변 좋아요/싫어요** | `POST /api/v1/answers/{id}/like/`, `/dislike/` | HIGH |
| 15 | **답변 채택** | `POST /api/v1/answers/{id}/accept/` | HIGH |
| 16 | **리포스트** | `POST /api/v1/posts/{id}/repost/` | MEDIUM |
| 17 | **팔로잉 피드 필터** | `GET /api/v1/posts/?following=true` | MEDIUM |

---

## 📊 요약

| 분류 | 항목 수 | 설명 |
|------|---------|------|
| ✅ 완료 (프론트만) | 11개 | UI 개선 + 기능 구현 + 하드코딩 제거 |
| ❌ 백엔드 필요 | 6개 | 새 API 엔드포인트 필요 |
| **총계** | **17개** | |

---

## 🎯 권장 작업 순서

### Phase 1: UI 개선 (프론트만, 즉시 가능)
1. 인기글 프로필 이미지 + 금/은/동 테두리
2. 피드 좋아요 숫자 0 → like_count 연동
3. 좋아요 상태 피드 표시
4. 카드 정렬 확인 (grid 변경)

### Phase 2: 기능 구현 (프론트만)
5. 공유하기 (클립보드 복사)
6. 팔로우/언팔로우 연동
7. 임시저장 (localStorage)

### Phase 3: 하드코딩 제거 (프론트만)
8. Q&A 미리보기/드로어 텍스트
9. 아바타 로그인 사용자 연동

### Phase 4: 백엔드 협업 필요
10. 댓글/Q&A/답변 좋아요 API
11. 답변 채택 API
12. 리포스트, 팔로잉 필터 등

---

## 📁 관련 파일 목록

```
app/community/
├── page.tsx                    # 커뮤니티 메인
├── new/
│   ├── post/page.tsx          # 글쓰기
│   └── qna/page.tsx           # Q&A 작성
├── post/[postId]/page.tsx     # 포스트 상세
└── qna/[qnaId]/page.tsx       # Q&A 상세

components/ui/
├── top-posts-panel.tsx        # 인기글 패널 ← UI 개선 대상
├── community-feed-card.tsx    # 피드 카드
├── qna-card.tsx               # Q&A 카드
├── post-detail.tsx            # 포스트 상세
└── qna-detail.tsx             # Q&A 상세

lib/api/services/
├── posts.service.ts           # 포스트 API (좋아요 있음)
├── questions.service.ts       # Q&A API (좋아요 없음)
└── user.service.ts            # 유저 API (팔로우 있음)
```

---

## 📋 작업 현황 (2025-12-05)

| 상태 | 항목 수 |
|------|---------|
| ✅ 완료 | 11개 |
| ❌ 백엔드 필요 | 6개 |
| **총계** | **17개** |

### 완료된 주요 변경 파일
- `components/ui/top-posts-panel.tsx` - 인기글 프로필 이미지 + 테두리
- `app/community/page.tsx` - 피드 like_count, liked 상태, 카드 정렬, 공유, 팔로우
- `app/community/new/post/page.tsx` - 임시저장, 이미지 업로드
- `components/ui/post-detail.tsx` - 댓글 아바타 currentUser, HTML 콘텐츠 렌더링
- `components/ui/qna-detail.tsx` - 답변 아바타 currentUser
- `app/community/post/[postId]/page.tsx` - currentUser 전달
- `app/community/qna/[qnaId]/page.tsx` - currentUser 전달
- `lib/api/services/posts.service.ts` - 이미지 업로드 API 수정
- `lib/api/types/posts.types.ts` - ImageUploadResponse, PostCreateRequest 타입 수정

### 백엔드 변경 파일
- `api/views/post.py` - descriptionhtml 저장 지원
- `api/serializers/post.py` - descriptionhtml 필드 추가
- `api/views/image_upload.py` - 이미지 업로드 엔드포인트 구현 완료

---

> 마지막 업데이트: 2025-12-05
