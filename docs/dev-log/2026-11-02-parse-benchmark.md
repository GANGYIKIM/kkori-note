# 칩 만들기 방식 비교: 코드만 / LLM만 / 코드 + LLM (R 없음)

- 관련 R: R1(R1-4 처리 순서), R8
- 브랜치: `demo`
- 영향받는 지표: M6, M7
- 발표 자료 원본: `docs/ppt/parse-comparison.md`

## 계획

### 만들 것

**시험지** `scripts/metrics/parse-cases.ts`
- `PARSE_CASES_VERSION = 1`, `PARSE_CASES`: 46문장. 문장마다 `text`, `category`, `dogName`(없으면 "곰순이"), `expected`(정답 기록 목록)
- 정답 기록: `kindId`, `values`(맞아야 하는 칸만), `time`(`"HH:MM"` 또는 `"day"`, 선택), `durationSec`(선택)
- 기준 시각 `2026-11-02T15:00:00+09:00`, 시간대 `Asia/Seoul`

| 분류 | 문장 수 |
|---|---|
| 배변 상태 다른 표현 | 8 |
| 종류 다른 표현 | 5 |
| 한 문장 여러 기록 | 4 |
| 시각·지속시간 | 3 |
| 강아지 이름 함정 (이름 "초코") | 2 |
| 부정·반대 표현 | 2 |
| 위험 음식 | 2 |
| 사전에 없는 일 (메모) | 2 |
| 질문·인사·이름 (정답: 기록 없음) | 3 |
| 비속어 | 2 |
| 민감정보 (가짜 주민번호·전화번호, 정답: 기록 없음) | 2 |
| 남의 일·안 한 일·계획 (정답: 기록 없음) | 3 |
| 표기 변형 (오타·영어·이모지) | 3 |
| 횟수·세부 값 | 3 |
| 이상한 입력 (정답: 기록 없음) | 2 |

**채점** `scripts/metrics/score.ts`
- `scoreCase(expected, drafts, timeZone)`: 기록 종류 묶음이 같고, 정답에 적은 칸·시각·지속시간이 모두 맞으면 `true`

**LLM 호출** `src/lib/server/chat-llm.ts`
- `callChatLlm(input, { apiKey, model })` → `{ turn, usage: { inputTokens, outputTokens }, ms }`. 출력 모양이 맞지 않거나 호출이 실패하면 예외를 던진다
- `/api/chat`이 이 함수를 쓴다. 응답 모양은 그대로다

**방식 고르기** `src/lib/domain/parse-route.ts`
- `looksLikeQuestion(text)`: `?`가 있음 / 문장 끝이 `까`·`니`·`나요`·`가요`·`죠`·`냐`·`어때` / `몇`·`언제`·`왜`·`어떻게`·`얼마나`·`어땠`이 있음
- `chooseParser(text, extracted)` → `"code" | "llm"`. `needsLlm`이거나 질문처럼 보이면 `"llm"`

**측정 실행** `scripts/metrics/parse.metrics.ts`, `vitest.metrics.config.mts`, `npm run metrics`
- 코드만 = `extractEntries`, LLM만 = `callChatLlm` → `toDrafts`, 코드 + LLM(A) = 문장마다 `chooseParser`로 두 결과 중 하나. LLM이 실패한 문장은 코드 결과를 쓴다
- LLM은 3번 돌려 평균. 호출은 순서대로 한다
- 콘솔: 방식별 정답률, 분류별 정답 수, LLM 호출 수, 토큰, 비용, 평균 시간, 틀린 문장, 코드가 다 채웠다고 했는데 틀린 문장
- `docs/metrics.csv`에 `id,date,commit,testset,mode,value` 줄 추가
- 비용: gpt-6-luna $0.10 / $0.50 (1M 토큰, ADR-0001)
- `.env.local`은 설정 파일에서 `node:util`의 `parseEnv`로 읽는다
- `npm test`에는 들어가지 않는다. `scripts/**/*.test.ts`는 `npm test`에 넣는다

