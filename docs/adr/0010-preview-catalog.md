# ADR-0010: 미리보기는 Storybook 없이 직접 만들고, 변형은 컴포넌트 옆 `X.preview.tsx`에 둔다

- **Status:** Accepted
- **Date:** 2026-10-31
- **Confidence:** Medium (사용자는 컴포넌트 옆에 `.preview.tsx`가 붙으면 폴더를 읽기가 조금 어려워진다고 봤다. 그래도 비용을 늘릴 수 없어 이 방식을 골랐다)

## Decision

**`/preview`를 직접 만든 카탈로그로 두고, 두 탭으로 나눈다.**

| 탭 | 경로 | 보여주는 것 | 데이터 |
|---|---|---|---|
| 컴포넌트 | `/preview` | 폴더(`common` → `layout` → 도메인)별로 컴포넌트마다 경로(`common/Icons`), 상단 주석, 이름 붙인 변형 | 컴포넌트 옆의 `X.preview.tsx` |
| PRD 장면 | `/preview/cases` | PRD 예시 대화와 위험 등급 × 모드 문장. 장면마다 쓰인 컴포넌트로 가는 링크 | `src/lib/mock/data.ts`의 `CHAT_CASES`, `RISK_COPY_EXAMPLES` |

변형(이름 + 그 상태로 그리는 코드)은 `src/components/<폴더>/X.tsx` 옆의 `X.preview.tsx`에 두고, VS Code 파일 중첩으로 `X.tsx` 아래에 묶어 보이게 한다. 컴포넌트를 고칠 때 변형이 바로 옆에 보여야 같이 고치기 때문이다.

## Context

