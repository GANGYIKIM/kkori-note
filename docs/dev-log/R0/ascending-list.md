# 목록 오름차순과 맨 아래에서 열기 (R0, R11)

- R 문서: [R0](README.md)
- 근거: R0-2, R11 하루 전체 기록 표시

## 계획

### 만들 것

**날짜** — `src/lib/domain/datetime.ts`

- `groupByLocalDate(items, timeZone)`: 날짜도, 날짜 안의 항목도 오래된 것이 먼저다. 같은 날짜에서 `timePrecision`이 `"day"`인 항목은 시각이 있는 항목 뒤에 온다. 항목 타입은 `{ occurredAt: string; timePrecision?: string }`로 넓힌다.
- `formatEntryTime({ occurredAt, timePrecision }, timeZone)` → `timePrecision`이 `"day"`면 `"종일"`, 아니면 `formatLocalTime`과 같은 `HH:mm`.

**목록** — `src/components/entry/DateGroupedList.tsx`

- 시각 자리에 `formatEntryTime`을 쓴다. 상단 주석의 "최신이 위"를 "오래된 것이 위, 하루 전체 기록은 그날 맨 아래"로 고친다.

**칩 카드·근거 카드** — `src/components/chat/EntryChipCard.tsx`, `EvidenceCard.tsx`

- 시각 자리에 `formatEntryTime`을 쓴다(근거 카드는 `10/28 종일`).

**메인 본문 스크롤** — `src/components/main/Home.tsx`

- 본문 스크롤 영역을 `flex flex-col-reverse`로 두고 그 안에 목록(`main`) 하나만 넣는다. 브라우저가 스크롤 시작점을 맨 아래로 잡아, 처음 열 때 JS 없이 맨 아래가 보이고 맨 아래에 있을 때 새 기록이 붙으면 맨 아래가 그대로 보인다.

**미리보기** — `src/components/entry/DateGroupedList.preview.tsx`

- 하루 전체 기록이 섞인 변형을 하나 더한다.

### 바꾸는 곳

- 모양이 바뀜: `src/lib/domain/datetime.ts`(`groupByLocalDate` 순서와 항목 타입, `formatEntryTime` 추가)
- 고치는 파일: `DateGroupedList.tsx`, `DateGroupedList.preview.tsx`, `EntryChipCard.tsx`, `EvidenceCard.tsx`, `Home.tsx`

### 완료 기준

- 이 작업으로 체크하는 PRD 수락 기준: R0-2.2, R11 "하루 전체 기록은 시각 자리에 '종일'로 보이고 그날 기록 중 맨 아래에 온다"

| 기준 | 확인 방법 |
|---|---|
| 날짜·항목 오름차순, 하루 전체 기록이 그날 맨 아래, UTC와 현지 날짜가 다른 경우 | `datetime.test.ts` (기존 "최신이 먼저" 테스트를 바꾼다) |
| `formatEntryTime`이 하루 전체면 "종일", 아니면 `HH:mm` | `datetime.test.ts` |
| R0-2.2 390px·1280px에서 메인을 열면 처음부터 가장 최근 기록이 입력창 바로 위에 있고(위에서 내려가는 움직임 없음), 위로 휠을 굴리면 이전 날짜가 나온다. 맨 아래에서 기록이 하나 늘면 그 기록이 맨 아래에 보인다 | Chrome에서 열자마자 위치를 재고, 화면 상태로 기록을 하나 더해 확인한다. 결과의 "수동 확인"에 쓴다 |
| R11 "종일": 하루 전체 기록이 목록·칩 카드에 "종일"로, 그날 맨 아래에 보인다 | `/preview`의 새 변형에서 확인한다 |
| 형식·타입·빌드 | `lint`, `typecheck`, `test`, `build` |

### 범위 밖

- 실제 저장소에서 불러온 뒤 맨 아래 유지 (R1 하위 작업 5. 이 방식은 불러온 뒤에도 그대로 동작한다)
- 오버레이 스크롤바 (하위 작업 6. `flex-col-reverse`에서는 `scrollTop`이 0에서 음수로 가므로 막대 계산에 반영한다)
- 가상 스크롤 (R0 "나중에")

## 결과

### 2026-11-02 · df44276..7b4f3b8

- 왜: 처음 구현
- 한 일: `groupByLocalDate`를 오름차순(하루 전체 기록은 그날 맨 뒤)으로 바꾸고, 시각 자리 함수 `formatEntryTime`("종일" 또는 `HH:mm`)을 만들어 목록·칩 카드·근거 카드에 썼다. 메인 본문 스크롤 영역을 `flex-col-reverse`로 두었다. `/preview`에 하루 전체 기록 변형을 더했다.
- 수동 확인: R0-2.2 (아래). Chrome 788px 창과 1280px iframe에서 확인했다.
  - R0-2.2: 788px에서 메인을 열자마자 찍은 화면에 오늘(10월 29일) 마지막 기록 11:58이 입력창 바로 위에 있었다. 휠을 위로 5칸 굴리자 `scrollTop` -500, "어제 · 10월 28일" 묶음이 보였다. 맨 아래에서 마지막 묶음에 줄을 하나 붙이자 `scrollTop`은 0 그대로이고 새 줄 bottom 552 < 본문 bottom 568로 맨 아래에 보였다. 1280px PC 목록 칸도 처음부터 `scrollTop` 0, 마지막 줄이 "오늘" 묶음의 11:58이었다.
  - R11 "종일": `/preview`의 하루 전체 기록 변형이 08:00 식사 → 11:58 배변 → 종일 배변 3회 순서로 보였다. 칩 카드는 같은 `formatEntryTime`을 쓰고 단위 테스트로 확인했다.
- 결정과 맞바꾼 것: 맨 아래에서 열기를 JS가 아니라 `flex-col-reverse`로 했다. 서버에서 그린 화면이 위에서 열렸다가 내려가는 움직임이 없다. 대신 본문 `scrollTop`이 0(맨 아래)에서 음수로 움직여 오버레이 스크롤바(하위 작업 6)가 이를 반영해야 한다.
- 계획과 달라진 점: 없음
- AI가 틀렸다가 고친 것: 미리보기의 하루 전체 기록을 기존 기록에서 `timePrecision`만 바꿔 만들었다 → `occurredAt`이 11:58로 남아 하루 전체 기록 모양(그날 0시)과 달랐다 → 그날 0시 KST로 고쳤다.
