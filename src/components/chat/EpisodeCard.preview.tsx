import { MOCK_ENTRY_MAP as map, MOCK_NOW, MOCK_TIME_ZONE as tz } from "@/lib/mock/data";
import type { Variant } from "@/components/preview/variant";
import { EpisodeCard } from "./EpisodeCard";

const variants: Variant[] = [
  {
    name: "여러 에피소드 (최신이 위)",
    render: () => (
      <EpisodeCard
        episodes={[map["e-seizure-today"], map["e-25-seizure"], map["e-thunder"]]}
        nowIso={MOCK_NOW}
        timeZone={tz}
      />
    ),
  },
  {
    name: "진행 중",
    render: () => (
      <EpisodeCard
        episodes={[{ ...map["e-seizure-today"], endedAt: null, durationSec: null }]}
        nowIso={MOCK_NOW}
        timeZone={tz}
      />
    ),
  },
];

export { variants };
