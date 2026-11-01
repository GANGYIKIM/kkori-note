# ADR-0013: 채팅 메시지는 블록 단위(`ChatMessage`)로 저장한다

- **Status:** Accepted
- **Date:** 2026-11-02
- **Confidence:** Medium (화면 연결(R1 하위 작업 5) 전이라 새로고침 후 복원을 아직 확인하지 않음)

## Decision

**채팅 메시지는 화면이 그리는 블록 목록(`ChatMessage.blocks`) 그대로 IndexedDB에 저장하고, 문자열 하나짜리 `ConsultMessage`는 없앤다.** 새로고침 후에도 칩 카드·근거 카드·위험 안내가 섞인 채팅을 LLM을 다시 부르지 않고 그대로 다시 그리기 위해서다.

## Context

- R1-11은 채팅 화면이 새로고침해도 남아야 한다고 한다 (`docs/prd/R1.md`, R7).
- 응답 하나에는 텍스트, 기록 칩 카드, 근거 카드, 에피소드 카드, 위험 안내, 시스템 안내가 순서대로 섞인다. 이 모양은 이미 `ChatBlockSchema`로 정의돼 있었다 (`src/lib/domain/types.ts`, 2026-11-02 확인).
- 바꾸기 전 저장소는 `ConsultMessage { role, content: string }`만 저장했다 (`src/lib/storage/storage.ts`). 실제 저장된 메시지는 없다.

## Candidates

### A. 블록 단위 저장 (채택)
- 저장한 그대로 다시 그린다. 칩 카드와 근거 카드는 기록을 복사하지 않고 기록 id만 가진다.

### B. `ConsultMessage`(텍스트만) 유지
- 칩 카드·근거 카드·위험 안내를 복원할 수 없고, 다시 만들려면 처리를 다시 돌려야 한다. LLM 비용이 다시 들고 결과가 처음과 달라질 수 있어 탈락했다.

## Evaluation

측정하지 않음.

## 확인하지 않은 가정

없음.

## Consequences

- 저장소 인터페이스는 `saveChatMessage`, `listChatMessages`(작성 시각 오름차순)를 가진다.
- 카드가 기록 id만 가지므로, 기록을 고치면 카드에 고친 내용이 보인다. 기록을 지우면 카드가 없는 id를 다뤄야 한다(R1 하위 작업 5).
- 위험 안내 블록은 문장(`title`, `body`)을 저장한다. 코드의 고정 문장이 나중에 바뀌어도 지난 메시지에는 그때 문장이 남는다.
- 새 메시지를 처리할 때 이전 대화를 LLM에 넣지 않는 원칙(R1-12)은 그대로다. 저장한 대화는 화면 복원에만 쓴다.
- 맞바꾼 것: 블록 모양을 바꾸면 저장된 메시지도 옮겨야 한다.

## Re-evaluation Triggers

- `ChatBlockSchema`의 모양을 바꿔야 할 때
- 대화가 쌓여 IndexedDB 조회나 화면 그리기가 느려질 때
