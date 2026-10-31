"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 넓은 화면에서 본문 옆에 늘 열려 있는 패널. 제목 · 본문 · 하단(입력창 등)으로 나뉜다. 지금은 채팅에 쓴다 (PRD R0).
 * 좁은 화면의 BottomSheet와 같은 모양이고, 내용이 늘면 맨 아래로 내린다.
 */
const SidePanel = ({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [children]);

  return (
    <section aria-label={title} className="flex h-full min-h-0 flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <h2 className="font-bold">{title}</h2>
      </header>
      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto p-4">
        {children}
      </div>
      <div className="shrink-0 border-t border-border px-4 py-3">{footer}</div>
    </section>
  );
};

export { SidePanel };
