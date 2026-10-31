import type { Variant } from "@/components/preview/variant";
import { EmptyState } from "./EmptyState";

const variants: Variant[] = [
  { name: "제목만", render: () => <EmptyState title="이 기간에 기록이 없어요" /> },
  {
    name: "설명 + 행동 (첫 기록 전, R0 · R10)",
    render: () => (
      <EmptyState
        title="아직 기록이 없어요"
        description={'아래 입력창에 이렇게 적어 보세요. "방금 배변했는데 무른 편이야"'}
        action={
          <span className="inline-block h-10 rounded-xl bg-accent/10 px-4 text-sm/10 font-bold text-accent">
            샘플 기록 불러오기
          </span>
        }
      />
    ),
  },
];

export { variants };
