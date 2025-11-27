# E2E 테스트 실행 (Chrome DevTools MCP)

Chrome DevTools MCP를 사용하여 Careerly 프론트엔드 E2E 테스트를 실행합니다.

## 테스트 대상 URL
- Base URL: http://localhost:3000

## 테스트 시나리오

### 1. 페이지 로드 테스트
- [ ] 메인 페이지 (`/`) 로드 확인
- [ ] Community 페이지 (`/community`) 로드 확인
- [ ] Discover 페이지 (`/discover`) 로드 확인

### 2. API 헬스체크
- [ ] `GET /api/v1/posts/?page=1` - Post 목록 조회
- [ ] `GET /api/v1/questions/?page=1` - Question 목록 조회
- [ ] `GET /api/v1/posts/{id}/` - Post 상세 조회
- [ ] `GET /api/v1/comments/?postId={id}` - 댓글 조회

### 3. 인증 플로우
- [ ] 로그인 모달 열기/닫기
- [ ] 로그인 실패 케이스 (잘못된 자격증명 → 401)
- [ ] 회원가입 모달 열기/닫기
- [ ] 회원가입 성공 → 자동 로그인
- [ ] 로그아웃 기능

### 4. 커뮤니티 기능
- [ ] Post 목록 렌더링
- [ ] Post 클릭 → 상세 Drawer 열기
- [ ] 탭 전환 (Posts/Questions)
- [ ] 좋아요/저장 상태 조회 (로그인 시)

## 실행 방법

1. `mcp__chrome-devtools__navigate_page`로 각 페이지 이동
2. `mcp__chrome-devtools__take_snapshot`으로 UI 상태 확인
3. `mcp__chrome-devtools__list_network_requests`로 API 응답 확인
4. `mcp__chrome-devtools__list_console_messages`로 에러 확인
5. `mcp__chrome-devtools__click`, `mcp__chrome-devtools__fill`로 상호작용

## 결과 리포트

테스트 완료 후 `e2e/reports/` 폴더에 결과를 저장합니다:
- `e2e-report-{timestamp}.html` - HTML 리포트
- 각 테스트 항목의 pass/fail 상태
- 발견된 이슈 및 수정 TODO

## 테스트 실행

위 체크리스트를 순서대로 실행하고, 각 항목의 결과를 기록한 후 HTML 리포트를 생성해주세요.
