import { MOCK_ENTRIES, MOCK_NOW, MOCK_TIME_ZONE } from "@/lib/mock/data";
import type { Variant } from "@/components/preview/variant";
import { ConversationSkeleton } from "@/components/chat/ConversationSkeleton";
import { Greeting } from "@/components/chat/Greeting";
import { DateGroupedList } from "@/components/entry/DateGroupedList";
import { FirstRecordGuide } from "@/components/entry/FirstRecordGuide";
import { ListSkeleton } from "@/components/entry/ListSkeleton";
import { ErrorState } from "./ErrorState";
import { LoadStateView } from "./LoadStateView";

type Status = "loading" | "empty" | "error" | "data";

const EntryList = ({ status }: { status: Status }) => (
  <LoadStateView
    state={status === "data" ? { status, data: MOCK_ENTRIES.slice(0, 3) } : { status }}
    loading={<ListSkeleton />}
    empty={<FirstRecordGuide nowIso={MOCK_NOW} timeZone={MOCK_TIME_ZONE} onLoadSample={() => {}} />}
    error={<ErrorState message="기록을 불러오지 못했어요" onRetry={() => {}} />}
  >
    {(entries) => <DateGroupedList entries={entries} nowIso={MOCK_NOW} timeZone={MOCK_TIME_ZONE} />}
  </LoadStateView>
);

const Chat = ({ status }: { status: Status }) => (
  <LoadStateView
    state={status === "data" ? { status, data: "대화" } : { status }}
    loading={<ConversationSkeleton />}
    empty={<Greeting />}
    error={<ErrorState message="대화를 불러오지 못했어요" onRetry={() => {}} />}
  >
    {() => (
      <p className="w-fit rounded-2xl rounded-bl-md bg-surface px-4 py-2.5 text-[15px]">초코의 배변을 기록했어요.</p>
    )}
  </LoadStateView>
);

const STATUSES: { status: Status; label: string }[] = [
  { status: "loading", label: "로딩" },
  { status: "empty", label: "데이터 없음" },
  { status: "error", label: "오류" },
  { status: "data", label: "데이터" },
];

const variants: Variant[] = [
  ...STATUSES.map(({ status, label }) => ({
    name: `기록 목록 · ${label}`,
    render: () => <EntryList status={status} />,
  })),
  ...STATUSES.map(({ status, label }) => ({ name: `채팅 · ${label}`, render: () => <Chat status={status} /> })),
];

export { variants };