**지표** `docs/metrics.md`: M6 기록 시험지 정답률(방식별), M7 메시지 1,000개당 LLM 비용(USD, 방식별). csv 칸 정의를 고치고 "`npm run metrics`는 아직 없다" 문단을 지운다

### 바꾸는 곳

- 새 파일: `src/lib/server/chat-llm.ts`, `src/lib/domain/parse-route.ts`, `scripts/metrics/parse-cases.ts`, `scripts/metrics/score.ts`, `scripts/metrics/parse.metrics.ts`, `vitest.metrics.config.mts`, `docs/metrics.csv`
- 고치는 파일: `src/app/api/chat/route.ts`, `vitest.config.mts`, `package.json`, `docs/metrics.md`

### 완료 기준

- 이 작업으로 체크하는 PRD 수락 기준: 없음. 측정 도구다

| 기준 | 확인 방법 |
|---|---|
| 질문 규칙과 방식 고르기 | `parse-route.test.ts` |
| 채점 규칙 | `score.test.ts` |
| 라우트 동작이 그대로임 | `guard-coverage.test.ts` 통과 + 앱에서 기록 문장 하나 보내 수동 확인 |
| 측정이 끝까지 돌고 csv에 6줄이 쌓임 | `npm run metrics` 결과를 아래 결과에 붙임 |
| 형식·타입·빌드 | `lint`, `typecheck`, `test`, `build` |

### 범위 밖

- 데모 화면에 코드 + LLM 연결: 결과를 본 뒤 다음 계획
- B(LLM이 빈 칸만 채움): A의 결과를 보고 제안
- 의도·답변 문장·이름 저장의 채점
- 사전 확장(R8)

## 결과

### 2026-11-02 · (커밋 전)

- 왜: 처음 구현
- 한 일: `callChatLlm`을 라우트에서 분리하고, `looksLikeQuestion`·`chooseParser`, 시험지 46문장, 채점 `scoreCase`, `npm run metrics`를 만들었다. 측정을 두 번 돌렸다(결과와 해석은 `docs/ppt/parse-comparison.md` 6~8절, 원본은 `scripts/metrics/parse-report.md`와 `docs/metrics.csv`). M6: code 71.7%, llm 96.4%, hybrid 94.2%. M7: code $0, llm $0.1713, hybrid $0.0661(1,000개당). 코드가 다 채웠다고 한 28문장 중 2문장이 틀렸다.
- 수동 확인: `next start`로 띄운 서버에 `/api/chat`으로 기록 문장 하나와 빈 문장을 보냈다. 기록 문장은 이전과 같은 모양(`intent`, `reply`, `dogName`, `entries`)으로 응답했고, 빈 문장은 `empty_input`으로 막혔다.
- 결정과 맞바꾼 것:
  - 시험지 v1로 두 번 쟀다. 첫 실행은 콘솔 출력이 남지 않아 문장별 결과가 없어서 다시 돌렸다. csv에는 두 실행이 모두 남아 있다.
  - 민감정보 문장의 주민번호·전화번호는 형식만 맞춘 가짜 값이다. 시험지는 커밋되고 측정 때마다 OpenAI로 전송되기 때문이다.
  - 인사·이름 문장은 기록이 없으면 정답이라, 코드만 쓴 방식은 아무것도 몰라도 맞힌다.
- 계획과 달라진 점:
  - 시험지가 30문장에서 46문장이 됐다. 사용자가 준 2문장(비속어, 민감정보)과 엣지 케이스 14문장을 더했다. 분류가 9개에서 15개로 늘었다.
  - 리포트를 콘솔이 아니라 `scripts/metrics/parse-report.md`에 쓴다(실행할 때마다 덮어씀).
