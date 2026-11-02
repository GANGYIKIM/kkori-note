import type { ReactNode } from "react";
import { ScrollArea } from "@/components/common/ScrollArea";

/**
 * 넓은 화면에서 본문 옆에 늘 열려 있는 패널. 제목 · 본문 · 하단(입력창 등)으로 나뉜다. 지금은 채팅에 쓴다 (PRD R0).
 * 좁은 화면의 BottomSheet와 같은 모양이고, 본문은 아래부터 쌓여 처음에 맨 아래가 보이고 맨 아래에 있을 때 내용이 늘면 따라간다.
 */
const SidePanel = ({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) => {
  return (
    <section aria-label={title} className="flex h-full min-h-0 flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <h2 className="font-bold">{title}</h2>
      </header>
      <ScrollArea className="flex-1" viewportClassName="flex flex-col-reverse py-4 pl-4 pr-0.5">
        <div>{children}</div>
      </ScrollArea>
      <div className="shrink-0 border-t border-border px-4 py-3">{footer}</div>
    </section>
  );
};

export { SidePanel };
