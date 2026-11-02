# 헤더 고정과 본문 스크롤 (R0)

- R 문서: [R0](README.md)
- 근거: R0-1

## 계획

### 만들 것

**메인** — `src/components/main/Home.tsx`

| 요소 | 클래스 (바뀐 뒤) |
|---|---|
| 바깥 틀 | `h-dvh lg:mx-auto lg:grid lg:w-[92%] lg:max-w-[1200px] lg:grid-cols-[minmax(0,1fr)_min(40%,420px)]` |
| 왼쪽 칸 | `flex h-full min-h-0 flex-col lg:pr-6` |
| 헤더 | `shrink-0 bg-background`, 안쪽 `mx-auto w-[92%] lg:w-full` |
| 본문(스크롤) | `min-h-0 flex-1 overflow-y-auto`, 안에 목록(`main`) `mx-auto w-[92%] space-y-4 pt-2 pb-4 lg:w-full lg:pb-8` |
| 하단 입력창 | `shrink-0 bg-background pt-2 pb-4 lg:hidden`, 안쪽 `mx-auto w-[92%] space-y-2`(진행 중 띠 + 입력창) |
| 오른쪽 칸(PC 채팅) | 지금 그대로 (`SidePanel`이 이미 제목 고정 + 본문 스크롤) |

- 헤더의 반투명 배경·흐림(`bg-background/95 backdrop-blur-sm`)과 하단 입력창의 그라데이션은 없앤다. 본문이 헤더·입력창 밑으로 지나가지 않기 때문이다.

**설정** — `src/app/settings/page.tsx`

| 요소 | 클래스 (바뀐 뒤) |
|---|---|
| 바깥 틀 | `flex h-dvh flex-col` |
| 헤더 | `shrink-0`, 안쪽 `mx-auto flex h-14 w-[92%] max-w-[672px] items-center gap-1` (뒤로 버튼, 제목) |
| 본문(스크롤) | `min-h-0 flex-1 overflow-y-auto`, 안쪽 `mx-auto w-[92%] max-w-[672px] space-y-8 pt-2 pb-10` |

**시트** — `src/components/layout/BottomSheet.tsx`

- 그대로다. 이미 제목 고정 + 본문 스크롤이다. 열려 있는 동안 문서 스크롤 잠금도 그대로 둔다(320px 미만 가로 스크롤 등 문서가 움직일 수 있는 경우를 위해).

### 바꾸는 곳

- 모양이 바뀜: 없음 (클래스만 바뀐다). 고치는 파일: `src/components/main/Home.tsx`, `src/app/settings/page.tsx`

### 완료 기준

- 이 작업으로 체크하는 PRD 수락 기준: R0-1.1

| 기준 | 확인 방법 |
|---|---|
| R0-1.1 390px 메인·1280px PC 목록 칸·390px 설정에서 본문을 끝까지 스크롤해도 헤더 위치가 그대로이고, 문서(`window.scrollY`)는 0이며 본문 영역의 `scrollTop`만 바뀐다. 모바일 하단 입력창도 제자리 | Chrome에서 마우스 휠로 스크롤하고 위치를 재서 결과의 "수동 확인"에 쓴다 |
| 하위 작업 1·2의 확인 값(폭 92%, 띠 위치, 마지막 기록이 가려지지 않음)이 그대로다 | Chrome에서 다시 잰다 |
| 형식·타입·빌드 | `lint`, `typecheck`, `test`, `build` |

### 범위 밖

- 목록이 맨 아래에서 열리기 (하위 작업 4. 이 작업으로 생긴 본문 스크롤 영역을 쓴다)
- 오버레이 스크롤바 (하위 작업 6)

## 결과

### 2026-11-02 · 68bc8cd..21c6be3

- 왜: 처음 구현
- 한 일: 메인을 `h-dvh` 안에서 헤더 / 본문(`overflow-y-auto`) / 하단 입력창으로 나눴다(PC 왼쪽 칸도 같다). 설정을 헤더 / 본문으로 나눴다. 헤더의 반투명·흐림 배경과 하단 입력창 그라데이션을 없앴다.
- 수동 확인: R0-1.1 (아래). Chrome 788px 창, 1280px·390px iframe에서 마우스 휠로 스크롤하고 위치를 쟀다.
  - 788px 메인: 휠 10칸 뒤 문서 `scrollY` 0, 문서 높이 = 창 높이(754), 본문 `scrollTop` 790, 헤더 top 0, 하단 입력창 제자리. 스크롤바가 본문 영역에만 보였다.
  - 788px 설정: 문서 `scrollY` 0, 본문 `scrollTop` 199.5, 헤더 top 0, 헤더·본문 폭 672px.
  - 1280px PC 왼쪽 칸: 문서 `scrollY` 0, 본문 `scrollTop` 676, 헤더 top 0. 오른쪽 채팅 칸의 진행 중 띠 bottom 690, 입력창 top 698로 그대로.
  - 390px: 헤더·목록 [16, 359]로 하위 작업 1과 같다. 맨 아래까지 내렸을 때 마지막 기록 bottom 654, 하단 입력창 top 670으로 가리지 않는다.
- 결정과 맞바꾼 것: 본문이 헤더·입력창 밑으로 지나가지 않아 반투명·흐림·그라데이션을 없앴다. 대신 헤더와 본문 경계가 단색으로 끊긴다.
- 계획과 달라진 점: 없음
- AI가 틀렸다가 고친 것: 없음
