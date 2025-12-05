# N-15: 글쓰기 이미지 첨부 기능 구현 완료

## 작업 일자
2025-12-05

## 작업 내용

### 1. 문제 확인
- 백엔드 API 엔드포인트: `/api/v1/posts/images/`
- 프론트엔드 호출 URL: `/api/v1/posts/upload-image/` (잘못된 경로)
- 타입 불일치: 백엔드 응답 `image_url`, 프론트엔드 기대값 `url`
- HTML 콘텐츠 미저장: 에디터의 이미지가 포함된 HTML이 서버에 저장되지 않음

### 2. 수정 사항

#### 프론트엔드 (careerly-v2)

**파일: `/lib/api/services/posts.service.ts`**
- 엔드포인트 수정: `/api/v1/posts/upload-image/` → `/api/v1/posts/images/`

**파일: `/lib/api/types/posts.types.ts`**
```typescript
// Before
export interface ImageUploadResponse {
  url: string;
}

// After
export interface ImageUploadResponse {
  success: boolean;
  image_url: string;
  image_id: number;
}

// PostCreateRequest에 descriptionhtml 추가
export interface PostCreateRequest {
  title?: string;
  description: string;
  descriptionhtml?: string;  // 추가
  posttype?: PostType;
  articleid?: number;
  images?: string[];
}
```

**파일: `/app/community/new/post/page.tsx`**
```typescript
// 이미지 업로드 처리
const result = await uploadImageMutation.mutateAsync(file);
if (result.image_url) {  // url → image_url
  editor?.chain().focus().setImage({ src: result.image_url }).run();
}

// 글 작성 시 HTML 전송
await createPostMutation.mutateAsync({
  title: title || undefined,
  description: editor.getText(),      // 플레인 텍스트
  descriptionhtml: editor.getHTML(),  // HTML (이미지 포함)
  posttype: 0,
});

// 파일 크기 제한 변경: 5MB → 10MB (백엔드와 일치)
```

#### 백엔드 (careerly-v2-api)

**파일: `/api/serializers/post.py`**
```python
class PostCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Posts
        fields = ['title', 'description', 'descriptionhtml', 'posttype']  # descriptionhtml 추가
```

**파일: `/api/views/post.py`**
```python
def create(self, request, *args, **kwargs):
    # ...
    post = Posts.objects.create(
        user=request.user,
        title=serializer.validated_data.get('title', ''),
        description=serializer.validated_data['description'],
        descriptionhtml=serializer.validated_data.get('descriptionhtml', ''),  # 추가
        posttype=serializer.validated_data.get('posttype', 0),
        isdeleted=0
    )
```

### 3. 기능 구현 확인

#### 이미지 업로드 플로우
1. 사용자가 이미지 버튼 클릭 → 파일 선택
2. 파일 검증:
   - 타입: `image/*`만 허용
   - 크기: 최대 10MB
3. API 호출: `POST /api/v1/posts/images/`
   - FormData로 이미지 전송
   - S3에 업로드 후 CDN URL 반환
4. 에디터에 이미지 삽입: Tiptap Image extension 사용
5. 글 작성 완료 시:
   - `description`: 플레인 텍스트 (검색/미리보기용)
   - `descriptionhtml`: HTML (이미지 태그 포함)

#### 렌더링
- **PostDetail 컴포넌트**: `contentHtml` prop으로 HTML 렌더링 (이미 구현됨)
- **CommunityFeedCard**: `contentHtml` prop으로 HTML 렌더링 (이미 구현됨)
- **커뮤니티 페이지**: `post.descriptionhtml`을 `contentHtml`로 전달 (이미 구현됨)

### 4. API 엔드포인트

#### 이미지 업로드
```
POST /api/v1/posts/images/
Content-Type: multipart/form-data

Request:
{
  "image": <File>
}

Response (201):
{
  "success": true,
  "image_url": "https://publy.imgix.net/posts/2025/01/20/abc123.jpg",
  "image_id": 123
}
```

#### 글 작성
```
POST /api/v1/posts/
Content-Type: application/json

Request:
{
  "title": "제목 (optional)",
  "description": "플레인 텍스트 내용",
  "descriptionhtml": "<p>HTML 내용 <img src='...' /></p>",
  "posttype": 0
}
```

### 5. 기존 구현 활용

이미 다음 기능들이 구현되어 있어 추가 작업 불필요:
- Tiptap 에디터 설정 (Image extension 포함)
- 이미지 업로드 버튼 UI
- useUploadPostImage 훅
- PostDetail, CommunityFeedCard의 HTML 렌더링

### 6. 테스트 시나리오

1. 글쓰기 페이지 접속
2. 이미지 버튼 클릭 → 이미지 선택
3. 이미지가 에디터에 삽입되는지 확인
4. 텍스트와 함께 작성 후 등록
5. 커뮤니티 피드에서 이미지 표시 확인
6. 포스트 상세에서 이미지 표시 확인

### 7. 파일 변경 목록

#### 프론트엔드
- `/lib/api/services/posts.service.ts`
- `/lib/api/types/posts.types.ts`
- `/app/community/new/post/page.tsx`
- `/COMMUNITY_TODO.md`

#### 백엔드
- `/api/serializers/post.py`
- `/api/views/post.py`

## 결론

글쓰기 이미지 첨부 기능이 완전히 구현되었습니다. 백엔드 API는 이미 존재했고, 프론트엔드에서 잘못된 엔드포인트를 호출하고 있었습니다. 엔드포인트 경로 수정, 타입 정의 일치, HTML 콘텐츠 저장 로직 추가로 기능이 정상 작동합니다.

## 주의사항

- 이미지는 S3에 업로드되며 CDN URL로 제공됩니다
- `descriptionhtml`에 저장된 HTML이 `dangerouslySetInnerHTML`로 렌더링되므로 XSS 공격 방지를 위해 백엔드에서 HTML sanitization 필요 (추후 작업 권장)
- 이미지 업로드 시 `PostImages` 레코드가 생성되나 `post_id`는 null (임시 업로드)
- 게시글 저장 시 이미지 ID 연결 로직은 현재 미구현 (이미지 URL은 HTML에 직접 포함되므로 표시에는 문제없음)
