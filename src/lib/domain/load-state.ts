/** 불러오는 데이터의 화면 상태 (PRD R0-6) */
type LoadState<T> = { status: "loading" } | { status: "empty" } | { status: "error" } | { status: "data"; data: T };

/** 불러온 목록을 상태로. 비어 있으면 empty */
const fromList = <T>(items: readonly T[]): LoadState<readonly T[]> => {
  return items.length === 0 ? { status: "empty" } : { status: "data", data: items };
};

export { fromList };
export type { LoadState };
