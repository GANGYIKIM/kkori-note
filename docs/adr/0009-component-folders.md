# ADR-0009: 컴포넌트는 `layout` · `common` · 도메인 폴더로 나누고, `common`은 로직을 모르게 만든다

- **Status:** Accepted
- **Date:** 2026-10-31
- **Confidence:** Medium (기준은 사용자가 정했지만, 기획과 화면이 아직 바뀌는 단계라 도메인 경계가 달라질 수 있음)

## Decision

**`src/components`를 아래처럼 나눈다. 맨 위에는 파일을 두지 않는다.**

| 폴더 | 담는 것 |
|---|---|
| `layout/` | 화면 뼈대를 이루는 큰 요소 (헤더, 시트, 패널) |
| `common/` | 작은 단위 요소와, 두 곳 이상에서 쓰는 요소. `children`·`className`·슬롯만 받고 도메인 타입과 로직을 모른다 |
| `entry/`, `chat/`, `main/`, `settings/`, `preview/` | 그 화면에서만 쓰는 큰 단위 요소 |

컴포넌트는 꼭 필요한 경우가 아니면 재사용을 염두에 두고 `common/`에 만든다. 도메인 폴더에 두는 것은 특정 화면의 큰 단위 요소(`entry/EditSheet`, `entry/DateGroupedList`)뿐이다. 한 폴더에 쌓인 파일을 구분하기 어려웠고, 작은 요소를 디자인 시스템처럼 만들어 재사용성과 통일성을 지키기 위해서다.

## Context

- 바꾸기 전 `src/components` 맨 위에 파일 11개가 섞여 있었고, 하위 폴더는 `chat/`과 `preview/`뿐이었다 (2026-10-31 `find`).
- 설치된 Next 문서는 폴더 구조에 의견을 두지 않고, 고른 방식을 프로젝트 전체에서 일관되게 쓰라고만 한다 (`node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md` "Organizing your project", 2026-10-31 확인).
- 라우트 안 `_components`에 두는 방식은 `.claude/rules/styling.md`의 "화면 조각은 `src/components/`에" 규칙과 충돌해 검토에서 뺐다.

## Candidates

### 배치 기준
- **A. 작은 요소와 두 곳 이상에서 쓰는 요소는 `common/`, 화면 전용 큰 요소만 도메인 폴더 (채택)**: 재사용을 기본으로 둔다. 대신 도메인 폴더의 요소를 다른 곳에서도 쓰게 되면 `common/`으로 옮기고, 그때 로직을 빼야 한다.
- **B. 다루는 데이터로 고름 (`KindTag`는 다른 곳에서 써도 `entry/`)**: 쓰는 곳이 늘어도 옮기지 않는다. 사용자가 공용 요소는 도메인 전속으로 보기 어렵다며 탈락시켰다.

### `common/`이 도메인 타입을 받아도 되나
- **A. 받지 않음. `children`·`className`·슬롯만 받는다 (채택)**: 예를 들어 `common/Tag`는 기록 종류를 모르고, 쓰는 쪽이 `KIND_STYLES`와 `LABELS`로 색과 글자를 넘긴다. 대신 같은 조립 코드가 쓰는 곳마다 생긴다.
- **B. 받음 (`KindTag`가 `kind`를 받음)**: 쓰기는 간단하지만, 사용자가 "UI는 로직을 몰라야 한다"며 탈락시켰다.

### 기록 종류별 색 (`KIND_STYLES`)
- **A. `lib/domain/values.ts`에 `LABELS` 옆에 둠 (채택)**: 기록 종류의 이름과 색이 한곳에 모이고, 여러 도메인 폴더가 같은 값을 쓴다.
- **B. `common/`에 상수 파일로**: `common/`에 컴포넌트가 아닌 파일이 섞인다.
- **C. 도메인 폴더마다 따로**: 색이 중복된다.

### 뼈대 폴더 이름
- **A. `layout/` (채택)**: 프론트엔드에서 `ui/`는 보통 디자인 시스템 프리미티브 폴더로 쓰여(예: shadcn/ui의 `components/ui/`) 오해를 부른다.
- **B. `ui/`**: 사용자가 처음 쓴 이름. 위 이유로 바꿨다.

### 도메인 폴더 안 이름
- **A. 도메인 이름을 빼고, 남는 이름이 역할만 나타내는 한 단어면 담는 것을 드러내는 이름으로 (채택)**: `EntryList` → `entry/DateGroupedList`, `ChatView` → `chat/Conversation`, `MainScreen` → `main/Home`. DevTools와 검색에서 구분된다.
- **B. 예외 없이 뺌 (`entry/List`, `chat/View`)**: 규칙은 단순하지만 이름만으로 무엇인지 알기 어렵다.
- **C. 도메인 이름 유지 (`entry/EntryList`)**: 폴더와 이름에 도메인이 두 번 나온다.

## Evaluation

측정하지 않음.

## 확인하지 않은 가정

없음.

## Consequences

- 폴더를 고르는 기준과 이름 규칙은 `.claude/rules/frontend.md`(옛 `styling.md`)에 적는다. 컴포넌트를 편집할 때 자동으로 읽힌다.
- `common/`과 `layout/` 컴포넌트에는 어떤 상황에 쓰는지 한 줄 설명을 단다. 재사용할 때 같은 요소를 다시 만들지 않게 하기 위해서다.
- `tests/component-folders.test.ts`가 `src/components` 맨 위의 파일과 정해지지 않은 폴더를 막는다. 폴더를 새로 만들면 이 테스트의 목록과 `frontend.md`를 함께 고친다.
- 기존 컴포넌트를 옮기고 이름을 바꿨다. `KindTag`는 `common/Tag`, `EntryRow`는 슬롯만 받는 `common/ListRow`, `NoticeBanner`와 `RiskBanner`의 모양은 `common/Banner`로 합쳤다. 위험 등급을 모양으로 바꾸는 일은 `chat/RiskBanner`가 맡고, 문장은 그대로 코드의 고정 문장이다.
- 맞바꾼 것: `common/`이 로직을 모르는 대신, 기록을 `Tag`나 `ListRow`로 풀어서 넘기는 코드가 쓰는 곳마다 있다 (`entry/DateGroupedList`, `chat/EvidenceCard`, `chat/EntryChipCard`).
- 폴더끼리의 import 방향(예: `common/`이 `lib/domain`을 import하지 못함)은 린트로 막지 않는다. 화면 구조가 아직 바뀌는 단계라 경계를 굳히면 정당한 변경마다 규칙을 고쳐야 해서다.

## Re-evaluation Triggers

- 화면 구조가 안정돼 도메인 경계가 굳었을 때. 그때 `import/no-restricted-paths`로 import 방향을 막는 것을 다시 본다.
- `common/` 컴포넌트가 도메인 타입이나 `lib/domain`을 import하는 일이 리뷰에서 실제로 생길 때
- 쓰는 곳마다 같은 조립 코드가 늘어 바꿀 때 여러 곳을 함께 고치게 될 때
