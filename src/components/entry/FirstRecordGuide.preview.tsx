import type { Variant } from "@/components/preview/variant";
import { MOCK_NOW, MOCK_TIME_ZONE } from "@/lib/mock/data";
import { FirstRecordGuide } from "./FirstRecordGuide";

const variants: Variant[] = [
  {
    name: "기록 없음",
    render: () => <FirstRecordGuide nowIso={MOCK_NOW} timeZone={MOCK_TIME_ZONE} onLoadSample={() => {}} />,
  },
  { name: "샘플 버튼 없음", render: () => <FirstRecordGuide nowIso={MOCK_NOW} timeZone={MOCK_TIME_ZONE} /> },
];

export { variants };