- 바꾸기 전 카탈로그(`src/components/preview/ComponentCatalog.tsx`)는 PRD 장면 단위로 나뉘어 있어서, 화면 조각이 어느 컴포넌트인지 알 수 없었다. `common/Icons`, `common/ListRow`, `layout/*`, `main/Home`, `settings/ProfileForm`은 아예 없었다 (2026-10-31 확인).
- `src/components`의 컴포넌트 파일은 `preview/`를 빼고 19개다 (2026-10-31 `find`).
- Storybook의 Next.js용 프레임워크는 `@storybook/nextjs-vite`이다 ([공식 문서](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite.md), 2026-10-31 확인). 2차 출처에 따르면 Storybook 10.3이 지원하는 Next.js는 16.2까지인데, 이 프로젝트는 16.4.3이다 (`package.json`).
- Tailwind를 `@tailwindcss/turbopack`으로 붙이고 있어(`package.json`), Storybook(Vite)에서는 Tailwind 설정을 따로 해야 한다.
- 한 사용 후기에 따르면 Ladle은 React 19를 지원하지 않았다 ([zenn.dev](https://zenn.dev/chot/articles/0ddde94eb589c6)). 그 뒤 버전에서 지원하는지는 확인하지 못했다.
- VS Code는 `explorer.fileNesting.patterns`로 `${capture}`가 같은 파일을 한 파일 아래에 묶어 보여준다 ([VS Code 문서](https://code.visualstudio.com/docs/getstarted/userinterface), 2026-10-31 확인).
- 배럴 파일을 두지 않으므로(ADR-0007) 컴포넌트마다 폴더를 만들면 경로가 `@/components/chat/EntryChipCard/EntryChipCard`가 된다.

## Candidates

### 도구
- **A. 직접 만든 카탈로그 (채택)**: 설치할 것이 없다. 폴더 구분, 상단 주석 표시, 빠뜨림 검사는 직접 만들어야 한다.
- **B. Storybook 10**: 폴더별 사이드바, Autodocs, 애드온이 있다. 대신 Next 16.4 지원이 확인되지 않았고, Tailwind·린트·CI 설정과 이후 의존성 관리에 비용이 든다. 지금 기간에 비해 비용이 크다고 사용자가 판단해 탈락시켰다.
- **C. Ladle**: Storybook보다 가볍지만 React 19 지원이 확인되지 않았다(A2).

### 변형을 둘 곳
- **A-1. 컴포넌트 옆 `X.preview.tsx` + VS Code 파일 중첩 (채택)**: 컴포넌트를 고칠 때 변형이 옆에 보이고, import 경로와 기존 규칙은 그대로다. 대신 폴더의 파일 수가 두 배가 되고, 파일 중첩을 쓰지 않는 에디터에서는 그대로 나열된다.
- **A-2. 컴포넌트마다 폴더 (`chat/EntryChipCard/EntryChipCard.tsx`)**: 사용자가 처음 제안했다. 에디터 설정 없이도 묶이지만, 배럴이 없어 import 경로에 이름이 두 번 들어가고 19개를 옮겨야 한다. 비용 때문에 탈락했다.
- **B. `preview/` 안에 폴더별 파일로 모음**: 컴포넌트 폴더는 깔끔하지만, 컴포넌트를 고칠 때 변형 파일을 찾아가야 해서 놓치기 쉽다. 사용자가 연관 있는 파일끼리 모으는 쪽을 원해 탈락했다.

### PRD 예시와 같이 관리하는 법
- **A. 탭을 나누고 데이터는 한 곳 (채택)**: 컴포넌트 변형은 컴포넌트를 고칠 때, PRD 장면은 PRD가 바뀔 때 고친다. 장면은 `chat/Conversation`이 데이터를 그리기만 하므로 컴포넌트를 고쳐도 손댈 곳이 없다.
- **B. 한 페이지에 섞음 (바꾸기 전 방식)**: 무엇이 컴포넌트이고 무엇이 PRD 예시인지 구분되지 않았다.

## Evaluation

측정하지 않음.

## 확인하지 않은 가정

| ID | 가정 | 확인 방법 |
|---|---|---|
| A1 | Storybook 10.3은 Next.js 16.4를 공식 지원하지 않는다 (2차 출처 기준) | Storybook 릴리스 노트에서 지원하는 Next 버전 범위 확인 |
| A2 | Ladle은 아직 React 19를 지원하지 않는다 | npm에서 `@ladle/react`의 `peerDependencies` 확인 |

## Consequences

- 새 컴포넌트를 만들면 옆에 `X.preview.tsx`를 만들고 `src/components/preview/catalog.ts`에 등록한다. `.claude/rules/frontend.md` 체크리스트에 적고, `tests/preview-catalog.test.ts`가 파일이 빠지면 실패한다. 등록이 빠지면 `/preview` 맨 위에 경고가 뜬다.
- 상단 주석은 `/preview` 서버 페이지가 소스 파일에서 직접 읽는다. 주석을 카탈로그에 옮겨 적지 않는다.
- `.vscode/settings.json`에 파일 중첩 설정을 넣어 저장소로 공유한다. `.vscode/`에서는 `settings.json`과 `extensions.json`만 올린다(`.gitignore`, GitHub 공식 VS Code 템플릿 방식). VS Code를 쓰지 않으면 `X.preview.tsx`가 그대로 나열된다.
- 저장소를 직접 읽는 `settings/ProfileForm`의 불러오는 중·오류 상태는 props로 바꿀 수 없어 카탈로그에서 보여주지 못한다. `main/Home`은 실제 화면을 iframe으로 띄운다.
- 맞바꾼 것: Storybook의 props 표, 컨트롤, 인터랙션 테스트, 문서 배포. 컴포넌트 폴더를 읽기도 조금 어려워진다.

## Re-evaluation Triggers

- 관리할 컴포넌트가 많아져 카탈로그를 손으로 관리하기 부담스러워질 때. 사용자는 그때 Storybook 도입이 좋다고 본다. 변형을 "컴포넌트 × 이름 붙인 변형"으로 정리해 두었으므로 CSF 스토리로 옮길 수 있다.
- 컨트롤로 props를 바꿔 보거나 컴포넌트 문서를 따로 배포해야 할 때
- A1이나 A2가 틀린 것으로 드러날 때
