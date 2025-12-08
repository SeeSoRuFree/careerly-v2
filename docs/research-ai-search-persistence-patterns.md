# AI 검색 서비스 대화/검색 결과 영속화 및 공유 패턴 연구

> 연구 일자: 2025-12-04
> 대상 서비스: Perplexity AI, ChatGPT, 기타 AI 검색 서비스

## 목차
1. [URL 패턴 분석](#1-url-패턴-분석)
2. [기술 구현 패턴](#2-기술-구현-패턴)
3. [스트리밍 + 영속화 동시 처리](#3-스트리밍--영속화-동시-처리)
4. [Best Practices](#4-best-practices)
5. [구현 권장사항](#5-구현-권장사항)

---

## 1. URL 패턴 분석

### 1.1 Perplexity AI URL 구조

#### 기본 검색 URL
```
https://www.perplexity.ai/search/?q={query}
또는
https://www.perplexity.ai/search/{query-slug}
```

#### Perplexity Pages (공유 가능한 콘텐츠)
- **목적**: 검색 결과를 시각적으로 정리된 페이지로 변환
- **특징**:
  - Google 검색 가능 (SEO 최적화)
  - 공유 링크 제공
  - 기존 대화를 Pages로 변환 가능
  - Follow-up 질문 지원

#### Spaces (협업 기능)
- 검색 결과를 Spaces에 저장하여 재방문 및 공유 가능
- 팀 단위 내부 지식 관리
- 검색 엔진 + 지식 베이스 결합 형태

**참고 문서**:
- [Perplexity AI's new feature will turn your searches into shareable pages](https://techcrunch.com/2024/05/30/perplexity-ais-new-feature-will-turn-your-searches-into-sharable-pages/)
- [Getting Started with Perplexity](https://www.perplexity.ai/hub/getting-started)

---

### 1.2 ChatGPT 공유 기능

#### URL 패턴
```
https://chatgpt.com/share/{uuid}
```

**예시**:
```
https://chatgpt.com/share/d1c31390-cf22-42f5-b30e-cc4f9e517700
```

#### 주요 특징

**1. Permalink 생성 방식**
- 사이드바 또는 우측 상단 공유 버튼으로 생성
- UUID 기반 고유 ID
- 웹, iOS, Android 앱 모두 지원

**2. 미리보기 및 공유**
- 웹에서는 공유 전 대화 스냅샷 미리보기 제공
- 소셜 네트워크에 직접 공유 옵션

**3. 접근 제어**
- 현재 세분화된 권한 관리 없음
- 링크를 아는 모든 사람이 접근 가능

**4. Continue Conversation 기능**
- 공유 링크를 받은 사람이 대화를 이어갈 수 있음
- 원본 대화에는 영향 없이 독립적으로 진행

**5. 삭제 동작**
- 원본 대화 삭제 시 공유 링크도 삭제됨
- 공유 링크를 통한 접근 불가능해짐

**6. 링크 관리**
- Settings > Data controls > Shared links에서 관리
- 생성된 모든 공유 링크 확인 및 관리 가능

**참고 문서**:
- [ChatGPT Shared Links FAQ](https://help.openai.com/en/articles/7925741-chatgpt-shared-links-faq)
- [How to Share ChatGPT Conversation via Shared Link](https://updf.com/chatgpt/share-chatgpt-conversation/)

---

### 1.3 URL 전환 패턴 비교

| 시나리오 | 권장 방법 | 이유 |
|---------|---------|------|
| 검색 시작 (익명) | `/search` | 임시 세션 시작 |
| 결과 로딩 완료 | `history.replaceState` → `/search/{id}` | 새로운 히스토리 엔트리 생성 안함 |
| 공유 링크 생성 | `/share/{id}` | 읽기 전용 퍼머링크 |
| 대화 이어가기 | `history.pushState` → `/search/{new-id}` | 새로운 히스토리 엔트리 생성 |

**Key Insights**:
- `replaceState`: URL만 변경, 히스토리 엔트리 생성 X (초기 ID 할당)
- `pushState`: 새 히스토리 엔트리 생성 (대화 이어가기)
- SEO 고려 시 서버에서 `<a href>` 제공 필요

**참고 문서**:
- [Pushstate and Replacestate: What You Need to Know](https://thatware.co/pushstate-vs-replacestate/)
- [History: pushState() method - MDN](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)

---

## 2. 기술 구현 패턴

### 2.1 ID 생성: Client vs Server

#### Server-Side ID 생성 (권장)

**장점**:
- 데이터베이스 무결성 보장
- ID 충돌 방지
- 보안성 향상 (악의적 ID 변조 방지)
- 세션 간 일관성 보장

**구현 예시 (AI SDK)**:
```typescript
// Option 1: generateMessageId 사용
return result.toUIMessageStreamResponse({
  generateMessageId: createIdGenerator({
    prefix: 'msg',
    size: 16,
  }),
  onFinish: ({ messages }) => {
    saveChat({ chatId, messages });
  },
});

// Option 2: createUIMessageStream으로 명시적 제어
const stream = createUIMessageStream({
  id: generateServerSideId(), // 서버 생성 ID
  // ...
});
```

**주의사항 (Next.js)**:
- `crypto.randomUUID()`는 Node.js 내장 모듈이므로 클라이언트에서 사용 불가
- 서버 컴포넌트에서만 사용 가능
- 클라이언트 필요 시 `uuid` 라이브러리 사용

#### Client-Side ID 생성이 적합한 경우

**사용 시나리오**:
- 오프라인 우선 앱 (모바일 앱 등)
- 멱등성(idempotency) 보장 필요
- 네트워크 불안정 환경에서 중복 요청 방지

**예시**:
```typescript
// 클라이언트에서 UUID 생성 후 서버에 전송
import { v4 as uuidv4 } from 'uuid';

const chatId = uuidv4();
// 서버에 chatId와 함께 요청
// 네트워크 실패 시 동일한 chatId로 재시도 가능
```

**보안 고려사항**:
- UUID 스푸핑 가능성
- 백엔드에서 반드시 중복 검증 필요
- 충돌 확률은 매우 낮지만 검증 로직 필수

**참고 문서**:
- [Generating Id's Server vs Client side](https://stackoverflow.com/questions/59966008/generating-ids-server-vs-client-side)
- [Should I generate GUID/UUID on client or server?](https://softwareengineering.stackexchange.com/questions/367347/should-i-generate-guid-uuid-on-client-or-server)
- [How to generate a UUID in NextJs?](https://stackoverflow.com/questions/71851190/how-to-generate-a-uuid-in-nextjs)

---

### 2.2 익명 → 인증 세션 마이그레이션

#### 패턴 1: Session ID 유지 + Event Migration (Google ADK)

```typescript
// 1. 익명 세션의 모든 이벤트 추출
const anonymousSession = await getSession(anonymousSessionId);
const events = extractEvents(anonymousSession);

// 2. 인증된 사용자로 새 세션 생성 (동일한 세션 ID 유지)
const authenticatedSession = await createSession({
  sessionId: anonymousSessionId, // 동일 ID 유지
  userId: authenticatedUserId,
});

// 3. 시스템 이벤트 제외하고 마이그레이션
const filteredEvents = events.filter(e => !e.isSystemEvent);
await injectEvents(authenticatedSession, filteredEvents);
```

**핵심 원칙**:
- 이벤트는 ADK의 기본 정보 단위
- 시스템 이벤트는 재생성되므로 제외
- 세션 ID 유지로 URL 변경 없이 전환

#### 패턴 2: Token-Based Session Linking (Crisp Chat SDK)

```typescript
// 익명 세션 시작
CrispSDK.chat.startAnonymousSession();

// 사용자 로그인 시
CrispSDK.auth.setUserToken(userToken);

// 자동으로 익명 세션 → 인증 세션 전환
// 메시지 히스토리 유지
```

**특징**:
- 크로스 디바이스 지원
- 쿠키 삭제 시에도 세션 유지 (토큰 기반)
- 동일 사용자의 모든 대화를 하나의 세션으로 통합

#### 패턴 3: Session Transfer Code (임시 코드)

```typescript
// Public 디바이스에서 코드 생성
const transferCode = await generateTransferCode(anonymousSessionId);
// 표시: "ABC123"

// Private 디바이스에서 코드 입력
await migrateSessionWithCode(transferCode, authenticatedUserId);
```

**사용 사례**:
- 공용 디바이스 → 개인 디바이스 전환
- 보안이 중요한 환경

#### 패턴 4: Session Invalidation & Reset (Infobip)

```typescript
// 로그아웃 시 세션 무효화
await invalidateSession(sessionId);

// 위젯에서 익명 세션으로 즉시 리셋
// 메시지 히스토리는 다음 인증 로그인까지 숨김
```

**참고 문서**:
- [Mastering Google ADK DatabaseSessionService](https://dev.to/greyisheepai/mastering-google-adk-databasesessionservice-and-events-complete-guide-to-event-injection-and-pdm)
- [Session Continuity - Crisp Chat SDK](https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/session-continuity/)
- [Live Chat: User types - Infobip](https://www.infobip.com/docs/live-chat/user-types)

---

## 3. 스트리밍 + 영속화 동시 처리

### 3.1 아키텍처 패턴: 데이터베이스 Reactivity Layer

#### Convex Pattern (권장)

**핵심 아이디어**:
HTTP 스트림과 서버-AI 연결을 분리하고, 데이터베이스를 중간 반응성 계층으로 사용

```typescript
// 1. 사용자 메시지 즉시 저장
const messageId = await ctx.runMutation(api.messages.create, {
  chatId,
  content: userMessage,
  role: 'user'
});

// 2. 비동기 백그라운드 액션 스케줄링
await scheduler.runAfter(0, api.ai.processStream, {
  chatId,
  messageId
});

// 3. 클라이언트는 즉시 응답 받고 연결 종료 가능
return { success: true, messageId };
```

**백그라운드 처리**:
```typescript
// actions/ai.ts
export const processStream = internalAction(async (ctx, args) => {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [...],
    stream: true,
  });

  let body = '';
  for await (const part of stream) {
    const token = part.choices[0].delta.content;
    body += token;

    // 데이터베이스에 점진적으로 업데이트
    await ctx.runMutation(api.messages.update, {
      messageId: args.messageId,
      content: body,
    });
  }
});
```

**클라이언트 구독**:
```typescript
// 실시간 업데이트 자동 수신
const messages = useQuery(api.messages.list, { chatId });

// 브라우저 새로고침 시에도 최신 상태 자동 복원
```

**장점**:
- 클라이언트 연결 종료 후에도 AI 응답 지속 처리
- 자동 상태 복원 (새로고침, 탭 전환)
- 멀티플레이어 업데이트 지원 (여러 사용자가 동시에 같은 대화 조회)
- 평균 레이턴시: 쿼리 ~17ms, 업데이트 ~7ms

**참고 문서**:
- [GPT Streaming with Persistent Reactivity](https://stack.convex.dev/gpt-streaming-with-persistent-reactivity)

---

### 3.2 선택적 영속화: Sentence Boundary Batching

#### Convex Persistent Text Streaming Component

**문제**:
모든 토큰마다 DB에 쓰면 불필요한 부하 발생

**해결책**:
문장 단위로 배치 업데이트

```typescript
export const stream = httpAction(async (ctx, request) => {
  const { streamId } = await request.json();

  // HTTP 스트림은 토큰마다 즉시 전송
  const stream = createAIStream();

  // DB 업데이트는 문장 경계에서만
  let buffer = '';
  let lastUpdate = Date.now();

  for await (const token of stream) {
    buffer += token;

    // HTTP로 즉시 전송
    response.write(token);

    // 문장 종료 또는 시간 경과 시 DB 업데이트
    if (isSentenceEnd(token) || Date.now() - lastUpdate > 200) {
      await ctx.runMutation(api.streams.update, {
        streamId,
        content: buffer,
      });
      lastUpdate = Date.now();
    }
  }

  return response;
});
```

**배치 전략**:
1. **문장 경계**: `.` `!` `?` 등 감지
2. **시간 기반**: 200ms마다 (토큰 누적)
3. **버퍼 크기**: 일정 크기 이상 시

**효과**:
- DB 쓰기 최대 80-90% 감소
- 클라이언트는 여전히 실시간 스트리밍 경험
- 연결 끊김 시에도 문장 단위로 복원 가능

**참고 문서**:
- [Persistent Text Streaming - Convex](https://www.convex.dev/components/persistent-text-streaming)

---

### 3.3 Stream Consumption Pattern

#### AI SDK의 consumeStream()

**문제**:
클라이언트 연결 끊김 시 스트림 처리 중단

**해결책**:
```typescript
export async function POST(request: Request) {
  const result = await streamText({
    model: openai('gpt-4'),
    messages: [...],
  });

  // 백그라운드에서 스트림 소비 (클라이언트 연결과 무관)
  result.consumeStream(); // await 하지 않음!

  // 클라이언트로 스트리밍 응답
  return result.toUIMessageStreamResponse({
    onFinish: async ({ messages }) => {
      // 스트림 완료 후 영속화
      await saveChat({ chatId, messages });
    },
  });
}
```

**작동 원리**:
1. `consumeStream()`은 백프레셔 없이 스트림 소비
2. 클라이언트 연결 끊겨도 백그라운드에서 계속 진행
3. `onFinish` 콜백에서 완전한 결과 영속화

**주의사항**:
- `await` 없이 호출 (비동기 백그라운드 실행)
- 서버리스 환경에서는 타임아웃 고려 필요

**참고 문서**:
- [AI SDK UI: Chatbot Message Persistence](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence)

---

### 3.4 Server-Sent Events (SSE) 구현

#### 기본 구조

```typescript
// Server
app.get('/api/stream/:chatId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const chatId = req.params.chatId;
  const lastEventId = req.headers['last-event-id'];

  // 재연결 시 누락된 이벤트 전송
  if (lastEventId) {
    const missedEvents = await getMissedEvents(chatId, lastEventId);
    missedEvents.forEach(event => {
      res.write(`id: ${event.id}\n`);
      res.write(`data: ${JSON.stringify(event.data)}\n\n`);
    });
  }

  // 실시간 스트림 연결
  const stream = subscribeToChat(chatId);
  stream.on('data', (chunk) => {
    res.write(`id: ${chunk.id}\n`);
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);

    // DB 저장 (비동기)
    saveChunk(chatId, chunk);
  });
});
```

```typescript
// Client
const eventSource = new EventSource(`/api/stream/${chatId}`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateUI(data);
};

eventSource.onerror = () => {
  // 자동 재연결 (Last-Event-ID 헤더 자동 전송)
  console.log('Reconnecting...');
};
```

#### Shopify 사례: Kafka + SSE

```go
// Golang SSE 서버
func (s *SSEServer) HandleStream(w http.ResponseWriter, r *http.Request) {
    // Kafka 토픽 구독
    consumer := s.kafka.Subscribe(topicName)

    // SSE 헤더 설정
    w.Header().Set("Content-Type", "text/event-stream")

    // 데이터 푸시
    for msg := range consumer.Messages() {
        fmt.Fprintf(w, "data: %s\n\n", msg.Value)
        w.(http.Flusher).Flush()

        // DB 저장
        s.db.Save(msg)
    }
}
```

**장점**:
- 폴링 제거 → 지연 시간 감소
- HTTP/2에서 100개 동시 스트림 지원
- 자동 재연결 + Last-Event-ID 기반 이벤트 복원

**제한사항**:
- HTTP/1.1에서는 도메인당 6개 연결 제한
- 단방향 통신 (양방향 필요 시 WebSocket)

**참고 문서**:
- [Using Server Sent Events to Simplify Real-time Streaming at Scale](https://shopify.engineering/server-sent-events-data-streaming)
- [Real-Time Data Streaming with Server-Sent Events (SSE)](https://dev.to/serifcolakel/real-time-data-streaming-with-server-sent-events-sse-1gb2)

---

### 3.5 스트리밍 타이밍 별 저장 전략 비교

| 전략 | 저장 시점 | 장점 | 단점 | 적합 사례 |
|-----|---------|------|------|----------|
| **Token-by-Token** | 모든 토큰마다 | 최대 정밀도 | DB 부하 극대 | 실시간 협업 에디터 |
| **Sentence Boundary** | 문장 종료 시 | 의미 단위 저장, 부하 감소 | 구현 복잡도 증가 | 일반 AI 챗봇 |
| **Time-Based Batching** | 200ms마다 | 예측 가능한 부하 | 임의 지점에서 끊김 | 로그 스트리밍 |
| **onFinish Only** | 스트림 완료 후 | 최소 부하 | 중간 상태 없음 | 단일 사용자 챗봇 |
| **Hybrid (권장)** | 시간 + 문장 경계 | 균형 잡힌 접근 | 구현 복잡 | 대부분의 프로덕션 |

**권장 Hybrid 구현**:
```typescript
let buffer = '';
let lastSave = Date.now();
const SAVE_INTERVAL = 200; // ms
const MIN_BUFFER_SIZE = 50; // chars

for await (const token of stream) {
  buffer += token;

  const shouldSave =
    isSentenceEnd(token) ||
    (Date.now() - lastSave > SAVE_INTERVAL && buffer.length > MIN_BUFFER_SIZE);

  if (shouldSave) {
    await saveToDatabase(buffer);
    lastSave = Date.now();
  }
}
```

---

## 4. Best Practices

### 4.1 URL 라우팅 전략

#### 1. 초기 검색 시작

```typescript
// 사용자가 /search 진입
router.push('/search'); // 또는 사용자가 직접 진입

// 서버/클라이언트에서 ID 생성
const chatId = await generateChatId(); // 서버 권장

// URL 업데이트 (히스토리 엔트리 생성 안함)
window.history.replaceState(
  { chatId },
  '',
  `/search/${chatId}`
);
```

**이유**:
- 뒤로가기 시 `/search`로 돌아가지 않음
- 북마크/공유 가능한 URL 즉시 제공

#### 2. 새로운 질문 (대화 이어가기)

```typescript
// 기존 대화에서 새 질문
const newChatId = await forkConversation(currentChatId);

// 새 히스토리 엔트리 생성
window.history.pushState(
  { chatId: newChatId },
  '',
  `/search/${newChatId}`
);
```

**이유**:
- 뒤로가기로 이전 대화 복원 가능
- 대화 분기(fork) 지원

#### 3. 공유 링크 전용 라우트

```typescript
// 읽기 전용 공유 페이지
/share/{chatId}

// 또는 쿼리 파라미터로 구분
/search/{chatId}?shared=true
```

**SEO 고려사항**:
```html
<!-- 서버 렌더링 시 메타 태그 주입 -->
<meta property="og:title" content="AI 검색 결과: {query}" />
<meta property="og:description" content="{summary}" />
<meta property="og:image" content="{thumbnail}" />
<meta property="og:url" content="https://example.com/share/{id}" />
```

---

### 4.2 데이터베이스 스키마 설계

#### Chat 테이블

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT, -- 첫 질문 또는 요약
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_shared BOOLEAN DEFAULT FALSE,
  share_token UUID UNIQUE, -- 공유 링크용 별도 토큰
  metadata JSONB -- 추가 메타데이터
);

CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_share_token ON chats(share_token) WHERE is_shared = TRUE;
```

#### Messages 테이블

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 스트리밍 상태 추적
  is_streaming BOOLEAN DEFAULT FALSE,
  stream_completed_at TIMESTAMPTZ,

  -- 도구 호출 및 메타데이터
  tool_calls JSONB,
  metadata JSONB,

  -- 순서 보장
  sequence INTEGER NOT NULL
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id, sequence);
CREATE INDEX idx_messages_streaming ON messages(chat_id) WHERE is_streaming = TRUE;
```

#### Citations 테이블 (Perplexity 스타일)

```sql
CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  position INTEGER, -- 본문 내 위치
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citations_message_id ON citations(message_id);
```

---

### 4.3 상태 관리 패턴

#### React Query + Optimistic Updates

```typescript
// hooks/useChat.ts
export function useChat(chatId: string) {
  const queryClient = useQueryClient();

  // 메시지 조회
  const { data: messages } = useQuery({
    queryKey: ['chat', chatId, 'messages'],
    queryFn: () => fetchMessages(chatId),
    refetchInterval: (data) => {
      // 스트리밍 중인 메시지가 있으면 1초마다 폴링
      const hasStreaming = data?.some(m => m.isStreaming);
      return hasStreaming ? 1000 : false;
    },
  });

  // 메시지 전송
  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      sendChatMessage(chatId, content),

    // Optimistic update
    onMutate: async (content) => {
      await queryClient.cancelQueries(['chat', chatId, 'messages']);

      const previous = queryClient.getQueryData(['chat', chatId, 'messages']);

      queryClient.setQueryData(['chat', chatId, 'messages'], (old) => [
        ...old,
        {
          id: 'temp-' + Date.now(),
          role: 'user',
          content,
          createdAt: new Date(),
        },
      ]);

      return { previous };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['chat', chatId, 'messages'],
        context.previous
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries(['chat', chatId, 'messages']);
    },
  });

  return { messages, sendMessage };
}
```

#### SSE 기반 실시간 업데이트

```typescript
// hooks/useStreamingMessage.ts
export function useStreamingMessage(chatId: string, messageId: string) {
  const [content, setContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/chat/${chatId}/messages/${messageId}/stream`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'token') {
        setContent(prev => prev + data.content);
      } else if (data.type === 'done') {
        setIsComplete(true);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      // 재연결은 EventSource가 자동 처리
      console.log('Connection lost, reconnecting...');
    };

    return () => eventSource.close();
  }, [chatId, messageId]);

  return { content, isComplete };
}
```

---

### 4.4 에러 처리 및 복원

#### 스트림 중단 처리

```typescript
// Server
export async function POST(request: Request) {
  const { chatId, messageId } = await request.json();

  try {
    const stream = await streamAI(messageId);

    // 클라이언트 연결 끊김 감지
    request.signal.addEventListener('abort', async () => {
      console.log('Client disconnected, continuing in background');

      // 백그라운드에서 계속 처리
      await consumeStreamToDatabase(stream, messageId);
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    // 에러 시 메시지 상태 업데이트
    await updateMessageStatus(messageId, 'error', error.message);
    throw error;
  }
}
```

#### 재연결 및 상태 복원

```typescript
// Client
class ResilientSSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string, onMessage: (data: any) => void) {
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      this.reconnectAttempts = 0; // 성공 시 리셋
      onMessage(JSON.parse(event.data));
    };

    this.eventSource.onerror = () => {
      this.eventSource?.close();

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
        this.reconnectAttempts++;

        setTimeout(() => {
          console.log(`Reconnecting (attempt ${this.reconnectAttempts})...`);
          this.connect(url, onMessage);
        }, delay);
      } else {
        // 최대 재시도 초과 시 DB에서 직접 조회
        this.fallbackToPolling();
      }
    };
  }

  private async fallbackToPolling() {
    console.log('Falling back to polling');
    // SSE 실패 시 HTTP 폴링으로 전환
    const interval = setInterval(async () => {
      const data = await fetch('/api/messages/' + messageId);
      if (data.isComplete) {
        clearInterval(interval);
      }
      updateUI(data);
    }, 2000);
  }
}
```

---

### 4.5 성능 최적화

#### 1. 메시지 페이지네이션

```typescript
// 무한 스크롤
export function useChatMessages(chatId: string) {
  return useInfiniteQuery({
    queryKey: ['chat', chatId, 'messages'],
    queryFn: ({ pageParam = 0 }) =>
      fetchMessages(chatId, { offset: pageParam, limit: 50 }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length * 50 : undefined,
  });
}
```

#### 2. 인덱싱 전략

```sql
-- 최신 메시지 조회 최적화
CREATE INDEX idx_messages_chat_latest
ON messages(chat_id, created_at DESC);

-- 전문 검색 (PostgreSQL)
CREATE INDEX idx_messages_content_fts
ON messages USING GIN(to_tsvector('english', content));

-- 파티셔닝 (대량 데이터)
CREATE TABLE messages_partitioned (
  LIKE messages INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE messages_2025_01 PARTITION OF messages_partitioned
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

#### 3. 캐싱 전략

```typescript
// Redis 캐싱
export async function getChatMessages(chatId: string) {
  const cacheKey = `chat:${chatId}:messages`;

  // 1. Redis 확인
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. DB 조회
  const messages = await db.query(
    'SELECT * FROM messages WHERE chat_id = $1 ORDER BY sequence',
    [chatId]
  );

  // 3. Redis에 캐싱 (TTL 5분)
  await redis.setex(cacheKey, 300, JSON.stringify(messages));

  return messages;
}

// 메시지 추가 시 캐시 무효화
export async function addMessage(chatId: string, message: Message) {
  await db.insertMessage(message);
  await redis.del(`chat:${chatId}:messages`);
}
```

---

### 4.6 SEO 및 공유 최적화

#### Open Graph 메타 태그 생성

```typescript
// app/share/[id]/page.tsx (Next.js App Router)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chat = await getSharedChat(params.id);

  const firstMessage = chat.messages.find(m => m.role === 'user');
  const summary = generateSummary(chat.messages);

  return {
    title: `AI 검색: ${firstMessage?.content.slice(0, 60)}...`,
    description: summary,
    openGraph: {
      title: firstMessage?.content,
      description: summary,
      url: `https://example.com/share/${params.id}`,
      siteName: 'AI Search',
      images: [
        {
          url: await generateOGImage(chat), // 동적 이미지 생성
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: firstMessage?.content,
      description: summary,
    },
  };
}
```

#### 동적 OG 이미지 생성 (Vercel OG)

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  const chat = await getChat(chatId);
  const firstQ = chat.messages[0]?.content;
  const firstA = chat.messages[1]?.content.slice(0, 200);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          padding: '60px',
        }}
      >
        <h1 style={{ color: '#fff', fontSize: 48 }}>
          {firstQ}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 32, marginTop: 20 }}>
          {firstA}...
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

#### robots.txt 설정

```txt
# robots.txt
User-agent: *
Allow: /
Allow: /share/*

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: https://example.com/sitemap.xml
```

#### Structured Data (JSON-LD)

```typescript
export function generateChatStructuredData(chat: Chat) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: chat.messages[0]?.content,
      text: chat.messages[0]?.content,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: chat.messages[1]?.content,
        author: {
          '@type': 'Organization',
          name: 'AI Search Assistant',
        },
      },
    },
  };
}
```

---

## 5. 구현 권장사항

### 5.1 단계별 구현 로드맵

#### Phase 1: 기본 영속화 (MVP)

**목표**: 검색 결과 저장 및 URL 공유

```typescript
// 1. 서버에서 Chat ID 생성
POST /api/chats
Response: { chatId: "uuid" }

// 2. 메시지 전송 및 저장
POST /api/chats/{chatId}/messages
Body: { content: "질문" }
Response: { messageId: "uuid" }

// 3. URL 업데이트
window.history.replaceState(null, '', `/search/${chatId}`);

// 4. 공유 링크 생성
POST /api/chats/{chatId}/share
Response: { shareUrl: "/share/{shareToken}" }
```

**필요 컴포넌트**:
- Chat 및 Message 테이블
- 기본 CRUD API
- URL 라우팅

---

#### Phase 2: 스트리밍 지원

**목표**: 실시간 응답 + 영속화

```typescript
// SSE 엔드포인트
GET /api/chats/{chatId}/messages/{messageId}/stream

// 클라이언트
const eventSource = new EventSource(url);
eventSource.onmessage = (e) => {
  updateUI(JSON.parse(e.data));
};

// 서버 (백그라운드 저장)
await scheduleBackgroundSave(messageId, stream);
```

**필요 컴포넌트**:
- SSE 엔드포인트
- 백그라운드 작업 큐
- 스트리밍 상태 추적

---

#### Phase 3: 세션 관리

**목표**: 익명 → 인증 전환

```typescript
// 익명 세션
const anonymousId = uuidv4();
localStorage.setItem('anonymousSessionId', anonymousId);

// 로그인 시 마이그레이션
POST /api/sessions/migrate
Body: {
  anonymousSessionId: localStorage.getItem('anonymousSessionId'),
  userId: currentUser.id
}

// 서버에서 세션 병합
await migrateAnonymousSessions(anonymousId, userId);
```

**필요 컴포넌트**:
- 익명 세션 추적
- 세션 마이그레이션 API
- 사용자 연결 로직

---

#### Phase 4: 고급 기능

**목표**: 멀티플레이어, 오프라인 지원, 고급 공유

```typescript
// WebSocket 실시간 동기화
const ws = new WebSocket(`/api/chats/${chatId}/realtime`);
ws.onmessage = (e) => {
  const { type, data } = JSON.parse(e.data);
  if (type === 'message_update') {
    updateMessage(data);
  }
};

// 오프라인 지원 (Service Worker)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 공유 권한 관리
POST /api/chats/{chatId}/permissions
Body: {
  users: [{ email: "user@example.com", role: "viewer" }]
}
```

**필요 컴포넌트**:
- WebSocket 서버
- Service Worker
- 권한 관리 시스템
- 오프라인 큐

---

### 5.2 Careerly v2 적용 방안

#### 현재 구조 분석

```typescript
// 현재 API 클라이언트 구조
lib/api/
├── clients/          # REST, GraphQL, SSE 클라이언트
├── services/         # auth, search, user, discover
├── hooks/
│   ├── queries/
│   └── mutations/
├── auth/             # 토큰 관리
├── types/
└── interceptors/     # 에러 처리
```

#### 권장 확장 구조

```typescript
lib/api/
├── clients/
│   ├── rest.ts
│   ├── sse.ts         # ✅ 기존
│   └── websocket.ts   # 🆕 실시간 동기화용 (선택)
├── services/
│   ├── search.ts      # ✅ 기존
│   └── chat.ts        # 🆕 대화 영속화 서비스
├── hooks/
│   ├── queries/
│   │   ├── useSearch.ts          # ✅ 기존
│   │   ├── useChatMessages.ts    # 🆕
│   │   └── useSharedChat.ts      # 🆕
│   └── mutations/
│       ├── useLogin.ts            # ✅ 기존
│       ├── useSendMessage.ts     # 🆕
│       └── useShareChat.ts       # 🆕
└── types/
    ├── search.ts      # ✅ 기존
    └── chat.ts        # 🆕 Chat, Message, Citation 타입
```

#### 구현 예시

**1. Chat 서비스 추가**

```typescript
// lib/api/services/chat.ts
import { apiClient } from '../clients/rest';
import type { Chat, Message, CreateChatRequest } from '../types/chat';

export const chatService = {
  // Chat CRUD
  async createChat(data: CreateChatRequest): Promise<Chat> {
    return apiClient.post('/chats', data);
  },

  async getChat(chatId: string): Promise<Chat> {
    return apiClient.get(`/chats/${chatId}`);
  },

  async getChatMessages(chatId: string, offset = 0, limit = 50): Promise<Message[]> {
    return apiClient.get(`/chats/${chatId}/messages`, {
      params: { offset, limit },
    });
  },

  // 메시지 전송
  async sendMessage(chatId: string, content: string): Promise<Message> {
    return apiClient.post(`/chats/${chatId}/messages`, { content });
  },

  // 스트리밍 (SSE 클라이언트 활용)
  streamMessage(chatId: string, messageId: string): EventSource {
    return new EventSource(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/chats/${chatId}/messages/${messageId}/stream`,
      { withCredentials: true } // HttpOnly 쿠키 전송
    );
  },

  // 공유
  async shareChat(chatId: string): Promise<{ shareToken: string; shareUrl: string }> {
    return apiClient.post(`/chats/${chatId}/share`);
  },

  async getSharedChat(shareToken: string): Promise<Chat> {
    return apiClient.get(`/share/${shareToken}`);
  },
};
```

**2. React Query 훅**

```typescript
// lib/api/hooks/queries/useChatMessages.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { chatService } from '../../services/chat';

export function useChatMessages(chatId: string) {
  return useInfiniteQuery({
    queryKey: ['chat', chatId, 'messages'],
    queryFn: ({ pageParam = 0 }) =>
      chatService.getChatMessages(chatId, pageParam, 50),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 50 ? pages.length * 50 : undefined,
    enabled: !!chatId,
  });
}

// lib/api/hooks/mutations/useSendMessage.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../services/chat';

export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      chatService.sendMessage(chatId, content),

    onMutate: async (content) => {
      // Optimistic update
      await queryClient.cancelQueries(['chat', chatId, 'messages']);

      const previous = queryClient.getQueryData(['chat', chatId, 'messages']);

      queryClient.setQueryData(['chat', chatId, 'messages'], (old: any) => ({
        ...old,
        pages: [
          ...old.pages.slice(0, -1),
          [...old.pages[old.pages.length - 1], {
            id: 'temp-' + Date.now(),
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
          }],
        ],
      }));

      return { previous };
    },

    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['chat', chatId, 'messages'], context.previous);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries(['chat', chatId, 'messages']);
    },
  });
}

// lib/api/hooks/queries/useStreamingMessage.ts
import { useEffect, useState } from 'react';
import { chatService } from '../../services/chat';

export function useStreamingMessage(chatId: string, messageId: string) {
  const [content, setContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chatId || !messageId) return;

    const eventSource = chatService.streamMessage(chatId, messageId);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'token') {
        setContent(prev => prev + data.content);
      } else if (data.type === 'done') {
        setIsComplete(true);
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      setError(new Error('Stream connection error'));
      eventSource.close();
    };

    return () => eventSource.close();
  }, [chatId, messageId]);

  return { content, isComplete, error };
}
```

**3. 컴포넌트 사용 예시**

```typescript
// components/search/ChatInterface.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatMessages, useSendMessage } from '@/lib/api';

export function ChatInterface({ initialChatId }: { initialChatId?: string }) {
  const router = useRouter();
  const [chatId, setChatId] = useState(initialChatId);

  const { data, fetchNextPage, hasNextPage } = useChatMessages(chatId!);
  const sendMessage = useSendMessage(chatId!);

  const handleSendMessage = async (content: string) => {
    if (!chatId) {
      // 새 대화 생성
      const newChat = await chatService.createChat({ title: content.slice(0, 60) });
      setChatId(newChat.id);

      // URL 업데이트 (히스토리 엔트리 생성 안함)
      window.history.replaceState(
        { chatId: newChat.id },
        '',
        `/search/${newChat.id}`
      );
    }

    sendMessage.mutate(content);
  };

  return (
    <div>
      <MessageList
        messages={data?.pages.flat() ?? []}
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage}
      />
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}

// components/search/StreamingMessage.tsx
'use client';

import { useStreamingMessage } from '@/lib/api';

export function StreamingMessage({ chatId, messageId }: Props) {
  const { content, isComplete, error } = useStreamingMessage(chatId, messageId);

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="message">
      <Markdown>{content}</Markdown>
      {!isComplete && <StreamingIndicator />}
    </div>
  );
}
```

**4. Django 백엔드 API 엔드포인트 (참고)**

```python
# careerly_backend/chat/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import StreamingHttpResponse
import json
import asyncio

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        chat = self.get_object()
        chat.is_shared = True
        chat.share_token = uuid.uuid4()
        chat.save()

        return Response({
            'shareToken': str(chat.share_token),
            'shareUrl': f'/share/{chat.share_token}'
        })

    @action(detail=True, methods=['get'])
    def stream_message(self, request, pk=None, message_id=None):
        """SSE 스트리밍 엔드포인트"""

        def event_stream():
            # AI 응답 스트리밍
            for chunk in ai_service.stream_response(message_id):
                yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        response = StreamingHttpResponse(
            event_stream(),
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'  # Nginx 버퍼링 비활성화

        return response

# urls.py
router.register(r'chats', ChatViewSet)

# 공유 링크 조회 (별도 엔드포인트)
path('share/<uuid:share_token>/', SharedChatView.as_view()),
```

---

### 5.3 체크리스트

#### 기능 구현
- [ ] Chat 및 Message 데이터 모델 정의
- [ ] 서버 측 Chat ID 생성 API
- [ ] 메시지 CRUD API
- [ ] SSE 스트리밍 엔드포인트
- [ ] 백그라운드 영속화 작업 큐
- [ ] 공유 링크 생성 및 조회 API
- [ ] 익명 세션 → 인증 세션 마이그레이션
- [ ] URL 라우팅 (replaceState/pushState)

#### 성능 최적화
- [ ] 데이터베이스 인덱싱
- [ ] 메시지 페이지네이션
- [ ] Redis 캐싱
- [ ] SSE 재연결 로직
- [ ] Optimistic UI 업데이트

#### SEO 및 공유
- [ ] Open Graph 메타 태그
- [ ] 동적 OG 이미지 생성
- [ ] robots.txt 설정 (AI 봇 허용)
- [ ] Structured Data (JSON-LD)
- [ ] Sitemap 생성

#### 보안 및 에러 처리
- [ ] 공유 링크 권한 검증
- [ ] Rate limiting
- [ ] 스트림 중단 처리
- [ ] 클라이언트 재연결 로직
- [ ] 에러 로깅 및 모니터링

#### 테스트
- [ ] 단위 테스트 (서비스, 훅)
- [ ] 통합 테스트 (API 엔드포인트)
- [ ] E2E 테스트 (사용자 플로우)
- [ ] 스트리밍 안정성 테스트
- [ ] 동시성 테스트 (멀티플레이어)

---

## 참고 문서

### URL 패턴 및 공유
- [Perplexity AI's shareable pages - TechCrunch](https://techcrunch.com/2024/05/30/perplexity-ais-new-feature-will-turn-your-searches-into-sharable-pages/)
- [ChatGPT Shared Links FAQ - OpenAI](https://help.openai.com/en/articles/7925741-chatgpt-shared-links-faq)
- [Pushstate vs Replacestate - ThatWare](https://thatware.co/pushstate-vs-replacestate/)

### ID 생성
- [Generating Id's Server vs Client side - Stack Overflow](https://stackoverflow.com/questions/59966008/generating-ids-server-vs-client-side)
- [Should I generate GUID/UUID on client or server?](https://softwareengineering.stackexchange.com/questions/367347/should-i-generate-guid-uuid-on-client-or-server)

### 스트리밍 + 영속화
- [AI SDK UI: Chatbot Message Persistence](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence)
- [Persistent Text Streaming - Convex](https://www.convex.dev/components/persistent-text-streaming)
- [GPT Streaming with Persistent Reactivity - Convex](https://stack.convex.dev/gpt-streaming-with-persistent-reactivity)
- [Server Sent Events at Scale - Shopify Engineering](https://shopify.engineering/server-sent-events-data-streaming)

### 세션 관리
- [Mastering Google ADK DatabaseSessionService - DEV](https://dev.to/greyisheepai/mastering-google-adk-databasesessionservice-and-events-complete-guide-to-event-injection-and-pdm)
- [Session Continuity - Crisp Chat SDK](https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/session-continuity/)

### 아키텍처
- [Perplexity AI Architecture - Graph AI](https://www.graphapp.ai/blog/perplexity-technical-deep-dive-understanding-the-complexities)
- [Architecting AI-First Search API - Perplexity](https://www.perplexity.ai/api-platform/resources/architecting-and-evaluating-an-ai-first-search-api)

### SEO
- [GEO Optimization Guide - Passionfruit](https://www.getpassionfruit.com/blog/generative-engine-optimization-guide-for-chatgpt-perplexity-gemini-claude-copilot)
- [AI Search Optimization - Marketing Aid](https://www.marketingaid.io/ai-search-optimization/)

---

## 결론

AI 검색 서비스의 대화 영속화 및 공유 패턴은 다음 핵심 요소로 구성됩니다:

1. **URL 구조**: 서버 생성 UUID 기반 permalink (`/search/{id}`, `/share/{id}`)
2. **ID 생성**: 서버 측 생성 권장 (무결성, 보안)
3. **스트리밍 + 영속화**: 데이터베이스를 reactivity layer로 활용한 분리 아키텍처
4. **저장 타이밍**: Hybrid 전략 (문장 경계 + 시간 기반 배치)
5. **세션 관리**: 이벤트 마이그레이션 또는 토큰 기반 연결
6. **상태 복원**: SSE Last-Event-ID 또는 React Query 자동 재조회

Careerly v2는 기존 API 클라이언트 구조를 확장하여 이러한 패턴을 점진적으로 적용할 수 있습니다.
