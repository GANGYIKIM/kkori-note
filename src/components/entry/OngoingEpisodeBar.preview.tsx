import { MOCK_ENTRY_MAP as map, MOCK_NOW } from "@/lib/mock/data";
import type { Variant } from "@/components/preview/variant";
import { OngoingEpisodeBar } from "./OngoingEpisodeBar";

const openLimp = {
  ...map["e-27-limp"],
  id: "limp-open",
  endedAt: null,
  durationSec: null,
  occurredAt: "2026-10-29T02:20:00.000Z",
};

const variants: Variant[] = [
  {
    name: "진행 중 2개",
    render: () => <OngoingEpisodeBar episodes={[map["e-thunder"], openLimp]} nowIso={MOCK_NOW} onClose={() => {}} />,
  },
  { name: "진행 중 없음 (그리지 않음)", render: () => <OngoingEpisodeBar episodes={[]} nowIso={MOCK_NOW} /> },
];

export { variants };
