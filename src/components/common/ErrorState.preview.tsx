import type { Variant } from "@/components/preview/variant";
import { ErrorState } from "./ErrorState";

const variants: Variant[] = [
  { name: "기록 목록", render: () => <ErrorState message="기록을 불러오지 못했어요" onRetry={() => {}} /> },
  { name: "대화", render: () => <ErrorState message="대화를 불러오지 못했어요" onRetry={() => {}} /> },
];

export { variants };
