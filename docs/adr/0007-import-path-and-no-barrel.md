# ADR-0007: import 규칙 — 배럴 파일을 두지 않고, 폴더 밖은 `@/`, 같은 폴더 안만 `./`로 가져온다

- **Status:** Accepted
- **Date:** 2026-10-31
- **Confidence:** High (사용자가 Next 문서의 배럴 파일 경고를 읽고 득보다 실이 훨씬 크다고 판단함)

## Decision

**배럴 파일(`index.ts`로 다시 내보내기)을 두지 않고 원본 파일에서 직접 import한다. 경로는 폴더 밖이면 `@/` 별칭, 같은 폴더 안이면 `./`를 쓰고 `../`는 쓰지 않는다.** 둘 다 `eslint.config.mjs`의 규칙(`no-restricted-syntax`, `no-restricted-imports`)으로 강제한다. 문서로만 적어 두면 에이전트가 놓칠 수 있어서다.

## Context

- 사용자는 처음에 `import { ChatView, EntryChipCard } from "@/components/chat"`처럼 배럴로 가져오는 방식이 읽기 좋다고 봤다 (2026-10-31 대화).
- 설치된 Next 문서는 배럴 파일이 빌드를 느리게 할 수 있으니 원본 파일에서 직접 import하라고 권한다 (`node_modules/next/dist/docs/01-app/02-guides/local-development.md` "Barrel files", 2026-10-31 확인).
- 바꾸기 전 `src`의 import는 `@/` 41곳, `../` 23곳, `./` 35곳으로 섞여 있었고, 배럴 파일과 re-export는 없었다 (2026-10-31 grep).
- 두 규칙 모두 자동 수정이 되지 않아서, 기존 `../` 23곳은 스크립트로 `@/`로 바꿨다.

## Candidates

### 배럴 파일
- **A. 두지 않음, 원본 파일에서 직접 import (채택)**: 어느 파일에서 오는지 바로 보이고 그 파일만 불러온다. 대신 import 줄이 길고, 파일을 옮기면 쓰는 쪽도 고쳐야 한다.
- **B. 큰 폴더(`components/chat`)에 배럴을 둠**: import가 짧고 폴더가 공개 API 역할을 한다. 대신 Next 문서가 경고한 빌드 비용이 있고, 폴더 안에서 배럴을 import하면 순환이 생기며, `index.ts`를 따로 관리해야 한다. 사용자가 Next 문서를 읽고, 짧은 import라는 득보다 이 비용들이 훨씬 크다고 판단해 탈락시켰다.

### 경로
- **A. 폴더 밖은 `@/`, 같은 폴더 안만 `./` (채택)**: 파일을 옮겨도 바깥 import가 덜 깨지고, 같은 폴더 안은 짧게 쓴다.
- **B. 항상 `@/`**: 모양은 하나로 같지만 같은 폴더 안에서도 경로가 길어진다.
- **C. 항상 상대경로**: 깊은 폴더에서 `../../`가 길어지고, 파일을 옮기면 import도 같이 고쳐야 한다.

## Evaluation

측정하지 않음.

## 확인하지 않은 가정

없음.

## Consequences

- `eslint.config.mjs`에서 `export * from`과 `export { X } from`(re-export)을 오류로 막는다. 배럴이 아닌 곳의 re-export도 함께 막힌다.
- `../`로 시작하는 import를 오류로 막는다. pre-commit과 CI의 `lint`에서 걸린다 (ADR-0005).
- 맞바꾼 것: 큰 폴더에서 import 줄이 여러 개가 된다 (예: `PreviewCatalog.tsx`의 `@/components/chat/...` 여러 줄).

## Re-evaluation Triggers

- 한 파일이 같은 폴더에서 import하는 줄이 너무 많아져 읽기 어려울 때
- 일부 폴더를 패키지처럼 공개 API로 감싸야 할 때 (예: 여러 앱이 같은 컴포넌트를 공유할 때)
