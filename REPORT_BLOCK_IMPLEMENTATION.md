# Report & Block Functionality Implementation

## Overview
신고/차단 기능 프론트엔드 구현 완료. 모든 API 서비스, React Query 훅, 타입 정의가 구현되었습니다.

## Implemented Files

### 1. Type Definitions
- `/Users/goalle/vibework/careerly/careerly-v2/lib/api/types/report.types.ts`
- `/Users/goalle/vibework/careerly/careerly-v2/lib/api/types/block.types.ts`

### 2. API Services
- `/Users/goalle/vibework/careerly/careerly-v2/lib/api/services/report.service.ts`
- `/Users/goalle/vibework/careerly/careerly-v2/lib/api/services/block.service.ts`

### 3. React Query Hooks
- `/Users/goalle/vibework/careerly/careerly-v2/lib/api/hooks/mutations/useReportMutations.ts`
- `/Users/goalle/vibework/careerly/careerly-v2/lib/api/hooks/mutations/useBlockMutations.ts`
- `/Users/goalle/vibework/careerly/careerly-v2/lib/api/hooks/queries/useBlock.ts`

### 4. Export Configuration
- Updated `/Users/goalle/vibework/careerly/careerly-v2/lib/api/types/index.ts`
- Updated `/Users/goalle/vibework/careerly/careerly-v2/lib/api/index.ts`

## Usage Examples

### Content Type Constants

```typescript
import { CONTENT_TYPE } from '@/lib/api';

// 사용 가능한 콘텐츠 타입:
CONTENT_TYPE.PROFILE      // 0 - 프로필
CONTENT_TYPE.POST         // 1 - 게시글
CONTENT_TYPE.QUESTION     // 2 - Q&A 질문
CONTENT_TYPE.POLL         // 3 - 투표
CONTENT_TYPE.COMMENT      // 4 - 댓글
CONTENT_TYPE.ANSWER       // 5 - 답변
CONTENT_TYPE.POLL_COMMENT // 6 - 투표 댓글
```

### 1. Report Content (콘텐츠 신고)

```typescript
'use client';

import { useReportContent, CONTENT_TYPE } from '@/lib/api';
import { Button } from '@/components/ui/button';

function ReportButton({ postId }: { postId: number }) {
  const reportMutation = useReportContent();

  const handleReport = () => {
    reportMutation.mutate({
      contentType: CONTENT_TYPE.POST,
      contentId: postId,
    });
  };

  return (
    <Button
      onClick={handleReport}
      disabled={reportMutation.isPending}
    >
      {reportMutation.isPending ? '신고 중...' : '신고하기'}
    </Button>
  );
}
```

### 2. Block User (사용자 차단)

```typescript
'use client';

import { useBlockUser } from '@/lib/api';
import { Button } from '@/components/ui/button';

function BlockButton({ userId }: { userId: number }) {
  const blockMutation = useBlockUser();

  const handleBlock = () => {
    blockMutation.mutate(userId);
  };

  return (
    <Button
      onClick={handleBlock}
      disabled={blockMutation.isPending}
      variant="destructive"
    >
      {blockMutation.isPending ? '차단 중...' : '차단하기'}
    </Button>
  );
}
```

### 3. Unblock User (차단 해제)

```typescript
'use client';

import { useUnblockUser } from '@/lib/api';
import { Button } from '@/components/ui/button';

function UnblockButton({ userId }: { userId: number }) {
  const unblockMutation = useUnblockUser();

  const handleUnblock = () => {
    unblockMutation.mutate(userId);
  };

  return (
    <Button
      onClick={handleUnblock}
      disabled={unblockMutation.isPending}
    >
      {unblockMutation.isPending ? '해제 중...' : '차단 해제'}
    </Button>
  );
}
```

### 4. Check Block Status (차단 상태 확인)

```typescript
'use client';

import { useIsUserBlocked, useBlockUser, useUnblockUser } from '@/lib/api';
import { Button } from '@/components/ui/button';

function BlockToggleButton({ userId }: { userId: number }) {
  const { data: isBlocked, isLoading } = useIsUserBlocked(userId);
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  const handleToggle = () => {
    if (isBlocked) {
      unblockMutation.mutate(userId);
    } else {
      blockMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return <div>확인 중...</div>;
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={blockMutation.isPending || unblockMutation.isPending}
      variant={isBlocked ? "outline" : "destructive"}
    >
      {isBlocked ? '차단 해제' : '차단하기'}
    </Button>
  );
}
```

