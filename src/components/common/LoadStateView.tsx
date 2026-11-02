import type { ReactNode } from "react";

type ViewState<T> = { status: "loading" } | { status: "empty" } | { status: "error" } | { status: "data"; data: T };

/**
 * 불러오기 상태(로딩 / 데이터 없음 / 오류 / 데이터)에 맞는 자리를 그린다. 상태마다 그릴 것은 슬롯으로 받는다.
 * 쓸 때: 저장소에서 불러오는 목록·대화를 그릴 때 (PRD R0-6).
 * 쓰지 않을 때: 이미 손에 있는 데이터를 그릴 때 → 내용 컴포넌트를 바로 쓴다.
 * @example
 * <LoadStateView state={state} loading={<ListSkeleton />} empty={<FirstRecordGuide />} error={<ErrorState … />}>
 *   {(entries) => <DateGroupedList entries={entries} … />}
 * </LoadStateView>
 */
const LoadStateView = <T,>({
  state,
  loading,
  empty,
  error,
  children,
}: {
  state: ViewState<T>;
  loading: ReactNode;
  empty: ReactNode;
  error: ReactNode;
  children: (data: T) => ReactNode;
}) => {
  switch (state.status) {
    case "loading":
      return loading;
    case "empty":
      return empty;
    case "error":
      return error;
    case "data":
      return children(state.data);
  }
};

export { LoadStateView };
