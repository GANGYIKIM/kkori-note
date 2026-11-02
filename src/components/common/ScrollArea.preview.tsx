import type { Variant } from "@/components/preview/variant";
import { ScrollArea } from "./ScrollArea";

const lines = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <p key={i} className="py-2 text-sm">
      {i + 1}번째 줄
    </p>
  ));

const variants: Variant[] = [
  {
    name: "긴 내용 (마우스를 올리거나 스크롤하면 막대가 보임)",
    render: () => (
      <ScrollArea className="h-60 rounded-xl border border-border" viewportClassName="px-4">
        {lines(30)}
      </ScrollArea>
    ),
  },
  {
    name: "짧은 내용 (막대 없음)",
    render: () => (
      <ScrollArea className="h-60 rounded-xl border border-border" viewportClassName="px-4">
        {lines(3)}
      </ScrollArea>
    ),
  },
  {
    name: "아래부터 쌓임 (flex-col-reverse, 처음에 맨 아래)",
    render: () => (
      <ScrollArea className="h-60 rounded-xl border border-border" viewportClassName="flex flex-col-reverse px-4">
        <div>{lines(30)}</div>
      </ScrollArea>
    ),
  },
];

export { variants };
