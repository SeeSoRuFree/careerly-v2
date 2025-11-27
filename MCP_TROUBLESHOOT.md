# MCP 연결 안될 때 해결 프롬프트

## 문제 상황
`/mcp` 명령어 실행 시 "No MCP servers configured" 메시지가 나오는 경우

## 해결 프롬프트 (복사해서 사용)

```
MCP 서버가 /mcp에서 안 보여. 다음 순서로 해결해줘:

1. 먼저 설정 파일들 확인:
   - ~/.claude/settings.json
   - ~/.claude/settings.local.json
   - ~/.claude.json

2. settings.local.json에 enabledMcpjsonServers가 있으면 거기에 필요한 MCP 서버 이름 추가해줘

3. 또는 claude mcp add 명령어로 직접 추가:
   claude mcp add <서버이름> -- <실행명령어>

4. /doctor 실행해서 다른 문제 있는지 확인

5. 세션 완전히 종료 후 재시작 (resume 말고 새 세션)
```

## 원인별 해결

### 1. enabledMcpjsonServers 화이트리스트 문제
`~/.claude/settings.local.json`에 특정 서버만 허용되어 있는 경우:

```json
{
  "enabledMcpjsonServers": [
    "supabase",
    "puppeteer",
    "chrome-devtools"  // ← 사용할 서버 추가
  ]
}
```

### 2. 중복 설치 문제 (/doctor에서 Multiple installations found)
```bash
# orphaned 패키지 삭제
rm -rf /opt/homebrew/lib/node_modules/@anthropic-ai/claude-code
```

### 3. claude mcp add로 직접 추가
```bash
# Chrome DevTools MCP
claude mcp add chrome-devtools -- npx chrome-devtools-mcp@latest

# Puppeteer MCP
claude mcp add puppeteer -- npx @anthropic-ai/puppeteer-mcp

# 설치 확인
claude mcp list
```

### 4. 세션 재시작
```bash
exit
claude  # resume 없이 새로 시작
```

## 주의사항
- `resume`은 기존 세션 이어받기라 설정이 새로 로드 안됨
- MCP 설정 변경 후 반드시 **완전히 새 세션** 시작 필요
- `claude mcp list`로 연결 상태 확인 가능
