import { MOCK_DOG } from "@/lib/mock/data";
import type { Variant } from "@/components/preview/variant";
import { AppHeader } from "./AppHeader";

const variants: Variant[] = [
  { name: "강아지 이름 있음", render: () => <AppHeader dogName={MOCK_DOG.name} /> },
  { name: "이름 없음 (프로필 전)", render: () => <AppHeader dogName={null} /> },
];

export { variants };
