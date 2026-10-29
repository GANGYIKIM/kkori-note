import { formatLocalTime, formatShortDate } from "@/lib/domain/datetime";
import { summarizeEntry } from "@/lib/domain/entry-summary";
import type { LogEntry } from "@/lib/domain/types";
import { KindTag } from "./KindTag";

/**
 * 메인 목록과 근거 카드에서 쓰는 기록 한 줄. 탭하면 칩 수정 시트를 연다.
 * showDate는 여러 날짜가 섞이는 근거 카드에서 쓴다.
 */
export function EntryRow({
  entry,
  timeZone,
  onSelect,
  compact = false,
  showDate = false,
}: {
  entry: LogEntry;
  timeZone: string;
  onSelect?: (entry: LogEntry) => void;
  compact?: boolean;
  showDate?: boolean;
}) {
  const parts = summarizeEntry(entry);
  const content = (
    <>
      <span className={`shrink-0 text-sm tabular-nums text-muted ${showDate ? "w-[76px]" : "w-11"}`}>
        {showDate ? `${formatShortDate(entry.occurredAt, timeZone)} ` : null}
        {formatLocalTime(entry.occurredAt, timeZone)}
        {entry.timeEstimated ? <span className="block text-[11px] leading-none">추정</span> : null}
      </span>
      <KindTag kind={entry.kind} />
      <span className="min-w-0 flex-1 truncate text-[15px]">
        {parts.length > 0 ? parts.join(" · ") : entry.kind === "poop" ? <span className="text-muted">상태 미입력</span> : null}
      </span>
      {entry.isDemo ? <span className="shrink-0 text-[11px] text-muted">샘플</span> : null}
    </>
  );

  const className = `flex w-full items-center gap-3 text-left ${compact ? "py-2" : "rounded-xl px-3 py-3"}`;

  if (!onSelect) return <div className={className}>{content}</div>;
  return (
    <button type="button" onClick={() => onSelect(entry)} className={`${className} hover:bg-surface active:bg-surface-strong`}>
      {content}
    </button>
  );
}
