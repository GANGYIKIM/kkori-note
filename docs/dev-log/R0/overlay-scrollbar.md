# 오버레이 스크롤바 (R0)

- R 문서: [R0](README.md)
- 근거: R0-7
- 결정: [ADR-0015](../../adr/0015-custom-overlay-scrollbar.md) 기본 스크롤바를 숨기고 직접 만든 막대를 쓴다

## 계획

### 만들 것

**전역 CSS** — `src/app/globals.css`

- 모든 요소의 기본 스크롤바를 숨긴다: `* { scrollbar-width: none; }`, `*::-webkit-scrollbar { display: none; }`. 스크롤 자체는 그대로 된다.

**막대 위치 계산** — 새 파일 `src/components/common/scroll-thumb.ts`

- `thumbMetrics({ scrollTop, scrollHeight, clientHeight, reversed })` → `{ size, offset }` / 스크롤이 없으면 `null`
  - `size = max(24, clientHeight × clientHeight / scrollHeight)`
  - 진행 비율 = 위에서부터 내려온 거리 / (scrollHeight − clientHeight). `reversed`(`flex-col-reverse`)면 위에서부터 내려온 거리 = `scrollTop + (scrollHeight − clientHeight)`(`scrollTop`이 0에서 음수로 가기 때문)
  - `offset = 진행 비율 × (clientHeight − size)`
- `scrollDeltaForDrag(dragPx, { scrollHeight, clientHeight, size })` → 막대를 `dragPx` 끌었을 때 바꿀 `scrollTop` 양 = `dragPx × (scrollHeight − clientHeight) / (clientHeight − size)`

**스크롤 영역** — 새 파일 `src/components/common/ScrollArea.tsx`

- props: `className`(바깥 틀), `viewportClassName`(스크롤되는 안쪽), `viewportRef`(안쪽 요소를 넘겨받을 ref), `children`
- 구조: 바깥 틀 `relative min-h-0` 안에 스크롤되는 안쪽(`h-full overflow-y-auto` + `viewportClassName`)과, 그 옆에 안쪽 밖에 놓인 막대(`absolute right-0.5`, 6px, 둥근 끝, `bg-muted/50`)
- 막대 갱신: 안쪽의 `scroll`, 안쪽과 자식들의 크기 변화(`ResizeObserver`), 자식 추가·삭제(`MutationObserver`).
- `reversed` 구분: 안쪽 요소의 계산된 스타일 `getComputedStyle(안쪽).flexDirection`이 `"column-reverse"`면 참, 그 밖(`column`, `row`, `flex`가 아님 등)이면 거짓이다. props로 따로 받지 않는다. 처음 그릴 때와 `ResizeObserver`·`MutationObserver`가 알릴 때만 읽어 저장하고, 스크롤할 때는 저장한 값을 쓴다.
- 막대 위치 갱신은 `requestAnimationFrame`으로 한 프레임에 한 번만 한다.
  - 쓰는 쪽은 `viewportClassName`에 `flex flex-col-reverse`를 넣기만 하면 된다. 화면 폭마다 방향이 바뀌는 경우(`lg:flex-col`)는 창 크기 변화와 함께 와서 `ResizeObserver`가 잡는다. 크기 변화 없이 클래스만 바뀌면 놓치는데, 지금 그런 곳은 없다.
  - 브라우저(Chrome·Safari·Firefox 최신)는 `column-reverse` 스크롤 영역에서 맨 아래가 `scrollTop` 0이고 위로 갈수록 음수다. 그래서 `reversed`가 참이면 위에서부터 내려온 거리를 `scrollTop + (scrollHeight − clientHeight)`로 바꿔 계산한다.
