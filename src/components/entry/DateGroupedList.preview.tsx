import { MOCK_ENTRIES, MOCK_ENTRY_MAP as map, MOCK_NOW, MOCK_TIME_ZONE as tz } from "@/lib/mock/data";
import type { Variant } from "@/components/preview/variant";
import { DateGroupedList } from "./DateGroupedList";

const variants: Variant[] = [
  {
    name: "오늘 · 추정 시각 · 상태 미입력 · 샘플",
    render: () => (
      <DateGroupedList
        entries={[map["e-poop-soft"], map["e-meal"], map["e-poop-unknown"], { ...map["e-28-walk"], isDemo: true }]}
        nowIso={MOCK_NOW}
        timeZone={tz}
        onSelect={() => {}}
      />
    ),
  },
  {
    name: "여러 날",
    render: () => (
      <DateGroupedList entries={MOCK_ENTRIES.slice(8, 15)} nowIso={MOCK_NOW} timeZone={tz} onSelect={() => {}} />
    ),
  },
];

export { variants };
