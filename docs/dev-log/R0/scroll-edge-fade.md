# 경계선 대신 스크롤 페이드 (R0)

- R 문서: [R0](README.md)
- 근거: R0-1

## 계획

### 만들 것

**계산** — `src/components/common/scroll-thumb.ts`

- `scrollEdges({ scrollTop, scrollHeight, clientHeight, reversed })` → `{ top: boolean, bottom: boolean }`. 위쪽에 가려진 내용이 1px보다 많으면 `top`, 아래쪽이면 `bottom`. 스크롤할 것이 없으면 둘 다 거짓. `reversed`는 `thumbMetrics`와 같은 규칙(`scrollTop` 0이 맨 아래).

**스크롤 영역** — `src/components/common/ScrollArea.tsx`

- 막대를 갱신할 때 `scrollEdges`도 계산해, 바깥 틀 안의 위·아래 페이드 두 개(`absolute inset-x-0 h-6`, 막대 자리 14px는 빼고 `right-3.5`, `pointer-events-none`)의 투명도를 바꾼다. 위는 `bg-linear-to-b from-background to-background/0`, 아래는 `bg-linear-to-t`. 투명도 전환 200ms.
- 막대는 페이드보다 위에 그린다.

**가로선 없애기**

| 파일 | 없애는 것 |
|---|---|
| `src/components/main/Home.tsx` | PC 왼쪽 헤더의 `lg:border-b lg:border-border` (높이 `lg:h-14`는 채팅 칸 헤더와 맞추려고 둔다) |
| `src/components/layout/SidePanel.tsx` | 제목 줄 `border-b`, 하단 `border-t` |
| `src/components/layout/BottomSheet.tsx` | 제목 줄 `border-b`, 하단 `border-t` |

- PC의 목록·채팅 사이 세로 경계선(`aside`의 `border-l`)은 둔다.

### 바꾸는 곳

- 모양이 바뀜: `scroll-thumb.ts`(`scrollEdges` 추가)
- 고치는 파일: `ScrollArea.tsx`, `scroll-thumb.test.ts`, `Home.tsx`, `SidePanel.tsx`, `BottomSheet.tsx`

### 완료 기준

- 이 작업으로 체크하는 PRD 수락 기준: R0-1.2

| 기준 | 확인 방법 |
|---|---|
| `scrollEdges`: 보통 방향 맨 위·가운데·맨 아래, `reversed` 맨 아래·맨 위, 스크롤 없음 | `scroll-thumb.test.ts` |
| R0-1.2 1440px 메인·채팅 칸, 390px 채팅 시트, 설정에서 헤더·하단 가로선이 없다. 메인은 처음(맨 아래)에 위 페이드만 보이고, 맨 위까지 올리면 위 페이드가 사라지고 아래 페이드가 보인다. 설정은 처음에 아래 페이드만 보인다 | Chrome에서 페이드 투명도를 재고 화면을 찍어 결과의 "수동 확인"에 쓴다 |
| 형식·타입·빌드 | `lint`, `typecheck`, `test`, `build` |

### 범위 밖

- 흐림(blur) 효과. 페이드만 쓴다.
- 칩 카드·근거 카드 같은 본문 안의 테두리

## 결과

### 2026-11-02 · 38ae8fc..af38107

- 왜: 처음 구현. PC에서 기록·채팅 헤더 밑줄이 칸마다 끊겨 보였다(사용자 확인). Apple의 스크롤 경계 효과(WWDC25: 막대 밑으로 내용이 지나갈 때만 흐림·페이드)를 참고해 선 대신 페이드를 골랐다.
- 한 일: `scrollEdges`와 테스트를 더하고, `ScrollArea`가 위·아래 페이드(24px, 막대 자리 제외)의 투명도를 막대와 같은 프레임에 바꾼다. PC 기록 헤더 밑줄, 채팅 칸·시트의 제목 밑줄과 하단 윗줄을 없앴다. 세로 경계선은 그대로.
- 수동 확인: R0-1.2 (아래). Chrome 1440px 창과 iframe(설정 885×500, 390×700)에서 확인했다.
  - R0-1.2: 1440px에서 헤더·하단 요소의 위·아래 테두리가 모두 0px. 메인 목록은 처음(맨 아래) 위 페이드 1·아래 0, 맨 위로 올리면 위 0·아래 1, 가운데는 둘 다 1. 위 페이드는 [120, 886]으로 막대 자리 앞에서 끝났다. PC 채팅 칸은 처음 위 1·아래 0. 설정은 처음 위 0·아래 1, 끝까지 내리면 위 1·아래 0. 390px 메인 목록과 채팅 시트는 처음 위 1·아래 0이고 시트 제목·하단 테두리 0px.
- 결정과 맞바꾼 것: 흐림(`backdrop-blur`)은 스크롤 중 비용이 커서 빼고 페이드만 썼다. 질문은 헤더 밑줄이었지만 채팅 입력창 윗줄도 같은 이유(칸 폭에서 끊김)로 함께 없앴다.
- 계획과 달라진 점: 없음
- AI가 틀렸다가 고친 것: 없음
