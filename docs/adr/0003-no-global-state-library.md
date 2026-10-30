# ADR-0003: 전역 상태 라이브러리(Zustand)를 쓰지 않는다

- **Status:** Accepted
- **Date:** 2026-10-30
- **Confidence:** Medium (시간·비용 대비 판단이고, 리렌더링 비용은 아직 측정하지 않음)

## Decision

**Zustand 같은 전역 상태 라이브러리를 쓰지 않고 React 기본 상태로 간다.** 얻을 수 있는 이점(selector 구독으로 리렌더링 줄이기)은 라이브러리 없이도 대부분 얻을 수 있고, 마감(2026-11-03)까지 남은 시간에 비해 도입 비용(Provider 구조, 요청별 store, 학습·검토)이 크기 때문이다.

## Context

- PRD 기술 스택 표(v0.3)는 "React 기본 상태, 필요 시 Zustand"였고, CLAUDE.md는 "전역 상태 라이브러리는 쓰지 않는다"여서 두 문서가 어긋났다(ADR-0002의 남은 불일치).
- 기록과 프로필은 브라우저 IndexedDB에만 있고 서버는 LLM 호출만 한다. 기록 목록과 채팅이 함께 쓰는 상태는 `src/components/MainScreen.tsx` 한 곳의 `useState`에 모여 있다. 화면은 메인과 설정 두 개다.
- 결정 전에 두 가지를 확인했다. Next.js App Router에서 상태 라이브러리가 서버 컴포넌트와 맞는지, 그리고 리렌더링을 막으려면 필요한지다.

## Candidates

### A. React 기본 상태 (채택)
- 추가 의존성이 없다. 공유 데이터의 원본은 IndexedDB 하나다.
- 메시지가 추가될 때 MainScreen 전체(기록 목록 포함)가 다시 그려진다. 입력 중에는 입력값이 `ChatComposer`의 지역 상태라 전체가 다시 그려지지 않는다.

### B. Zustand
- selector로 필요한 부분만 구독해서, 바뀐 부분의 컴포넌트만 다시 그린다.
- Zustand 공식 Next.js 가이드는 전역 store를 금지하고(서버가 여러 요청을 동시에 처리해 store가 공유됨) 서버 컴포넌트에서 store를 읽고 쓰지 말라고 한다. 그래서 요청마다 store를 만들고 Context Provider로 내려야 한다. Next.js 문서도 서버 컴포넌트에서는 Context를 못 쓰고 Provider는 클라이언트 컴포넌트로, 트리 깊은 곳에 두라고 한다. (2026-10-30 Context7로 확인: zustand.docs.pmnd.rs Next.js 가이드, Next.js v16.2.9 Server and Client Components 문서)
- 이 앱은 서버와 나눌 상태가 없어서 이 구조의 이점이 없다. 대신 IndexedDB와 store 두 곳에 같은 데이터가 생겨 동기화할 일이 늘어난다.

## Evaluation

리렌더링 비용은 측정하지 않았다. 데모 데이터가 약 2주치(기록 수십~백여 건, PRD R10)라 문제가 될 가능성은 낮다고 판단했다.

## 확인하지 않은 가정

| ID | 가정 | 확인 방법 |
|---|---|---|
| A1 | 데모 데이터 규모에서는 리렌더링 비용이 문제 되지 않는다 | 실제 저장소로 바꾼 뒤 React DevTools Profiler로 본다 |

## Consequences

- 리렌더링이 문제가 되면 라이브러리보다 먼저 다음을 쓴다. 상태를 쓰는 컴포넌트로 내리기(예: 메시지 목록을 채팅 쪽으로), `React.memo`, 실제 저장소 전환 때 목록과 채팅이 각자 IndexedDB를 구독하는 방식(Dexie `liveQuery`)이다. React Compiler는 패키지 추가가 필요해 따로 제안한다.
- `docs/prd/platform.md`의 상태 관리 행을 이 결정에 맞춰 고쳤다. CLAUDE.md 규칙은 그대로다.
- 맞바꾼 것: 메시지가 바뀔 때 기록 목록도 다시 그려지는 비용을 당분간 받아들인다.

## Re-evaluation Triggers

- 실제 저장소로 바꾼 뒤 React DevTools Profiler에서 기록 목록이나 채팅의 리렌더링이 체감 지연(입력·스크롤 끊김)으로 확인될 때
- 위 대안(상태 내리기, memo, liveQuery)으로도 해결되지 않을 때
- 화면이 늘어 여러 페이지가 같은 클라이언트 상태를 나눠 써야 할 때
