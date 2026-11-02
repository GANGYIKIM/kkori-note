# 칩 만들기와 기록 응답: 최소 사전·시각 파서, 기록 나누기, 고정 응답 문장 (R1, R11)

- R 문서: [R1](README.md)
- 근거: R1-4, R1-7, R1-8, R1-10, R11 핵심 항목
- 영향받는 지표: M1

## 계획

### 만들 것

**종류 정의** — `src/lib/domain/kinds.ts`

- `FieldBase`에 `core: boolean`(핵심 항목), `askHint?: string`(핵심 항목이 비었을 때 응답에 붙는 말, 조사 없음)을 더한다.
- 숫자 항목에 `defaultValue?: number`를 더한다. 채팅에서 만든 기록에 그 항목이 비어 있으면 이 값을 넣는다.

| 종류 | 항목 | core | askHint | defaultValue |
|---|---|---|---|---|
| poop | stoolState | true | 상태(무른지, 딱딱한지) | |
| poop | count | false | | 1 |
| picked_up | riskFood | true | 무엇을 먹었는지 | |
| 그 밖의 모든 항목 | | false | | |

- `missingCoreFields(kindId, values)` → 값이 없는 핵심 항목의 `FieldDef[]`. 정의에 없는 종류면 `[]`.

**날짜** — `src/lib/domain/datetime.ts`

- `startOfLocalDay(nowIso, timeZone)` → 기기 현지 시간대의 그날 0시를 UTC ISO 문자열로.

**시각 파서(최소)** — 새 파일 `src/lib/domain/time-parse.ts`

- `parseTime(text, nowIso, timeZone)` → 셋 중 하나
  - `{ status: "found", occurredAt, timePrecision, todayOnly }`. `todayOnly`는 시각 없이 "오늘"만 있어 하루 전체로 둔 경우 참
  - `{ status: "none" }`: 시각 표현이 없다
  - `{ status: "unknown" }`: 시각 표현이 있지만 이 파서가 모르거나, 서로 다른 시각이 둘 이상이다

| 표현 | 결과 |
|---|---|
| 방금, 지금 | 지금, `exact` |
| `N분 전`, `N시간 전` (N은 숫자) | 지금 − N분/N시간, `exact` |
| 하루종일, 하루 종일, 종일, 오늘 하루 | `startOfLocalDay`, `day` |
| 다른 시각 표현 없이 "오늘"만 | `startOfLocalDay`, `day`, `todayOnly` |
| 아까, 어제, 그저께, 아침, 점심, 오후, 저녁, 밤, 새벽, 오전, `N시`, 쯤, 숫자 없는 `분 전`·`시간 전` | `unknown` |

**최소 사전** — 새 파일 `src/lib/domain/lexicon.ts`

- `KIND_PATTERNS`: 종류 id → 정규식. 문장에서 처음 나온 위치를 함께 돌려준다.

| 종류 | 표현 |
|---|---|
| poop | 배변, 응가, 응아, 똥, 대변, 혈변, 설사, 앞뒤가 띄어진 "변"(조사 이·을·은·도 허용) |
| meal | 밥, 사료, 식사 |
| snack | 간식, 개껌, 트릿 |
| walk | 산책 |
| picked_up | 주워 먹, 주워먹, 삼켰. 또는 위험 음식 표현과 "먹"이 함께 있을 때 |
| limp | 절뚝, 절룩 |
| seizure | 발작, 경련 |
| thunder_fear | 천둥 |

- `VALUE_PATTERNS`: 정규식 → 항목 id와 값

| 항목 | 값 | 표현 |
|---|---|---|
| stoolState | hard | 딱딱, 단단, 토끼똥, 토끼 똥 |
| stoolState | normal | 정상 |
| stoolState | soft | 무른, 무름, 물렁, 흐물, 묽 |
| stoolState | diarrhea | 설사, 물똥 |
| stoolState | blood_mucus | 혈변, 피똥, 점액 |
| riskFood | chocolate | 초콜릿, 초콜렛, 초코 |
| riskFood | grape_raisin | 포도, 건포도 |
| riskFood | xylitol | 자일리톨 |
| riskFood | macadamia | 마카다미아 |
| riskFood | onion_garlic | 양파, 마늘 |
| chocolateType | dark / milk / white / baking | 다크 / 밀크 / 화이트 / 베이킹 |
| intensity | high | 심하, 심했, 심각 |
| intensity | low | 살짝, 약하게 |
| count | 숫자 | `N회`, `N번` |
| amountG | 숫자 | `Ng`, `N그램` |

