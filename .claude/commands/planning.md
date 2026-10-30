---
description: R 하나의 세부 계획(하위 작업 목록)을 세워 R 문서로 남긴다
argument-hint: <R 번호> <하고 싶은 일>
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(sed:*), Bash(find:*)
---

요청: $ARGUMENTS

## PRD 요구사항 색인

!`sed -n '/^| R | 내용/,/^$/p' docs/PRD.md`

## 이미 있는 R 문서

!`find docs/dev-log -mindepth 1 -maxdepth 1 -type d -name 'R*'`

## 할 일

근거는 ADR-0006, 형식은 `docs/dev-log/README.md`를 따른다. 이 명령어는 계획만 세운다. 코드와 하위 문서는 쓰지 않는다.

### 0. 요청 확인

요청이 비었거나 R 번호(`R1` 형식)가 없으면 계획을 세우지 말고 아래만 안내하고 끝낸다. 무엇을 할지 대신 고르지 않는다.

- 형식: `/planning <R 번호> <하고 싶은 일>`
- 예: `/planning R1 채팅으로 기록하면 칩이 저장되게`, `/planning R2 "어제 저녁쯤" 같은 시각 표현`
- 고를 수 있는 R: 위 색인의 R 번호와 내용을 한 줄씩 보여준다.
- 무엇을 할지 모르겠으면 `docs/plan.md`의 우선순위와 고르는 기준으로 직접 골라 보고, 진행 중인 작업은 `/next-plan`으로 확인하라고 안내한다.

### 1. 읽기

- 위 색인에서 그 R의 영역 파일을 찾아 그 R 섹션만 읽는다.
- 색인의 "열린 질문" 칸이 비어 있지 않으면 `docs/prd/open-questions.md`에서 그 R에 걸린 질문을 읽는다.
- `docs/dev-log/R<n>/README.md`가 이미 있으면 읽는다. 이 경우 새 R 문서를 만들지 않고 하위 작업 줄을 더한다.

### 2. 초안 보여주기

`docs/dev-log/TEMPLATE-R.md` 형식으로 초안을 대화에 보여준다. 파일은 아직 쓰지 않는다.

- 하위 작업은 수락 기준 묶음 단위로, 요청한 일과 관련된 것만 6개 이하로 나눈다. 6개를 넘으면 R을 나누자고 제안한다.
- 하위 작업마다 채우는 수락 기준을 요약해 붙이고, 의존되는 것을 위에 둔다.
- 블로킹 질문이 있으면 "이 값이 정해져야 진행할 수 있어요"와 함께 맨 위에 보여준다. 값을 지어내지 않는다.
- 고를 것이 있는 항목만 하나씩 묻는다. 명확한 항목은 한 번에 승인받는다.

### 3. 승인 후 쓰기

1. `docs/dev-log/R<n>/README.md`를 쓴다(있으면 하위 작업 줄만 더한다).
2. `docs/dev-log/README.md` 색인에 R 문서 줄을 더한다(이미 있으면 그대로 둔다).
3. `docs/plan.md`가 있으면 "작업" 표에 `| R<n> | [R 문서](dev-log/R<n>/README.md) | 진행 중 |` 줄을 더한다.
4. 쓴 파일 경로를 알리고, 첫 하위 작업을 시작하려면 "1번 시작하자"처럼 말하면 된다고 안내한다.
