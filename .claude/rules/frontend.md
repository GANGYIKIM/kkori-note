---
paths:
  - "src/**/*.tsx"
  - "src/app/globals.css"
---
# 프론트엔드 규칙

## 색

- 색은 `src/app/globals.css`의 의미 단위 토큰만 쓴다: `background`, `foreground`, `surface`, `muted`, `border`, `accent`, `accent-foreground` (예: `bg-surface`, `text-muted`, `border-border`, `bg-accent`).
- 기록 종류별 색은 `src/lib/domain/values.ts`의 `kindStyle()`에서 가져온다. 컴포넌트에 `bg-kind-*`를 직접 적지 않는다.
- 임의의 색상값(`#e0803a`, `bg-[#...]`, `orange-500` 같은 기본 팔레트)을 새로 쓰지 않는다. 다크 모드는 토큰이 처리한다.
- 새 토큰이 필요하면 먼저 제안하고, 추가할 때는 `:root`, 다크 모드, `@theme inline` 세 곳을 함께 고친다.

## 화면

- 모바일 우선. 가장 좁은 화면(320px)에서 먼저 확인한다. 320px보다 좁으면 `body`의 최소 폭으로 가로 스크롤이 생긴다(R0).
- 레이아웃 폭은 %로, 최대 폭은 px로 정한다. 구간(모바일 ~767px, 태블릿 `md`, PC `lg`)과 값은 ADR-0014를 따른다.
- 화면 문구는 한국어 존댓말("~해요")로 쓴다.
- 페이지 파일(`src/app/**/page.tsx`)은 `src/components`의 컴포넌트를 불러와 그리기만 한다. 화면 조각과 상태는 컴포넌트에 둔다.
- 저장소(Dexie)를 쓰는 컴포넌트는 `"use client"`다. 저장소는 `src/lib/client/`의 인스턴스를 통해서만 쓴다.

## 새 컴포넌트를 만들 때

- [ ] 1. `common/`과 `layout/`에 비슷한 것이 있는지 찾는다. 있으면 그것을 쓰거나 넓힌다.
- [ ] 2. 아래 "컴포넌트 폴더" 기준으로 폴더를 고른다.
- [ ] 3. 아래 "이름" 기준으로 이름을 짓는다.
- [ ] 4. `common/`이면 아래 "`common/` 컴포넌트"의 형식으로 상단 주석을 단다. `layout/`이면 어떤 상황에 쓰는지 한 줄 주석을 단다.
- [ ] 5. 옆에 `X.preview.tsx`를 만들어 상태(빈 상태, 에러, 모호한 칩 등)마다 변형을 하나씩 적고, `src/components/preview/catalog.ts`에 등록한다. 상태를 더하거나 props를 바꿨을 때도 같이 고친다. 빠지면 `tests/preview-catalog.test.ts`가 실패한다. PRD 예시 대화는 컴포넌트가 아니라 `src/lib/mock/data.ts`의 `CHAT_CASES`에 더한다 (ADR-0010).
- [ ] 6. 새 폴더를 만들었으면 `tests/component-folders.test.ts`의 `FOLDERS`와 아래 표를 함께 고친다.
- [ ] 7. `common/` 컴포넌트의 props나 쓰임새를 바꿨으면 상단 주석도 고친다.

## 컴포넌트 폴더

> 이렇게 정한 이유와 검토한 대안은 `docs/adr/0009-component-folders.md`에 있다. 규칙을 바꾸거나 예외를 둘 때만 읽는다.

`src/components` 맨 위에는 파일을 두지 않고, 아래 폴더만 쓴다.

| 폴더 | 넣는 것 | 예 |
|---|---|---|
| `layout/` | 화면 뼈대를 이루는 큰 요소 | `AppHeader`, `BottomSheet`, `SidePanel` |
| `common/` | 작은 단위 요소, 두 곳 이상에서 쓰는 요소 | `Tag`, `ListRow`, `Banner`, `Icons` |
| `entry/`, `chat/`, `main/`, `settings/`, `preview/` | 그 화면에서만 쓰는 큰 단위 요소 | `entry/EditSheet`, `chat/Conversation` |

- 작은 요소는 지금 한 곳에서만 써도 `common/`에 둔다.
- 도메인 폴더의 요소를 다른 곳에서도 쓰게 되면 `common/`으로 옮기고 로직을 뺀다. `/preview` 카탈로그는 쓰는 곳으로 세지 않는다.
- 예외: 도메인 값을 받아 `common/` 요소로 바꿔 주기만 하는 얇은 래퍼는 그 도메인 폴더에 둔다 (예: 위험 등급을 `Banner`로 바꾸는 `chat/RiskBanner`).

`tests/component-folders.test.ts`가 맨 위의 파일과 표에 없는 폴더를 막는다. 이 테스트가 실패하면 파일을 표의 폴더로 옮긴다. 정말 새 도메인 폴더가 필요하면 `FOLDERS`와 이 표에 함께 추가한다.

## `common/` 컴포넌트

- 로직을 모른다. `children`, `className`, 슬롯(`ReactNode` prop)만 받는다.
- 도메인 타입(`LogEntry`, `KindDef` 등)과 `src/lib/domain`을 import하지 않는다. 도메인 값을 모양으로 바꾸는 일은 쓰는 쪽이 한다.
  - ✗ `<KindTag kindId={entry.kindId} />`
  - ✓ `<Tag className={kindStyle(entry.kindId).tag}>{kindLabel(entry.kindId)}</Tag>`
- 상단에 의도를 아래 형식으로 적는다. "쓰지 않을 때"에는 대신 쓸 것을 함께 적는다. `@example`은 props만 봐서는 쓰는 법이 분명하지 않을 때만 붙인다.
  ```tsx
  /**
   * <무엇인지 한 줄>
   * 쓸 때: <상황>
   * 쓰지 않을 때: <상황> → <대신 쓸 것>
   * @example <쓰는 예>
   */
  ```
- `common/` 컴포넌트를 쓰거나 고치기 전에 상단 주석을 읽는다. 쓰려는 방식이 "쓰지 않을 때"에 해당하거나 주석과 맞지 않으면, 코드를 쓰기 전에 그 내용과 대안을 알린다.

## 아이콘

- 아이콘이 필요하면 `src/components/common/Icons.tsx`에 추가해서 쓴다. 추가하는 방법은 그 파일 상단 주석에 있다.
- 컴포넌트에 `<svg>`를 직접 쓰거나 아이콘 라이브러리를 설치하지 않는다. `Icons.tsx` 밖의 `<svg>`는 린트가 막는다.

## 이름

- 도메인 폴더 안의 이름에 도메인 이름을 다시 넣지 않는다.
  - ✗ `entry/EntryList`, `chat/ChatView`
- 빼고 남는 이름이 `List`, `View`, `Screen`처럼 역할만 나타내는 한 단어면, 무엇을 담는지 드러나게 짓는다.
  - ✗ `entry/List`, `chat/View`
  - ✓ `entry/DateGroupedList`, `chat/Conversation`
