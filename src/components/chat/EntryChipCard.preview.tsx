import { MOCK_ENTRY_MAP as map, MOCK_TIME_ZONE as tz } from "@/lib/mock/data";
import type { Variant } from "@/components/preview/variant";
import { EntryChipCard } from "./EntryChipCard";

const noop = () => {};
const actions = { onEdit: noop, onPick: noop, onUndo: noop };

const variants: Variant[] = [
  { name: "기록 한 건", render: () => <EntryChipCard entries={[map["e-poop-soft"]]} timeZone={tz} {...actions} /> },
  {
    name: "? 칸과 후보 칩 (R8)",
    render: () => (
      <EntryChipCard
        entries={[map["e-poop-unknown"]]}
        uncertain={[{ entryId: "e-poop-unknown", field: "stoolState", candidates: ["normal", "soft", "diarrhea"] }]}
        timeZone={tz}
        {...actions}
      />
    ),
  },
  {
    name: "여러 장",
    render: () => <EntryChipCard entries={[map["e-meal"], map["e-walk"]]} timeZone={tz} {...actions} />,
  },
  { name: "되돌림", render: () => <EntryChipCard entries={[map["e-28-walk"]]} undone timeZone={tz} {...actions} /> },
];

export { variants };
