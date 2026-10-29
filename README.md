# 꼬리노트

반려견 기록과 AI 보조 보호자. 채팅으로 기록하고, 쌓인 기록을 근거로 상담해요.

> 이 앱은 진단 도구가 아닙니다. 응급이 의심되면 가까운 24시간 동물병원에 바로 연락하세요.

## 실행

```bash
npm install
cp .env.example .env.local   # OPENAI_API_KEY 입력 (모델명은 기본값이 채워져 있음)
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다. 기록은 브라우저(IndexedDB)에 저장됩니다.

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run typecheck` | 타입 검사 |
| `npm test` | Vitest |

## 구조

- `src/lib/domain` 값 목록, 타입(Zod), 순수 로직
- `src/lib/storage` 저장소 인터페이스와 IndexedDB 구현
- `src/lib/server` 요청 횟수·입력 길이 제한 등 서버 전용 코드
- `src/app/api` LLM을 호출하는 서버 라우트 (API 키는 서버에서만 사용)

자세한 개발 규칙은 `CLAUDE.md`를 참고하세요.