### 5. Blocked Users List (차단 목록)

```typescript
'use client';

import { useBlockedUsers, useUnblockUser } from '@/lib/api';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

function BlockedUsersList() {
  const { data, isLoading } = useBlockedUsers();
  const unblockMutation = useUnblockUser();

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!data || data.results.length === 0) {
    return <div>차단한 사용자가 없습니다.</div>;
  }

  return (
    <div className="space-y-4">
      {data.results.map((blockedUser) => (
        <div key={blockedUser.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={blockedUser.blocked_user.image_url} />
              <AvatarFallback>
                {blockedUser.blocked_user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {blockedUser.blocked_user.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {blockedUser.blocked_user.headline}
              </div>
            </div>
          </div>
          <Button
            onClick={() => unblockMutation.mutate(blockedUser.blockeduserid)}
            disabled={unblockMutation.isPending}
            variant="outline"
            size="sm"
          >
            차단 해제
          </Button>
        </div>
      ))}
    </div>
  );
}
```

### 6. Dropdown Menu Integration Example

```typescript
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useReportContent, useBlockUser, CONTENT_TYPE } from '@/lib/api';
import { MoreHorizontal, Flag, UserX } from 'lucide-react';

function PostActions({ postId, authorId }: { postId: number; authorId: number }) {
  const reportMutation = useReportContent();
  const blockMutation = useBlockUser();

  const handleReport = () => {
    reportMutation.mutate({
      contentType: CONTENT_TYPE.POST,
      contentId: postId,
    });
  };

  const handleBlock = () => {
    blockMutation.mutate(authorId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleReport}>
          <Flag className="mr-2 h-4 w-4" />
          신고하기
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleBlock} className="text-red-600">
          <UserX className="mr-2 h-4 w-4" />
          차단하기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 7. Custom Error Handling

```typescript
'use client';

import { useReportContent, CONTENT_TYPE } from '@/lib/api';

function CustomReportButton({ postId }: { postId: number }) {
  const reportMutation = useReportContent({
    onSuccess: (data) => {
      // 커스텀 성공 처리
      console.log('Report success:', data);
    },
    onError: (error) => {
      // 커스텀 에러 처리
      console.error('Report failed:', error);
    },
    // 토스트 비활성화하고 커스텀 처리하려면 meta 사용
    meta: { showToast: false }
  });

  return (
    <button onClick={() => reportMutation.mutate({
      contentType: CONTENT_TYPE.POST,
      contentId: postId,
    })}>
      신고하기
    </button>
  );
}
```

## API Endpoints

### Report
- `POST /api/v1/reports/`
  - body: `{ content_type: number, content_id: number }`
  - response: `{ success: boolean, reported: boolean, message: string }`

### Block
- `POST /api/v1/users/{user_id}/block/`
  - response: `{ success: boolean, blocked: boolean, message: string }`

- `DELETE /api/v1/users/{user_id}/unblock/`
  - response: `{ success: boolean, blocked: boolean, message: string }`

- `GET /api/v1/users/{user_id}/is-blocked/`
  - response: `{ blocked: boolean }`

- `GET /api/v1/users/me/blocked-users/`
  - query params: `{ page?: number }`
  - response: Paginated list of blocked users

## Features

### Automatic Toast Notifications
- 신고/차단 성공 시 자동 토스트 알림
- 에러 발생 시 자동 에러 토스트
- 필요시 `meta: { showToast: false }` 옵션으로 비활성화 가능

### React Query Cache Management
- 차단/해제 시 관련 쿼리 자동 무효화
- 차단 상태 캐시 자동 업데이트
- 차단 목록 자동 리프레시

### TypeScript Type Safety
- 모든 API 응답 타입 정의
- Content Type 상수로 타입 안전성 보장
- 컴파일 타임 타입 체크

## Notes

1. 모든 API 호출은 인증이 필요합니다 (authClient 사용)
2. 에러는 전역 에러 핸들러에서 자동 처리됩니다
3. 토스트 알림은 sonner 라이브러리를 사용합니다
4. React Query 캐싱으로 불필요한 API 호출을 최소화합니다
5. CONTENT_TYPE 상수를 사용하여 타입 안전성을 보장합니다

## Integration with Existing Components

기존 컴포넌트(예: `community-feed-card.tsx`)에 통합하려면:

1. 필요한 훅 import
2. DropdownMenu에 신고/차단 옵션 추가
3. 클릭 핸들러에서 mutation 호출

예제는 위의 "Dropdown Menu Integration Example" 참조.
