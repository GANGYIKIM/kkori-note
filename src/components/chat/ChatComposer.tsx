"use client";

import { useState, type FormEvent } from "react";
import { SendIcon } from "../Icons";

export const COMPOSER_PLACEHOLDER = "기록하거나 물어보세요";

/** 채팅 입력창. 보내면 onSend로 문장을 넘긴다 */
export function ChatComposer({ onSend, autoFocus = false }: { onSend: (text: string) => void; autoFocus?: boolean }) {
  const [text, setText] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={COMPOSER_PLACEHOLDER}
        maxLength={500}
        autoFocus={autoFocus}
        aria-label="메시지"
        className="h-11 min-w-0 flex-1 rounded-full bg-surface px-4 text-[15px] outline-none placeholder:text-muted focus:ring-2 focus:ring-accent/40"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        aria-label="보내기"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground disabled:opacity-40"
      >
        <SendIcon />
      </button>
    </form>
  );
}

/** 메인 화면 아래의 입력창 모양 버튼. 누르면 채팅이 열린다 (PRD R0) */
export function ChatLauncher({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-11 w-full items-center gap-2 rounded-full bg-surface pr-1 pl-4 text-left text-[15px] text-muted"
    >
      <span className="flex-1">{COMPOSER_PLACEHOLDER}</span>
      <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <SendIcon width={18} height={18} />
      </span>
    </button>
  );
}
