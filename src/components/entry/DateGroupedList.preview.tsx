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
    name: "하루 전체 기록 (종일, 그날 맨 아래)",
    render: () => (
      <DateGroupedList
        entries={[
          {
            ...map["e-poop-soft"],
            id: "day-poop",
            occurredAt: "2026-10-28T15:00:00.000Z",
            timePrecision: "day",
            values: { count: 3 },
          },
          map["e-meal"],
          map["e-poop-soft"],
        ]}
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
