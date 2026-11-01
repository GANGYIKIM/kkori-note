# 저장 구조: 종류 정의와 기록·채팅 메시지 저장 모양 (R1, R11)

- R 문서: [R1](README.md)
- 근거: R1-11, R11
- 결정: [ADR-0012](../../adr/0012-kind-definitions-and-entry-shape.md) 종류 정의와 기록 모양, [ADR-0013](../../adr/0013-chat-message-block-storage.md) 채팅 메시지 블록 저장

## 계획

### 만들 것

**종류 정의** — 새 파일 `src/lib/domain/kinds.ts`

- 타입 `KindDef { id, label, episode: boolean, system: boolean, fields: FieldDef[] }`
- 타입 `FieldDef`는 셋 중 하나. 모두 `id`, `label`, `system: boolean`을 가진다.
  - `choice`: `options: { id, label }[]`. 값은 option id(문자열)
  - `number`: `min`, `max`, `integer`, `unit`. 값은 숫자
  - `text`: `maxLength`. 값은 문자열
- 상수 `DEFAULT_KINDS`: 아래 9개. 종류는 모두 `system: true`. 항목 `system`은 표의 ●
- 값 목록과 라벨은 지금 `values.ts`의 것을 그대로 쓴다.

| 종류 id | 라벨 | 에피소드 | 항목 (id · 타입 · 값) |
|---|---|---|---|
| poop | 배변 | 아니오 | stoolState● · choice · hard 딱딱함, normal 정상, soft 무름, diarrhea 설사, blood_mucus 혈변·점액, other 기타 / count● · number · 1~10 정수 / detail · text · 200자 |
| meal | 식사 | 아니오 | detail · text · 200자 |
| snack | 간식 | 아니오 | detail · text · 200자 |
| walk | 산책 | 아니오 | detail · text · 200자 |
| picked_up | 주워 먹음 | 아니오 | riskFood● · choice · chocolate 초콜릿, grape_raisin 포도·건포도, xylitol 자일리톨, macadamia 마카다미아, onion_garlic 양파·마늘 / chocolateType● · choice · white 화이트, milk 밀크, dark 다크, baking 베이킹용, unknown 종류 모름 / amountG● · number · 0~5000 정수 / detail · text · 200자 |
| limp | 절뚝임 | 예 | intensity● · choice · low 약, medium 중, high 강 / detail · text · 200자 |
| seizure | 발작 | 예 | intensity● (위와 같음) / detail · text · 200자 |
| thunder_fear | 천둥 떨림 | 예 | intensity● (위와 같음) / detail · text · 200자 |
| note | 메모 | 아니오 | detail · text · 200자 |

- 함수
  - `findKind(kindId)` → `KindDef | null`
  - `isEpisodeKind(kindId)` → 정의의 `episode`
  - `checkValues(kind, values)` → 통과하면 `values`, 아니면 실패한 항목 id 목록. 정의에 없는 항목 id, 값 목록 밖의 option id, 범위 밖 숫자, 길이 초과 문자열이면 실패. **새로 저장하기 전에만** 쓴다.
  - `fieldLabel(kind, fieldId)`, `optionLabel(kind, fieldId, optionId)` → 정의에 없으면 받은 id를 그대로 돌려준다.

**기록** — `src/lib/domain/types.ts`의 `LogEntrySchema`

- 칸: `id`, `dogId`, `kindId: string`, `occurredAt`, `timePrecision`, `endedAt`, `durationSec`, `values: Record<string, string | number>`, `weather`, `rawText`, `attachmentIds`, `isDemo`, `createdAt`
- `timePrecision: "exact" | "estimated" | "day"`. 기본값 `"exact"`. `"estimated"`는 "어제 저녁쯤"처럼 추정한 시각, `"day"`는 시각 없이 그날 하루 전체의 기록이고 `occurredAt`은 기기 현지 시간대로 그날 0시다(R2 시간대 규칙). 모든 종류에 쓸 수 있다.
- `values`의 빈 칸은 키를 두지 않는다(`null`을 넣지 않음).
- 스키마는 모양만 검사하고 정의와 맞춰 보지 않는다. 그래서 정의에서 빠진 종류·항목·값 id가 든 기록도 읽힌다.

