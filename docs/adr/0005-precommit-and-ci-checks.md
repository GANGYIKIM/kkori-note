# ADR-0005: 커밋 전 husky와 push 후 GitHub Actions에서 lint·typecheck·test를 모두 돌린다

- **Status:** Accepted
- **Date:** 2026-10-30
- **Confidence:** High (테스트를 구조적으로 강제하는 장치는 꼭 필요하다고 판단함)

## Decision

**husky pre-commit과 GitHub Actions에서 `lint`, `typecheck`, `test`를 구분 없이 모두 돌린다.** husky는 사람과 AI의 커밋을 실패한 상태로 남기지 않고, Actions는 `--no-verify`로 건너뛴 커밋까지 잡는다. 그래서 `npm test`에는 빠르고 결과가 늘 같은 테스트만 넣고, LLM을 부르는 측정은 `npm run metrics`로 따로 돌린다.

## Context

- CLAUDE.md "끝낼 때"는 `lint`, `typecheck`, `test` 통과를 요구하지만 지시문일 뿐이었다. 저장소에 CI, git hook, Claude Code hook이 없어서 사람이 직접 커밋하거나 AI가 규칙을 놓치면 검사가 돌지 않았다.
- `tests/docs-index.test.ts`(ADR-0004), `src/app/api/guard-coverage.test.ts`처럼 규칙을 코드로 강제하는 테스트가 늘고 있다. 이 테스트들은 돌아야 의미가 있다.
- 저장소 `GANGYIKIM/kkori-note`는 공개 저장소다. GitHub 문서는 공개 저장소의 표준 호스팅 러너를 무료·무제한으로 안내한다 (2026-10-30 Context7로 확인: docs.github.com "About billing for GitHub Actions").
- 2026-10-30 로컬에서 `npm test` 전체(9개 파일, 38개)는 833ms, `tests/docs-index.test.ts`만은 299ms였다.
- `docs/metrics.md`의 측정(M1~M3)은 `npm run metrics`로 돌리기로 되어 있고, M3는 LLM 호출을 포함한다.

## Candidates

### 강제 방법
- **A. husky pre-commit + GitHub Actions (채택)**: husky는 커밋 전에 막고, Actions는 push 후 다시 검사해 결과를 저장소에 ✅/❌로 남긴다.
- **B. `.claude/rules`에 지시 추가**: 지시일 뿐이라 강제되지 않고, 사람의 커밋은 다루지 못하며, `docs/adr/README.md`와 내용이 겹쳐서 탈락했다.
- **C. Claude Code hook**: 하네스가 실행해 강제되지만 Claude 세션에서만 돌아서 탈락했다.
- **D. GitHub Actions만**: 문제를 push 후에야 알아서 husky와 함께 쓰기로 했다.

### 검사 범위
- **A. 모든 테스트를 매번 (채택)**: 전체가 1초 안쪽이라 나눌 이유가 없다.
- **B. 바뀐 파일에 해당하는 테스트만**: lint-staged 같은 도구가 더 필요하고, 파일 이름 변경·삭제처럼 문서 밖 작업으로 색인이 깨지는 경우를 놓칠 수 있어서 탈락했다.

## Evaluation

2026-10-30 로컬(macOS, Node 25)에서 `.husky/pre-commit`을 직접 실행하니 `lint`·`typecheck`·`test` 전체가 약 15초 걸렸다. 단계별 시간은 재지 않았다.

## 확인하지 않은 가정

| ID | 가정 | 확인 방법 |
|---|---|---|
| A1 | Vercel 빌드의 Node 버전과 CI의 Node 24가 달라도 검사 결과가 같다 | Vercel 프로젝트 설정의 Node 버전을 확인한다 |

## Consequences

- devDependency `husky`와 `prepare` 스크립트, `.husky/pre-commit`, `.github/workflows/ci.yml`을 추가한다. CI는 `HUSKY=0`으로 hook 설치를 건너뛴다.
- `npm test`에 넣을 수 있는 테스트는 네트워크와 LLM을 쓰지 않고 결과가 늘 같은 것이다. LLM을 부르는 측정은 `npm run metrics`에 두고 husky와 CI에서 돌리지 않는다.
- `build`는 CI에 넣지 않는다. 배포 때 Vercel이 빌드한다.
- 맞바꾼 것: 커밋마다 약 15초가 더 걸린다. `git commit --no-verify`로 건너뛸 수 있지만 그 커밋은 Actions가 잡는다.

## Re-evaluation Triggers

- pre-commit이 체감할 만큼 느려질 때 (빠른 검사만 husky에 남기고 나머지는 CI로 옮긴다)
- 저장소를 비공개로 바꿔 Actions 사용량이 과금될 때
