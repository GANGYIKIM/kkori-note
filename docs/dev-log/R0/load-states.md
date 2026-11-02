# 데이터 상태 화면: 로딩 / 데이터 없음 / 오류 / 데이터 (R0)

- R 문서: [R0](README.md)
- 근거: R0-6

## 계획

### 만들 것

**상태 타입** — 새 파일 `src/lib/domain/load-state.ts`

- `LoadState<T> = { status: "loading" } | { status: "empty" } | { status: "error" } | { status: "data"; data: T }`
- `fromList(items)` → 빈 배열이면 `{ status: "empty" }`, 아니면 `{ status: "data", data: items }`

**인사 고정 문장** — 새 파일 `src/lib/domain/greeting.ts`

- `GREETING_LINES`: R1-3의 두 채팅 문장 그대로. 채팅이 비었을 때 화면에만 보이고, R1 하위 작업 3(인사 처리)도 이 상수를 쓴다.

**공용 컴포넌트** — `src/components/common/`

| 컴포넌트 | 하는 일 |
|---|---|
| `Skeleton` | 회색 자리 하나(`bg-surface`, 천천히 깜빡임). 크기는 `className`으로 |
| `ErrorState` | 오류 문장(`message`)과 "다시 시도" 버튼(`onRetry`). 가운데 정렬 |
| `LoadStateView` | `state`에 따라 `loading`·`empty`·`error` 슬롯이나 `children(data)`를 그린다 |

- `EmptyState` 상단 주석의 "쓰지 않을 때"에 "불러오기 실패 → `ErrorState`"를 더한다.

**화면 조각**

| 컴포넌트 | 하는 일 |
|---|---|
| `entry/ListSkeleton` | 기록 줄 모양(시각·태그·내용 자리) 회색 자리 3줄 |
| `entry/FirstRecordGuide` | 지금 `Home`에 있는 빈 화면("아직 기록이 없어요", 예시 문장, "샘플 기록 불러오기")을 옮긴 것. `onLoadSample`을 받는다 |
| `chat/ConversationSkeleton` | 말풍선 모양 회색 자리 2개(받는 쪽 하나, 보내는 쪽 하나) |
| `chat/Greeting` | `GREETING_LINES`를 받는 쪽 말풍선 두 개로 보여준다 |

- 오류 문장: 목록 "기록을 불러오지 못했어요", 채팅 "대화를 불러오지 못했어요".
- `Home`은 빈 화면 자리에 `FirstRecordGuide`를 쓴다. 불러오기 연결(`LoadStateView`로 감싸기)은 R1 하위 작업 5에서 한다.

**미리보기** — 위 7개 컴포넌트마다 `X.preview.tsx`, `catalog.ts`에 등록. `LoadStateView` 미리보기는 목록과 채팅 각각 네 상태를 보여준다.

### 바꾸는 곳

- 새로: `src/lib/domain/load-state.ts`, `greeting.ts`와 테스트, `common/Skeleton`, `common/ErrorState`, `common/LoadStateView`, `entry/ListSkeleton`, `entry/FirstRecordGuide`, `chat/ConversationSkeleton`, `chat/Greeting`과 각 미리보기
- 고치는 파일: `src/components/main/Home.tsx`(빈 화면을 `FirstRecordGuide`로), `common/EmptyState.tsx`(주석), `src/components/preview/catalog.ts`

### 완료 기준

- 이 작업으로 체크하는 PRD 수락 기준: 없음. R0-6.1~6.3은 R1 하위 작업 5에서 실제 불러오기에 연결한 뒤 체크한다.

| 기준 | 확인 방법 |
|---|---|
| `fromList`가 빈 배열이면 empty, 아니면 data | `load-state.test.ts` |
| `GREETING_LINES`가 R1-3 문장과 같다 | `greeting.test.ts` |
| 목록·채팅의 네 상태가 R0-6 문장대로 보이고, "다시 시도"를 누르면 `onRetry`가 불린다 | `/preview`에서 보고 버튼을 눌러 확인한다. 결과의 "수동 확인"에 쓴다 |
| 메인의 빈 화면이 전과 같다 | `/preview`의 `main/Home` 또는 샘플을 비운 상태에서 확인한다 |
| 미리보기 등록 | `tests/preview-catalog.test.ts` |
| 형식·타입·빌드 | `lint`, `typecheck`, `test`, `build` |

### 범위 밖

- 저장소에서 실제로 불러오기, 로딩·오류가 실제로 생기는 연결 (R1 하위 작업 5)
- 로딩을 일정 시간 뒤에 보여주기 (정하지 않음. 바로 보여준다)
- 인사 메시지에 대한 응답 처리 (R1 하위 작업 3)

## 결과

### 2026-11-02 · b4efec4..3c486e6

- 왜: 처음 구현
- 한 일: `LoadState`·`fromList`, `GREETING_LINES`와 테스트를 만들었다. `common/Skeleton`·`ErrorState`·`LoadStateView`, `entry/ListSkeleton`·`FirstRecordGuide`, `chat/ConversationSkeleton`·`Greeting`과 미리보기를 만들고 카탈로그에 등록했다. `Home`의 빈 화면을 `FirstRecordGuide`로 바꿨다. `EmptyState` 주석에 `ErrorState`를 안내했다.
- 수동 확인: 이 작업으로 체크하는 PRD 수락 기준은 없다. Chrome `/preview`의 `common/LoadStateView`에서 기록 목록은 로딩(회색 자리 3줄, 9칸) · 데이터 없음("아직 기록이 없어요", 예시 문장, "샘플 기록 불러오기") · 오류("기록을 불러오지 못했어요" + "다시 시도") · 데이터(오늘 묶음 3줄), 채팅은 로딩(말풍선 회색 자리 2개) · 데이터 없음(인사 두 말풍선) · 오류("대화를 불러오지 못했어요" + "다시 시도") · 데이터로 보였다. "다시 시도"가 `onRetry`를 부르는지는 미리보기에서 빈 함수라 보지 못했고, R1 하위 작업 5에서 연결하며 확인한다.
- 결정과 맞바꾼 것: `common/`은 `src/lib/domain`을 가져오지 않는 규칙이라 `LoadStateView`는 `LoadState`와 같은 모양의 상태 타입을 따로 받는다. 모양이 같아 `LoadState`를 그대로 넘길 수 있다.
- 계획과 달라진 점: 없음
- AI가 틀렸다가 고친 것: 미리보기를 이름 일부로 찾다가 "데이터"가 "데이터 없음"에 걸려 잘못 읽었다 → 같은 내용이 두 번 나와 이상함을 알아챘다 → 제목이 정확히 같은 것으로 다시 찾았다.