**칩의 `?` 표시** — `UncertainFieldSchema.field`는 `"kindId" | "occurredAt" | "durationSec"` 또는 항목 id(문자열)

**값 목록 파일** — `src/lib/domain/values.ts`에는 종류와 무관한 값만 남는다: `WEATHERS`, `RISK_GRADES`, `MODES`, `DEFAULT_MODE`, `KIND_STYLES`, `LABELS`의 `weather`·`riskGrade`·`mode`

**저장소** — `src/lib/storage/storage.ts`, `indexeddb.ts`

- `saveChatMessage(message: ChatMessage)`, `listChatMessages(dogId)` → `createdAt` 오름차순
- `listEntries`의 거르기 옵션은 `kindIds: string[]`
- Dexie `version(2)`: `entries` 색인은 `id, dogId, kindId, occurredAt, [dogId+occurredAt]`. 버전 1의 기록과 메시지는 옮기지 않고 지운다.

**화면** — 칩, 수정 시트, 기록 목록, 진행 중 에피소드 바, 근거 카드, 미리보기가 정의를 읽어 지금과 같은 라벨과 값으로 보인다.

**없애는 것** — `ConsultMessage`와 `saveConsultMessage`·`listConsultMessages`, `values.ts`의 종류별 값 목록(`ENTRY_KINDS`, `EPISODE_KINDS`, `STOOL_STATES`, `INTENSITIES`, `RISK_FOODS`, `CHOCOLATE_TYPES`)과 그 라벨. 기록의 종류별 고정 칸(`kind`, `stoolState`, `intensity`, `count`, `detail`, `riskFood`, `chocolateType`, `amountG`)은 `kindId`와 `values`로 옮긴다. `timeEstimated`는 `timePrecision`으로 옮긴다.

### 바꾸는 곳

- 새로: `src/lib/domain/kinds.ts`, `kinds.test.ts`
- 모양이 바뀜: `src/lib/domain/types.ts`, `values.ts`, `src/lib/storage/storage.ts`, `indexeddb.ts`

### 완료 기준

- 이 작업으로 체크하는 PRD 수락 기준: 없음. R1-11.1은 화면을 연결하는 하위 작업 5에서 체크한다.

| 기준 | 확인 방법 |
|---|---|
| `DEFAULT_KINDS`가 위 표와 같고, 종류 id와 종류 안의 항목 id가 겹치지 않는다 | `kinds.test.ts` |
| `checkValues`가 네 가지 실패(없는 항목, 목록 밖 값, 범위 밖 숫자, 길이 초과)를 잡는다 | `kinds.test.ts` |
| 정의에 없는 값 id가 든 기록이 읽히고, 라벨 대신 id가 보인다 | `types.test.ts`, `kinds.test.ts` |
| 요약 함수가 새 모양으로 전과 같은 결과를 낸다 | `entry-summary.test.ts` (기존 테스트를 새 모양으로) |
| 칩·수정 시트·기록 목록이 바꾸기 전과 같아 보인다 | `/preview`를 열어 눈으로 확인하고 결과의 "수동 확인"에 쓴다 |
| 형식·타입·빌드 | `lint`, `typecheck`, `test`, `build`. 커밋할 때 pre-commit이 lint·typecheck·test를 다시 돌린다 |

### 범위 밖

- 종류 편집 화면 (R11 P2)
- 값 목록·항목을 R11 초안 표에 맞추기. R11 계획 때 한다. 초안과 다른 점은 `docs/prd/open-questions.md`의 R11 질문에 있다.
- LLM 출력 스키마를 정의에서 만들기 (하위 작업 4)
- IndexedDB 저장소 테스트. fake-indexeddb(스택 밖)를 넣지 않는다. R1-11.1의 새로고침 확인은 하위 작업 5에서 수동으로 한다.
- 하루 전체 기록의 표시와 집계. `docs/prd/open-questions.md`에 있다.

