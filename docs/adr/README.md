# ADR

기술 결정과 그 근거. 찾을 때는 아래 색인을 먼저 보고 필요한 파일만 연다.

## 쓰는 법

- 새 ADR은 `TEMPLATE.md`를 따른다. 파일 이름은 `NNNN-<영어-slug>.md`, 번호는 가장 큰 번호 + 1이다.
- 결정한 사람은 사용자다. Decision과 Confidence는 대화에서 정해진 대로 쓰고, 정해지지 않았으면 묻는다.
- 출처 없이 AI가 추측한 내용은 본문에 `(추측 A1)`처럼 표시하고 "확인하지 않은 가정" 표에 확인 방법과 함께 적는다.
- 쓰거나 Status를 바꾸면 이 색인을 같이 고친다. 빠뜨리면 `tests/docs-index.test.ts`가 실패한다.

## 고치는 법

- Accepted가 된 ADR은 본문을 고치지 않는다. 당시 판단 근거를 남기기 위해서다.
- 결정을 바꾸면 새 ADR을 쓰고 "ADR-NNNN의 무엇을 대체한다"고 적는다. 옛 ADR은 Status 줄만 `Superseded by ADR-NNNN` 또는 `Accepted (<부분>은 ADR-NNNN으로 대체)`로 바꾼다.
- 오타와 깨진 링크는 고쳐도 된다.
- 템플릿이 바뀌면 형식은 맞춰도 된다. 결정 내용과 근거는 바꾸지 않는다.

## 색인

| ADR | 결정 | Status | 관련 R |
|---|---|---|---|
| [0001](0001-llm-model-selection.md) | 기록 파싱은 gpt-6-luna, 상담은 gpt-6.1-terra. 모델명은 환경변수로 | Accepted | R1, R4, R8 |
| [0002](0002-doc-structure-for-agent.md) | CLAUDE.md는 항상 필요한 것만, PRD는 영역별 파일로, 경로 규칙은 `.claude/rules/`로 | Accepted (ADR 작성 시점은 0004로, 일정·PLAN은 0006으로, PRD 영역별 파일은 0011로 대체) | 없음 |
| [0003](0003-no-global-state-library.md) | 전역 상태 라이브러리를 쓰지 않고 React 기본 상태로 | Accepted | 없음 |
| [0004](0004-auto-write-docs-after-decision.md) | 결정이 나면 문서는 묻지 않고 쓴다. ADR은 고치지 않고 대체한다. 추측은 표시한다. 색인을 둔다 | Accepted | 없음 |
| [0005](0005-precommit-and-ci-checks.md) | husky pre-commit과 GitHub Actions에서 lint·typecheck·test를 모두 돌린다. LLM 측정은 `npm run metrics`로 따로 | Accepted | 없음 |
| [0006](0006-plan-and-r-scoped-dev-log.md) | `plan.md`는 큰 우선순위만, 세부 계획과 결과는 R 단위 dev-log에. `/planning`·`/next-plan`으로 다룬다 | Accepted | 없음 |
| [0007](0007-import-path-and-no-barrel.md) | 배럴 파일을 두지 않는다. import는 폴더 밖 `@/`, 같은 폴더 안 `./`. ESLint로 강제 | Accepted | 없음 |
| [0008](0008-const-functions-and-bottom-exports.md) | 함수는 `const` 화살표 함수, export는 파일 맨 아래에 모음. `src/app`의 Next 파일만 `export default function`. ESLint로 강제 | Accepted | 없음 |
| [0009](0009-component-folders.md) | 컴포넌트는 `layout`(뼈대) · `common`(작은·공용, 로직 모름) · 도메인 폴더(화면 전용 큰 단위)로. 폴더 목록은 테스트로 강제 | Accepted | 없음 |
| [0010](0010-preview-catalog.md) | 미리보기는 Storybook 없이 직접 만든다. 컴포넌트 탭과 PRD 장면 탭으로 나누고, 변형은 컴포넌트 옆 `X.preview.tsx`에 | Accepted | 없음 |
| [0011](0011-r-scoped-prd-and-requirement-ids.md) | PRD는 R마다 파일 하나. 하위 요구사항 `R<n>-k`·수락 기준 `R<n>-k.m` 번호, R 문서의 요구사항별 개발 표, 검사 테스트로 빈 곳을 막는다 | Accepted | 없음 |
| [0012](0012-kind-definitions-and-entry-shape.md) | 기록은 공통 칸 + `kindId` + `values`, 종류 정의는 코드에. 시각 정확도는 `timePrecision`(정확·추정·하루 전체) | Accepted | R1, R11 |
| [0013](0013-chat-message-block-storage.md) | 채팅 메시지는 블록 단위 `ChatMessage`로 저장하고 `ConsultMessage`는 없앤다 | Accepted | R1 |
| [0014](0014-responsive-width-breakpoints.md) | 모바일 ~767 · 태블릿 768~1023 · PC 1024~. 폭은 %, 최대 폭은 px. 1단 92%, PC 2단 92%·최대 1200px, 채팅 40%·최대 420px | Accepted | R0 |
| [0015](0015-custom-overlay-scrollbar.md) | 기본 스크롤바를 숨기고 직접 만든 오버레이 막대를 쓴다. 라이브러리 없이 | Accepted | R0 |
