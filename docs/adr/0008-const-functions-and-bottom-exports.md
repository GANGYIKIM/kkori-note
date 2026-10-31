# ADR-0008: 함수는 `const` 화살표 함수로 쓰고, export는 파일 맨 아래에 모은다. `src/app`의 Next 파일만 예외

- **Status:** Accepted
- **Date:** 2026-10-31
- **Confidence:** High (사용자가 후보를 비교해 직접 고름)

## Decision

**`src/app` 밖에서는 컴포넌트와 일반 함수를 모두 `const X = () => …`로 쓰고, 내보낼 것은 파일 맨 아래의 `export { … }`와 `export type { … }` 한 곳에 모은다. `src/app`의 Next 파일(page, layout, route)은 지금처럼 `export default function`과 선언에 붙인 export를 쓴다.** 한 파일에 함수가 여러 개 있어도 맨 아래 export 문만 보면 그 파일이 무엇을 내보내는지 알 수 있어서다. 문서로만 적어 두면 에이전트가 놓칠 수 있어서 ESLint로 강제한다.

## Context

- 바꾸기 전 `src`에는 `export function`이 39곳, `export const` 화살표 컴포넌트가 `Icons.tsx`에 8곳 있어 섞여 있었다. 정해진 규칙은 없었고, `function`이 많은 것은 Next 문서와 템플릿의 `export default function Page()` 관례를 따른 결과였다 (2026-10-31 grep, 대화).
- 사용자는 `const`를 선호했다. 이유는 한 파일에 함수가 여러 개 있을 때 하단 export 문으로 공개 범위를 파악하기 쉽다는 것이다 (2026-10-31 대화).
- Next의 page와 layout은 default export여야 한다. `function` 선언이면 `export default function Page()` 한 줄로 끝난다.

## Candidates

### export 위치
- **A. 파일 맨 아래 `export { … }`에 모음 (채택)**: 공개 범위가 한 곳에 모인다. 대신 이름을 선언과 export 문에 두 번 쓴다.
- **B. 선언에 바로 `export const`**: 한 번만 쓰면 된다. 대신 무엇을 내보내는지 보려면 파일 전체를 훑어야 해서, 사용자가 원한 장점이 생기지 않는다.

### `src/lib`의 일반 함수
- **A. 컴포넌트와 똑같이 `const` (채택)**: 규칙이 하나라 린트 설정과 이 문서가 단순하다.
- **B. `function` 선언 + 하단 export**: 헬퍼를 아래에 두고 위에서 호출하는 호이스팅을 쓸 수 있다. 대신 컴포넌트와 규칙이 갈린다.

### `src/app`의 Next 파일
- **A. `export default function` 유지 (채택)**: Next 문서와 같은 모양이고 default export가 한 줄이다.
- **B. 여기도 `const` + 하단 export**: 규칙은 하나가 되지만 `export default Page`를 따로 써야 하고 Next 문서와 모양이 달라진다.

## Evaluation

측정하지 않음.

## 확인하지 않은 가정

없음.

## Consequences

- `eslint.config.mjs`에서 `src/app` 밖의 `src` 파일에 아래 규칙을 오류로 건다. pre-commit과 CI의 `lint`에서 걸린다 (ADR-0005).
  - `func-style: expression`: 컴포넌트 안의 핸들러를 포함해 `function` 선언을 막는다.
  - `react/function-component-definition`: 컴포넌트를 화살표 함수로 쓰게 한다.
  - `no-restricted-syntax`의 `ExportNamedDeclaration[declaration]`: `export const`, `export type X =`, `export interface`처럼 선언에 붙인 export를 막는다.
  - `import/exports-last`, `import/group-exports`: export 문을 파일 맨 아래 한 곳에 모으게 한다.
- 기존 `function` 선언과 선언에 붙은 export는 스크립트로 바꿨다.
- 맞바꾼 것: 호이스팅이 없어서, 모듈을 불러올 때 바로 실행되는 코드는 위에서 정의한 것만 쓸 수 있다. 이름을 선언과 export 문에 두 번 쓴다.

## Re-evaluation Triggers

- 모듈을 불러올 때 아래쪽 `const`를 먼저 써서 TDZ 오류가 반복될 때
- 화살표 함수로 표현하기 어려운 것(오버로드, 제너레이터)이 여러 곳에 필요해질 때