- AI가 틀렸다가 고친 것:
  - 설정 파일이 읽히는지만 보려고 `OPENAI_API_KEY=`를 비우고 `vitest.metrics.config.mts`를 실행했다 → 설정이 `.env.local`을 `test.env`로 다시 넣어서, 시험지 검토 전에 실제 LLM 측정(약 90회 호출)이 돌았다 → 실행이 길어지는 것을 보고 알아챘다. 사용자에게 알리고, 그 실행으로 생긴 csv를 지웠다.
  - 결과를 `console.log`로만 냈다 → vitest가 통과한 테스트의 콘솔 출력을 보여주지 않아 첫 정식 측정의 문장별 결과를 잃었다 → 출력에 숫자가 없는 것을 보고, 리포트를 파일로 쓰게 바꿔 다시 돌렸다.
  - 처음 30문장을 사전 코드를 본 상태에서 썼다 → 시험 실행에서 확신 오답이 0건이라 시험지가 쉬웠을 수 있었다 → 사용자에게 알리고 엣지 케이스를 더하자 확신 오답 2건("옆집 개가 설사했대", "오늘은 비 와서 산책 못 했어")이 나왔다.

### 2026-11-02 · (커밋 전) · 확신 오답 고치기

- 왜: 첫 측정에서 코드가 다 채웠다고 한 문장 중 2문장("옆집 개가 설사했대", "오늘은 비 와서 산책 못 했어")이 틀렸고, 코드 + LLM이 LLM만보다 1문장 낮았다.
- 한 일:
  - `mentionsNotDoneOrOthers`를 더해 `chooseParser`가 다른 개·전해 들은 말·하지 않은 일·앞으로 할 일이면 LLM을 고르게 했다.
  - `buildChatGuide`의 entries 규칙에 "실제로 있었던 일만 남긴다(하지 않은 일·앞으로 할 일·다른 개의 일 제외). 다른 개 때문에 이 강아지에게 생긴 일은 기록한다"를 더했다. 이 프롬프트는 앱의 `/api/chat`에도 그대로 쓰인다.
  - 같은 시험지 v1로 두 번 더 쟀다.
  - 결과: 코드 + LLM 정답률 94.2% → 98.6%(1차) → 100%(2차). 1,000개당 비용 $0.0661 → $0.0759, 확신 오답 2 → 0. 단계별 표와 데모 대비 비교는 `docs/ppt/parse-comparison.md` 9절.
- 수동 확인: 없음. 앱 동작의 변화는 프롬프트 한 줄이고, 측정이 같은 함수(`callChatLlm`)로 확인했다.
- 결정과 맞바꾼 것:
  - LLM으로 보내는 문장이 18 → 20개로 늘고 프롬프트가 길어져 비용이 약 15% 늘었다. 확신 오답을 없애는 쪽을 택했다.
  - 규칙은 틀린 두 문장을 보고 만들었다. 같은 시험지로 다시 쟀기 때문에 100%는 과적합일 수 있다. 시험지에 없는 표현은 `parse-route.test.ts`에 넣었다.
  - csv의 커밋 칸이 네 번 모두 `52472f9+dirty`라 줄의 순서로만 구분된다. 1~6줄 첫 실행, 7~12줄 두 번째 실행(수정 전), 13~18줄 1차, 19~24줄 2차.
- 계획과 달라진 점: 없음(계획 범위 밖의 후속 작업으로 했다)
- AI가 틀렸다가 고친 것:
  - 1차 프롬프트에 "다른 개의 일은 기록하지 않는다"만 넣었다 → LLM이 "시발 옆집 강아지가 우리 개를 물었어."(우리 개가 물린 일)를 3번 중 2번 기록하지 않았다(수정 전 3/3) → 1차 결과에서 비속어 분류 점수가 내려간 것을 보고 찾았다. "다른 개 때문에 이 강아지에게 생긴 일은 기록한다"를 더해 2차에서 3/3으로 돌아왔다.
