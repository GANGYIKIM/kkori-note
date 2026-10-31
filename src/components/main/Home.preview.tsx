import type { Variant } from "@/components/preview/variant";

const variants: Variant[] = [
  {
    name: "좁은 화면 (390px)",
    note: "화면 전체라 실제 메인(/)을 띄웠어요. 넓은 화면은 메인에서 창을 넓혀 확인해요.",
    render: () => <iframe src="/" title="메인 화면" className="h-[720px] w-full max-w-[390px] rounded-2xl" />,
  },
];

export { variants };
