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
| [0002](0002-doc-structure-for-agent.md) | CLAUDE.md는 항상 필요한 것만, PRD는 영역별 파일로, 경로 규칙은 `.claude/rules/`로 | Accepted (ADR 작성 시점은 0004로 대체) | 없음 |
| [0003](0003-no-global-state-library.md) | 전역 상태 라이브러리를 쓰지 않고 React 기본 상태로 | Accepted | 없음 |
| [0004](0004-auto-write-docs-after-decision.md) | 결정이 나면 문서는 묻지 않고 쓴다. ADR은 고치지 않고 대체한다. 추측은 표시한다. 색인을 둔다 | Accepted | 없음 |
| [0005](0005-precommit-and-ci-checks.md) | husky pre-commit과 GitHub Actions에서 lint·typecheck·test를 모두 돌린다. LLM 측정은 `npm run metrics`로 따로 | Accepted | 없음 |
