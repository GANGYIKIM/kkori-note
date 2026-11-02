# 폭 규칙 적용: 1단 92%, PC 2단 최대 1200px, 설정 최대 672px, 최소 320px (R0)

- R 문서: [R0](README.md)
- 근거: R0-4, R0-5
- 결정: [ADR-0014](../../adr/0014-responsive-width-breakpoints.md) 화면 폭 구간과 폭 규칙

## 계획

### 만들 것

**루트 레이아웃** — `src/app/layout.tsx`

- `body`: `min-h-dvh min-w-80`

**메인** — `src/components/main/Home.tsx`

| 요소 | 클래스 (바뀐 뒤) |
|---|---|
| 바깥 틀 | `lg:mx-auto lg:grid lg:h-dvh lg:w-[92%] lg:max-w-[1200px] lg:grid-cols-[minmax(0,1fr)_min(40%,420px)]` |
| 왼쪽 칸(목록) | `flex min-h-dvh w-full flex-col lg:min-h-0 lg:overflow-y-auto lg:pr-6` |
| 헤더 바깥(배경) | `sticky top-0 z-10 bg-background/95 backdrop-blur-sm` |
| 헤더 안쪽 | `mx-auto w-[92%] lg:w-full` |
| 목록(`main`) | `mx-auto w-[92%] flex-1 space-y-4 pt-2 pb-20 lg:w-full lg:pb-8` |
| 하단 입력창 바깥(배경) | `fixed inset-x-0 bottom-0 z-20 bg-linear-to-t from-background via-background to-background/0 pt-6 pb-4 lg:hidden` |
| 하단 입력창 안쪽 | `mx-auto w-[92%]` |
| 오른쪽 칸(채팅, PC) | 지금 그대로 (`hidden min-h-0 border-l border-border lg:block`) |

- PC에서 목록과 채팅 칸 사이 여백은 왼쪽 칸의 `lg:pr-6`(24px)이다.
- 채팅 시트(`BottomSheet`) 폭과 진행 중 띠 위치는 하위 작업 2다.

**설정** — `src/app/settings/page.tsx`

- 바깥 틀: `mx-auto w-[92%] max-w-[672px] pb-10`

### 바꾸는 곳

- 모양이 바뀜: 없음 (클래스만 바뀐다). 고치는 파일: `src/app/layout.tsx`, `src/components/main/Home.tsx`, `src/app/settings/page.tsx`

### 완료 기준

- 이 작업으로 체크하는 PRD 수락 기준: R0-4.1, R0-4.2, R0-4.3, R0-5.1

| 기준 | 확인 방법 |
|---|---|
| R0-4.1 1024px 이상에서 목록과 채팅이 나란히 보이고, 채팅에서 되돌린 기록이 목록에서 사라진다 | Chrome에서 메인을 1280px로 열어 확인하고 결과의 "수동 확인"에 쓴다 |
| R0-4.2 900px에서 목록 폭이 창의 92%(828px) | Chrome에서 요소 폭을 재서 쓴다 |
| R0-4.3 1920px에서 2단 전체 1200px·가운데, 채팅 칸 420px. 1024px에서 2단 942px, 채팅 칸 약 377px | Chrome에서 요소 폭과 위치를 재서 쓴다 |
| R0-5.1 320px에서 문서 폭 = 창 폭, 300px에서 기록 목록이 320px로 가로 스크롤 | Chrome에서 `scrollWidth`와 목록 폭을 재서 쓴다 |
| 390px에서 목록 좌우 여백이 약 16px로 지금과 같다 | Chrome에서 잰다 |
| 설정 화면: 390px에서 92%, 1440px에서 672px·가운데 | Chrome에서 잰다 |
| 형식·타입·빌드 | `lint`, `typecheck`, `test`, `build` |

### 범위 밖

- 채팅 시트 폭·스크롤 잠금·진행 중 띠 위치 (하위 작업 2)
- 목록 순서 (하위 작업 3), 데이터 상태 화면 (하위 작업 4)
- 미리보기 화면(`/preview`)의 폭 (ADR-0014)
- 320px 미만에서 고정 요소(하단 입력창, 채팅 시트)의 폭 (R0-5.1에서 범위 밖으로 둠)

## 결과

### 2026-11-02 · 68bc8cd..21c6be3

- 왜: 처음 구현
- 한 일: 메인의 448px(`max-w-md`)·`px-4`·`lg:max-w-2xl`을 없애고 헤더 안쪽·목록·하단 입력창 안쪽을 92%로, PC 2단 틀을 92%·최대 1200px, 칸을 `minmax(0,1fr)`·`min(40%,420px)`로 바꿨다. 설정을 92%·최대 672px로, `body`에 최소 폭 320px를 걸었다.
- 수동 확인: R0-4.1, R0-4.2, R0-4.3, R0-5.1 (아래). Chrome에서 창 크기를 바꿀 수 없어 페이지 안에 폭을 정한 iframe을 띄워 쟀다(왼쪽 위치, 폭 px).
  - R0-4.1: 1280px 메인에서 채팅 칸의 칩 카드 "되돌리기"를 누르면 카드가 "기록을 되돌렸어요"로 바뀌고 목록에서 그 기록이 사라졌다.
  - R0-4.2: 900px에서 목록 [36, 828] (92%).
  - R0-4.3: 1920px에서 2단 [360, 1200], 채팅 칸 420px. 1024px에서 2단 942px, 채팅 칸 377px, 목록 541px.
  - R0-5.1: 320px에서 문서 폭 320 = 창 폭. 300px에서 문서 폭 320, 목록 [13, 294]로 320px 배치를 유지했다. 하단 입력창 안쪽은 276px로 창 폭을 따랐다(범위 밖).
  - 390px에서 목록·헤더·입력창 [16, 359]로 지금과 같다. 설정은 390px에서 [16, 359], 1440px에서 [384, 672].
- 결정과 맞바꾼 것: PC 목록과 채팅 칸 사이 여백은 폭이 아니라 간격이라 px(`lg:pr-6`, 24px)로 뒀다.
- 계획과 달라진 점: 없음
- AI가 틀렸다가 고친 것: 없음
