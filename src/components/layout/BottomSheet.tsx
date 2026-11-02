"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "@/components/common/Icons";
import { ScrollArea } from "@/components/common/ScrollArea";

/**
 * 아래에서 올라오는 시트. full이면 화면 전체(채팅)를 덮고 안쪽 내용은 화면 폭의 92%, 아니면 내용 높이만큼·최대 448px(칩 수정).
 * stickToBottom이면 본문이 아래부터 쌓여 열 때 맨 아래가 보이고, 맨 아래에 있을 때 내용이 늘면 따라간다(채팅의 최근 대화). 열려 있는 동안 뒤 문서는 스크롤되지 않는다.
 * className은 바깥 틀에 붙는다(예: 넓은 화면에서 숨기기).
 */
const BottomSheet = ({
  open,
  title,
  onClose,
  full = false,
  stickToBottom = false,
  className = "",
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  full?: boolean;
  stickToBottom?: boolean;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div
        className={`relative mt-auto flex w-full flex-col bg-background shadow-xl ${
          full ? "h-dvh" : "max-h-[85dvh] max-w-md rounded-t-[20px]"
        }`}
      >
        <header
          className={`flex h-14 shrink-0 items-center justify-between border-b border-border ${full ? "px-[4%]" : "px-4"}`}
        >
          <h2 className="font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="-mr-2 p-2 text-muted">
            <CloseIcon />
          </button>
        </header>
        <ScrollArea
          className="flex-1"
          viewportClassName={`py-4 ${full ? "pr-[max(0px,calc(4%-0.875rem))] pl-[4%]" : "pr-0.5 pl-4"} ${
            stickToBottom ? "flex flex-col-reverse" : ""
          }`}
        >
          <div>{children}</div>
        </ScrollArea>
        {footer ? (
          <div className={`shrink-0 border-t border-border py-3 ${full ? "px-[4%]" : "px-4"}`}>{footer}</div>
        ) : null}
      </div>
    </div>
  );
};

export { BottomSheet };
