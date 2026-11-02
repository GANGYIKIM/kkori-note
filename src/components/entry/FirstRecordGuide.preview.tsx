import type { Variant } from "@/components/preview/variant";
import { FirstRecordGuide } from "./FirstRecordGuide";

const variants: Variant[] = [{ name: "기록 없음", render: () => <FirstRecordGuide onLoadSample={() => {}} /> }];

export { variants };