- `DOG_PARTICLES`: 이랑, 하고, 가, 이, 는, 은, 도, 랑, 와, 의 (긴 것부터 맞춘다)

**기록 나누기** — 새 파일 `src/lib/domain/extract-entries.ts`

- `extractEntries(text, { nowIso, timeZone, dogName })` → `{ drafts: EntryDraft[], reasons: LlmReason[], needsLlm: boolean }`
  - `EntryDraft = { kindId, values, occurredAt, timePrecision, todayOnly, rawText }`. `rawText`는 받은 문장 그대로다.
  - `LlmReason`은 넷 중 하나: `{ type: "noKind" }`, `{ type: "time" }`, `{ type: "missingCore", kindId, fieldId }`, `{ type: "ambiguousValue", fieldId }`
  - `needsLlm`은 `reasons`가 비어 있지 않으면 참이다.
- 순서
  1. **이름**: `dogName`이 사전 표현과 겹치면, 이름이 나온 곳마다 바로 뒤가 `DOG_PARTICLES`로 시작하면 그 이름을 공백으로 지운다. 를·을이 붙거나 조사가 없으면 남긴다. 겹치지 않으면 이 단계를 건너뛴다.
  2. **종류**: `KIND_PATTERNS`로 찾은 종류마다 초안 하나. 같은 종류는 하나. 문장에 처음 나온 순서대로 둔다. 하나도 없으면 `drafts`는 비고 `noKind`.
  3. **값**: `VALUE_PATTERNS`로 찾은 값을, 그 항목을 가진 초안이 하나면 거기에 넣는다. 둘 이상이면 넣지 않고 `ambiguousValue`. 없으면 버린다. 한 항목에 서로 다른 값이 둘 이상 나오면 넣지 않고 `ambiguousValue`.
  4. **시각**: `parseTime`이 `found`면 모든 초안에 쓰고(`todayOnly` 포함), `none`이면 지금·`exact`. `unknown`이면 지금·`estimated`로 두고 `time`.
  5. **기본값**: 비어 있는 항목에 `defaultValue`를 넣는다.
  6. **핵심 항목**: `missingCoreFields`가 돌려준 항목마다 `missingCore`.

**기록 응답** — 새 파일 `src/lib/domain/record-reply.ts`

- `recordReply(dogName, drafts)` → 고정 문장
  - `{dogName}의 {종류 라벨을 ", "로 이은 것}{을/를} 기록했어요.`
  - 초안들의 비어 있는 핵심 항목이 있으면 한 칸 띄우고 `{askHint를 ", "로 이은 것}{을/를} 알려주시면 더 정확해요.`
  - 비어 있는 핵심 항목이 없고 `todayOnly`인 초안이 있으면 한 칸 띄우고, 그 초안 중 횟수 항목이 있는 종류가 있으면 `오늘 하루 몇 번인지 남기시려면 칩에서 횟수를, 대략적인 시각이 기억나시면 칩에서 시각을 고쳐 주세요.`, 없으면 `대략적인 시각이 기억나시면 칩에서 시각을 고쳐 주세요.`
  - 을/를은 마지막 한글 글자의 받침으로 고른다.

### 바꾸는 곳

- 새로: `src/lib/domain/time-parse.ts`, `lexicon.ts`, `extract-entries.ts`, `record-reply.ts`와 각 `*.test.ts`
- 모양이 바뀜: `src/lib/domain/kinds.ts`(`FieldDef`, `missingCoreFields`), `datetime.ts`(`startOfLocalDay`)

### 완료 기준

- 이 작업으로 체크하는 PRD 수락 기준: R1-7.1, R1-7.2. 나머지(R1-4.1, R1-4.2, R1-7.3, R1-8.1, R1-8.2, R1-10.1, R1-10.2, R11 횟수 1회)는 "저장된다"까지라서 초안 테스트만 이 작업에서 통과시키고, 체크는 저장을 연결하는 하위 작업 5에서 한다.

