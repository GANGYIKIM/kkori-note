import type { Variant } from "@/components/preview/variant";
import { UnitInput } from "./UnitInput";

const variants: Variant[] = [
  { name: "빈칸 (범위 표시)", render: () => <UnitInput unit="kg" inputMode="decimal" placeholder="0.1~120" /> },
  { name: "값 있음", render: () => <UnitInput unit="회" inputMode="numeric" defaultValue="2" /> },
];

export { variants };