- 보이기: 스크롤할 때, 바깥 틀에 포인터가 들어왔을 때 보인다. 포인터가 안에 있는 동안은 계속 보인다. 스크롤이 멈추고 포인터가 밖에 있으면 1초 뒤 서서히(투명도 전환) 사라진다.
- 끌기: 막대에서 `pointerdown` → `setPointerCapture`, `pointermove`의 세로 이동만큼 `scrollDeltaForDrag`로 `scrollTop`을 바꾼다. 끄는 동안 막대 폭 10px, 계속 보인다.
- 빈 홈 클릭, 키보드 조작은 없다. 막대는 `aria-hidden`이다.

**적용** — 스크롤 영역마다 `overflow-y-auto` 요소를 `ScrollArea`로 바꾼다

| 파일 | 영역 |
|---|---|
| `src/components/main/Home.tsx` | 메인 본문(`viewportClassName`에 `flex flex-col-reverse`) |
| `src/app/settings/page.tsx` | 설정 본문 |
| `src/components/layout/SidePanel.tsx` | PC 채팅 칸 본문(`viewportRef`로 지금의 `bodyRef`) |
| `src/components/layout/BottomSheet.tsx` | 시트 본문(`viewportRef`로 지금의 `bodyRef`) |

**미리보기** — `common/ScrollArea.preview.tsx`: 긴 내용, 짧은 내용(막대 없음), `flex-col-reverse` 긴 내용. 카탈로그에 등록.

### 바꾸는 곳

- 새로: `src/components/common/ScrollArea.tsx`, `ScrollArea.preview.tsx`, `scroll-thumb.ts`, `scroll-thumb.test.ts`
- 고치는 파일: `src/app/globals.css`, `Home.tsx`, `settings/page.tsx`, `SidePanel.tsx`, `BottomSheet.tsx`, `preview/catalog.ts`

### 완료 기준

- 이 작업으로 체크하는 PRD 수락 기준: R0-7.1, R0-7.2, R0-7.3

| 기준 | 확인 방법 |
|---|---|
| 막대 크기·위치(위 끝, 가운데, 아래 끝, `reversed`, 최소 24px, 스크롤 없음)와 끌기 양. `reversed`에서 `scrollTop` 0은 막대가 아래 끝, 가장 작은 음수는 위 끝 | `scroll-thumb.test.ts` |
| 메인(`flex-col-reverse`)과 설정(보통 방향)에서 막대가 실제 스크롤 위치를 따른다: 메인은 처음에 아래 끝, 설정은 처음에 위 끝 | Chrome에서 막대 위치를 잰다 |
| R0-7.1 스크롤 영역의 `clientWidth`가 영역 폭과 같다(기본 스크롤바가 폭을 차지하지 않음). 메인 목록 폭이 하위 작업 1의 값과 같다 | Chrome에서 재고 결과의 "수동 확인"에 쓴다 |
| R0-7.2 휠로 스크롤하면 막대가 보이고, 멈추고 포인터를 밖으로 빼면 약 1초 뒤 투명해진다. 설정처럼 짧은 화면에서 내용이 짧으면 막대가 없다. 막대 위치가 스크롤 위치를 따른다(메인은 처음에 맨 아래) | Chrome에서 확인한다 |
| R0-7.3 막대를 마우스로 끌면 본문이 스크롤된다 | Chrome에서 끌어 확인한다 |
| 시트·PC 채팅 칸이 전처럼 열 때 맨 아래로 내려간다 | Chrome에서 확인한다 |
| 미리보기 등록 | `tests/preview-catalog.test.ts` |
| 형식·타입·빌드 | `lint`, `typecheck`, `test`, `build` |

### 범위 밖

- 가로 스크롤 막대(320px 미만 문서 가로 스크롤은 기본 스크롤바도 숨겨진 채 스크롤만 된다)
- 빈 홈 클릭, 키보드 조작, 스크린 리더용 표시 (ADR-0015)
- 가상 스크롤 (R0 "나중에")

## 결과

### 2026-11-02 · b4efec4..3c486e6

