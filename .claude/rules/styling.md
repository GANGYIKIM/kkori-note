---
paths:
  - "src/**/*.tsx"
  - "src/app/globals.css"
---
# 화면·스타일 규칙

- 색은 `src/app/globals.css`의 의미 단위 토큰만 쓴다: `background`, `foreground`, `surface`, `muted`, `border`, `accent`, `accent-foreground` (예: `bg-surface`, `text-muted`, `border-border`, `bg-accent`).
- 임의의 색상값(`#e0803a`, `bg-[#...]`, `orange-500` 같은 기본 팔레트)을 새로 쓰지 않는다. 다크 모드는 토큰이 처리한다.
- 새 토큰이 필요하면 먼저 제안하고, 추가할 때는 `:root`, 다크 모드, `@theme inline` 세 곳을 함께 고친다.
- 모바일 우선. 좁은 화면(360px)에서 먼저 확인한다.
- 화면 문구는 한국어 존댓말("~해요")로 쓴다.
- 저장소(Dexie)를 쓰는 컴포넌트는 `"use client"`다. 저장소는 `src/lib/client/`의 인스턴스를 통해서만 쓴다.
- 페이지 파일(`src/app/**/page.tsx`)은 얇게 두고 화면 조각은 `src/components/`에 둔다.