## 결과

### 2026-11-02 · cc2b025..ee5bd93

- 왜: 처음 구현
- 한 일: `kinds.ts`(정의 9개, `findKind`·`kindLabel`·`isEpisodeKind`·`findField`·`fieldLabel`·`optionLabel`·`checkValues`)와 테스트를 만들었다. 기록을 `kindId + values + timePrecision`으로, 칩의 `?` 칸을 문자열로 바꾸고 `ConsultMessage`를 없앴다. 저장소에 채팅 메시지 저장·조회를 넣고 Dexie를 버전 2로 올렸다. 요약 함수, 가짜 데이터, 칩·수정 시트·목록·에피소드·근거 카드, 미리보기를 정의를 읽도록 고쳤다. `.claude/rules/domain.md`, `frontend.md`의 값 목록·종류 색 규칙을 새 위치로 고쳤다.
- 수동 확인: 이 작업으로 체크하는 PRD 수락 기준은 없다. 개발 기준 "화면이 전과 같아 보인다"를 Chrome에서 `/preview`, `/preview/cases`로 확인했다. 진행 중 띠, 칩 카드(`? 상태`와 후보 칩), 수정 시트(주워 먹음: 초콜릿을 풀면 초콜릿 종류·먹은 양이 숨음, 배변: 상태·횟수·내용)가 정의대로 보이고 콘솔 오류는 없었다. 종류별 값 보관(발작 "중" ↔ 절뚝임 "약")은 사용자가 `/preview`에서 확인했다.
- 결정과 맞바꾼 것:
  - 정의에 없는 종류 id는 메모 색을 쓴다(`kindStyle`). 종류 id가 문자열이 되어 색이 빠질 수 있기 때문이다. 지금은 9개 고정이라 생기지 않는다.
  - 수정 시트의 선택 칸은 모두 다시 누르면 비워진다. 전에는 위험 음식만 그랬다.
  - 수정 시트는 열려 있는 동안 값을 종류마다 따로 보관한다(사용자 요청). 발작에서 강도 "중", 절뚝임에서 "약"을 고르면 종류를 오갈 때 각자 값이 보이고, "완료"를 누르면 최종 종류에서 보이는 칸의 값만 저장한다. 전에는 같은 항목 id(강도 등)의 값이 종류를 바꿔도 따라갔고, 새 종류에 없는 값은 버렸다.
  - 저장소 테스트를 하지 않아 저장소 코드의 버그는 하위 작업 5에서야 드러난다.
- 계획과 달라진 점:
  - `kindLabel(kindId)`, `findField(kind, fieldId)`, `kindStyle(kindId)`를 더했다. 라벨·색을 찾는 곳이 여러 컴포넌트라서다.
  - 숫자 항목에 `integer`와 `unit`을 더했다. 입력 칸 라벨에 단위(회, g)를 붙이고 정수만 받기 위해서다. 횟수와 먹은 양 모두 정수다(먹은 양은 사용자 요청).
  - `TIME_PRECISIONS`를 `values.ts`에 두었다. 종류와 무관한 값 목록이라서다.
  - 칩의 `?` 라벨이 정의의 항목 라벨을 쓰면서 "? 양"이 "? 먹은 양"으로 바뀌었다.
  - 수정 시트가 정의를 읽으면서 배변에 횟수 입력이, 배변·발작·천둥 떨림에 내용 입력이 새로 보인다. 정의에 그 항목이 있기 때문이다.
- AI가 틀렸다가 고친 것: 하루 전체 기록의 `occurredAt`을 "그날 0시(KST)"로 적었다 → R2는 기기 현지 시간대 기준이다 → R2를 읽다가 잡아 "기기 현지 시간대의 그날 0시"로 고쳤다.