| 기준 | 확인 방법 |
|---|---|
| R1-4.1, R1-4.2, R1-8.1, R1-8.2, R1-10.1, R1-10.2, R11 횟수 1회 | `extract-entries.test.ts` (초안까지. 저장은 하위 작업 5) |
| R1-7.1, R1-7.2 | `record-reply.test.ts` |
| R1-7.3 | `extract-entries.test.ts`(하루 전체, 1회, `needsLlm` 거짓)와 `record-reply.test.ts`(안내 문장) |
| "배변했어"는 `missingCore`, "안녕"은 `noKind`, "절뚝이고 발작했는데 심했어"는 `ambiguousValue`, "아까 배변했어"는 `time` | `extract-entries.test.ts` |
| 시각 표에 있는 표현마다 결과가 맞다. KST 00:30의 "하루종일"은 KST 그날 0시다 | `time-parse.test.ts` |
| 사전 표의 표현마다 종류·값이 맞다 | `lexicon.test.ts` |
| 정의의 `core`·`askHint`·`defaultValue`가 위 표와 같다 | `kinds.test.ts` |
| 형식·타입·빌드 | `lint`, `typecheck`, `test` |

### 범위 밖

- LLM 호출과 실패 처리, R1-5.3 (하위 작업 4). 이 작업은 `needsLlm`과 이유만 돌려준다.
- 의도 나누기·인사 (하위 작업 3)
- 저장과 화면, "종일" 표시, 목록 순서 (하위 작업 5)
- 사전을 20~30개 표현으로 넓히기와 후보 칩 (R8), 추정 시각 (R2)
- 부정·반대 표현("설사는 아니고") 처리. 서로 다른 값이 나오면 `ambiguousValue`로 LLM에 넘긴다.

## 결과

### 2026-11-02 · c053391..eb59fa0

- 왜: 처음 구현
- 한 일: 종류 정의에 `core`·`askHint`·`defaultValue`와 `missingCoreFields`를 더했다. `startOfLocalDay`, 최소 시각 파서 `parseTime`, 최소 사전 `findKinds`·`findValues`·`overlapsLexicon`, 기록 나누기 `extractEntries`, 응답 문장 `recordReply`를 만들고 각 테스트를 썼다(도메인 테스트 108개, 전체 220개 통과).
- 수동 확인: 없음. 화면을 바꾸지 않았다.
- 결정과 맞바꾼 것:
  - "쯤"이 있으면 시각을 모름으로 본다. 그래서 "발작 2분쯤"처럼 지속시간에 붙은 "쯤"도 LLM으로 간다. 지속시간은 어차피 사전이 채우지 못한다.
  - "정상", "심하"처럼 넓은 표현은 그 항목을 가진 종류가 문장에 있을 때만 붙는다. 종류가 없으면 버린다.
  - 위험 음식은 "먹"이 함께 있을 때만 주워 먹음이 된다. "초콜릿 냄새 맡았어"는 기록이 아니다.
  - 주워 먹음의 음식이 비면 응답이 "무엇을 먹었는지를 알려주시면 더 정확해요."가 된다. 문장이 조금 딱딱하지만 조사 규칙을 하나로 둔다.
- 계획과 달라진 점:
  - 완료 기준의 PRD 체크를 R1-7.1, R1-7.2로 줄였다. 나머지 수락 기준은 "저장된다"를 포함해서 하위 작업 5에서 체크한다.
- AI가 틀렸다가 고친 것: 없음

### 2026-11-02 · eb59fa0

- 왜: "발작 2분쯤"의 "쯤" 때문에 시각을 모름으로 보고 LLM을 불렀다. LLM이 실패하면 지속시간이 빠지고 시각에 "추정"이 잘못 붙는다(사용자 확인).
- 한 일: `parseDuration(text)` → `{ durationSec, rest }` / `null`을 `time-parse.ts`에 더했다. "전"이 붙지 않은 "N시간·N분·N초"(쯤·정도·동안 허용)를 읽는다. `extractEntries`는 에피소드 종류가 있을 때만 지속시간을 읽고, 읽은 표현을 지운 문장으로 시각을 판단한다. `EntryDraft`에 `durationSec: number | null`을 더했다. 에피소드 종류가 둘 이상이면 붙이지 않고 `{ type: "ambiguousValue", fieldId: "durationSec" }`. PRD에 R1-4.3을 더했다(체크는 저장을 연결하는 하위 작업 5).
- 수동 확인: 없음
- 결정과 맞바꾼 것: 에피소드 종류가 없는 문장("산책 30분")의 시간은 읽지 않는다. 지속시간 항목이 있는 종류가 에피소드뿐이라서다.
- 계획과 달라진 점: 없음 (계획에 없던 기능을 더함)
- AI가 틀렸다가 고친 것: 없음
