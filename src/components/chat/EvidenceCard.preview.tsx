import { MOCK_ENTRIES, MOCK_ENTRY_MAP as map, MOCK_TIME_ZONE as tz } from "@/lib/mock/data";
import type { Variant } from "@/components/preview/variant";
import { EvidenceCard } from "./EvidenceCard";

const lastWeekPoops = MOCK_ENTRIES.filter((e) => e.kindId === "poop" && e.occurredAt >= "2026-10-22T15:00:00.000Z");

const variants: Variant[] = [
  {
    name: "5건 이상 (더 보기 · 더 넓게 보기)",
    render: () => (
      <EvidenceCard
        rangeLabel="최근 7일 · 10월 23일 ~ 29일"
        summary="배변 8건 · 딱딱함 1, 정상 3, 무름 3, 설사 1"
        entries={lastWeekPoops}
        canExpand
        timeZone={tz}
      />
    ),
  },
  {
    name: "4건 이하, 넓게 보기 없음",
    render: () => (
      <EvidenceCard
        rangeLabel="오늘"
        summary="식사 1건 · 산책 1건"
        entries={[map["e-meal"], map["e-walk"]]}
        canExpand={false}
        timeZone={tz}
      />
    ),
  },
  {
    name: "기록 없음",
    render: () => (
      <EvidenceCard rangeLabel="최근 3일 · 절뚝임" summary="절뚝임 0건" entries={[]} canExpand timeZone={tz} />
    ),
  },
];

export { variants };
