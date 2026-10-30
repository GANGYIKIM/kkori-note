---
description: plan.md와 R 문서를 보고 다음에 할 하위 작업을 알려준다 (파일은 바꾸지 않음)
disable-model-invocation: true
model: haiku
context: fork
allowed-tools: Bash(sh scripts/next-plan-context.sh), Bash(git log:*)
---

!`sh scripts/next-plan-context.sh`

## 최근 커밋

!`git log --oneline -8`

## 할 일

위 내용만 보고 답한다. 도구를 쓰지 않는다(파일 읽기, 명령 실행, 수정 모두). 한국어 존댓말로, 아래 형식으로만 짧게 답한다.

**진행 중인 R 문서가 있을 때** (plan.md 작업 표의 상태가 "진행 중")

```
진행 중: R<n> <이름> (<체크된 수>/<전체 수>)
다음 할 일: <체크 안 된 첫 하위 작업> — docs/dev-log/R<n>/README.md
체크 확인: <최근 커밋을 보면 끝난 것 같은데 체크 안 된 하위 작업과 근거 커밋 / 없음>
```

진행 중인 R이 여럿이면 plan.md 우선순위가 높은 것부터 R마다 위 세 줄을 쓴다.

**진행 중인 R 문서가 없을 때**

다음 할 일을 대신 고르지 않는다. 아래만 쓴다.

```
진행 중인 계획이 없어요.
아직 작업 표에 없는 우선순위: <plan.md 우선순위 중 작업 표에 R이 없는 항목 번호와 이름>
plan.md의 우선순위와 고르는 기준으로 직접 골라 보시고, `/planning <R 번호> <하고 싶은 일>`로 계획을 세워 보세요.
```

plan.md가 없으면 "docs/plan.md가 없어요."라고만 답한다.
