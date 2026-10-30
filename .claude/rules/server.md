---
paths:
  - "src/app/api/**"
  - "src/lib/server/**"
---
# 서버 코드 규칙

- LLM을 호출하는 라우트는 호출 전에 `guardLlmRequest`(`src/lib/server/guard.ts`)로 입력 길이와 요청 횟수를 검사한다.
- 모델명과 추론 강도는 코드에 박지 않는다. 목적별 환경변수(`OPENAI_MODEL_PARSE`, `OPENAI_MODEL_CONSULT`, `OPENAI_REASONING_PARSE`, `OPENAI_REASONING_CONSULT`)로만 지정한다. 근거는 `docs/adr/0001-llm-model-selection.md`.
- 비밀값(`OPENAI_API_KEY` 등)을 `NEXT_PUBLIC_` 접두사로 만들거나 응답에 담지 않는다.
- Dexie(IndexedDB)는 브라우저에서만 동작한다. Route Handler에서 부르지 않는다.
- 요청 제한은 서버 메모리 기반이라 Vercel에서 인스턴스마다 따로 센다. 실제 지출 상한은 OpenAI 선불 크레딧이 맡는다.