- 왜: 처음 구현
- 한 일: 전역 CSS로 기본 스크롤바를 숨기고, `common/ScrollArea`(오버레이 막대: 스크롤·마우스 올림에 보이기, 1초 뒤 사라지기, 끌기)와 계산 함수 `thumbMetrics`·`scrollDeltaForDrag`(`scroll-thumb.ts`)를 만들었다. 메인 본문, 설정 본문, PC 채팅 칸, 시트 본문을 `ScrollArea`로 바꿨다. 미리보기 3개를 등록했다.
- 수동 확인: R0-7.1, R0-7.2, R0-7.3 (아래). Chrome 885px 창과 iframe(설정 885×500, PC 1280, 미리보기)에서 확인했다.
  - R0-7.1: 메인·채팅 시트·칩 수정 시트·설정·PC 목록 칸·PC 채팅 칸 모두 스크롤 영역의 `clientWidth`와 `offsetWidth`가 같았다(885, 448, 448, 885, 734, 419). 기본 스크롤바가 보이던 이 Chrome에서 막대가 사라졌고, 885px 메인 목록 폭은 814px(92%)로 하위 작업 1의 규칙과 같다.
  - R0-7.2: 휠로 3칸 올리자 찍힌 화면에 막대가 보였다. 마우스를 본문 위에 두고 2초 뒤에도 투명도 1, 헤더로 옮기고 2초 뒤 0이었다. 내용이 짧은 칩 수정 시트와 미리보기 "짧은 내용"은 막대가 없었다(`display: none`). 메인은 처음에 막대가 아래 끝(높이 237.6 = 568²/1358, 위치 330.4), 설정은 위 끝(0)이었다.
  - R0-7.3: 메인에서 막대를 380 → 140으로 끌자 `scrollTop`이 −790(맨 위)이 되고 막대가 위 끝으로 갔다.
  - 채팅 시트와 PC 채팅 칸은 열자마자 맨 아래(`scrollTop` 0, 막대 아래 끝)였다.
- 결정과 맞바꾼 것:
  - 마우스가 영역 안에 있는 동안은 막대를 계속 보인다(끌려다가 놓치지 않게).
  - 방향(`column-reverse`)은 props 없이 계산된 스타일로 읽되, 처음 그릴 때와 크기·자식 변화 때만 읽어 저장한다. 막대 위치는 `requestAnimationFrame`으로 프레임당 한 번 갱신한다.
- 계획과 달라진 점:
  - `viewportRef` props를 없앴다. 바깥에서 받은 ref에 쓰는 것을 React 린트(`react-hooks/immutability`)가 막았다. 대신 채팅 시트(`stickToBottom`)와 PC 채팅 칸 본문을 `flex-col-reverse`로 바꿔, 열 때 맨 아래가 보이게 하는 코드(`bodyRef` + `scrollTop = scrollHeight`)를 없앴다. 그래서 위로 올려 둔 상태에서 새 메시지가 붙으면 예전처럼 맨 아래로 끌려 내려가지 않고 그 자리를 지킨다. 맨 아래에 있을 때는 따라간다.
  - 구독(`ResizeObserver`·`MutationObserver`)은 `useEffectEvent`로 한 번만 건다. `useCallback`은 React Compiler 린트가 막아 쓰지 않았다.
- AI가 틀렸다가 고친 것: 처음 연 탭이 앞에 있지 않아 `requestAnimationFrame`이 돌지 않아 막대가 안 그려진 것처럼 보였다 → 화면을 찍어 탭을 앞으로 가져오니 그려졌다. 휠 직후 JS로 투명도를 읽어 0이 나왔다 → 도구가 휠만 보내고 포인터 진입은 보내지 않아 1초 뒤 사라진 것이었다 → 마우스를 올린 상태와 뺀 상태를 따로 확인했다.

### 2026-11-02 · b4efec4..3c486e6

- 왜: 사용자 확인. PC에서 목록과 채팅 칸 사이 간격(`lg:pr-6` 24px)이 넓고, 막대 근처에서 휠만 굴려도 스크롤됐다. 막대는 눌러 끌어야 스크롤되길 원했다.
- 한 일: `ScrollArea`의 스크롤되는 안쪽에 `mr-3.5`(14px = 막대 최대 폭 10px + 4px)를 줘, 막대가 스크롤되지 않는 자리에 놓이게 했다. 메인 왼쪽 칸의 `lg:pr-6`을 없앴다. 채팅 칸·시트 본문 여백을 `p-4`에서 `py-4 pl-4 pr-0.5`로 바꿔 막대 자리와 합쳐 좌우 16px로 맞췄다. 막대 자리 때문에 좁아진 목록과 설정 본문은, 폭과 왼쪽 여백을 막대 자리를 더한 폭(`100% + 0.875rem`) 기준으로 계산해 헤더·입력창(화면 폭 92%, 가운데)과 좌우 끝을 맞췄다. 오른쪽 끝은 스크롤 영역을 넘지 않게 `min()`으로 막았다. 헤더·입력창에는 막대 자리를 주지 않는다. PRD R0-4·R0-7 문장을 고치고 R0-7.4를 더했다.
- 수동 확인: R0-7.4 (아래). Chrome 1440px 창과 iframe(320·390·900·1440)에서 확인했다.
  - R0-7.4: 1440px에서 목록 오른쪽 끝 886, 채팅 칸 왼쪽 900으로 간격 14px(전에는 24px + 목록 칸 안쪽 여백). 막대 자리(x 895)에서 휠 3칸을 굴려도 `scrollTop` 0 그대로였고, 목록 위(x 500)에서 휠 2칸에 −200이 됐다. 막대를 455 → 300으로 끌자 −531.5가 됐다. 막대를 한 번 누른 뒤 마우스만 움직였을 때는 스크롤되지 않았다.
  - 줄 맞춤: 헤더·목록·입력창 좌우 끝이 390px [15.6, 374.4], 900px [36, 864]로 같았다. 320px은 헤더·입력창 [12.8, 307.2], 목록 [12.8, 306]으로 목록 오른쪽 끝만 1.2px 짧았다(4% 여백 12.8px가 막대 자리 14px보다 작아서). 설정 헤더·본문은 390px [15.6, 374.4], 1440px [384, 1056], 320px 본문 오른쪽 끝 306. 모든 폭에서 스크롤 영역과 문서에 가로 스크롤이 없었다.
  - R0-4.2 다시 확인: 900px에서 목록 828px = 900 × 92%, 헤더·입력창과 같다.
  - PC 1440px: 헤더는 목록 칸 끝(900)까지, 목록은 막대 자리 앞(886)까지다.
  - 채팅 칸 말풍선의 오른쪽 여백 16px(왼쪽과 같음).
- 결정과 맞바꾼 것: 처음에는 헤더·입력창에도 오른쪽 14px를 줘 끝을 맞췄으나, 스크롤 영역이 아닌 곳에 막대 자리가 생겨 사용자 요청으로 뺐다. 대신 목록·설정 본문의 클래스가 `calc`·`min`·`max`로 길어졌다. 320~349px에서는 목록 오른쪽 끝이 헤더보다 최대 1.2px 짧고, PC에서는 헤더가 목록보다 14px 더 오른쪽까지 간다. 기본 스크롤바와 OverlayScrollbars는 막대 위 휠도 본문을 스크롤하지만, 끌기(`dragScroll`)로만 스크롤하길 원한 사용자 요청을 따랐다.
- 계획과 달라진 점: 막대를 본문 위에 겹치던 계획을 바꿔, 스크롤되지 않는 막대 자리에 둔다.
- AI가 틀렸다가 고친 것: 막대 위 휠과 누른 뒤 움직이기를 재현하려 했지만 6px 막대 바로 위에서는 스크롤되지 않았다 → 실제로 스크롤되던 곳은 막대 옆, 아직 스크롤 영역인 자리였다 → 막대 자리를 스크롤 영역 밖으로 빼서 함께 해결했다.
