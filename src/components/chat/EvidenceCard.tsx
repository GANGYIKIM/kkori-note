"use client";

import { useState } from "react";
import { formatLocalTime, formatShortDate } from "@/lib/domain/datetime";
import { summarizeEntry } from "@/lib/domain/entry-summary";
import type { LogEntry } from "@/lib/domain/types";
import { KIND_STYLES, LABELS } from "@/lib/domain/values";
import { ListRow } from "@/components/common/ListRow";
import { Tag } from "@/components/common/Tag";

const PREVIEW_COUNT = 4;

/** 상담 근거 기록 카드. 범위·건수·목록은 코드가 만들고 LLM은 이 카드를 근거로 해석만 쓴다 (PRD R4) */
const EvidenceCard = ({
  rangeLabel,
  summary,
  entries,
  canExpand,
  timeZone,
  onSelect,
  onExpand,
}: {
  rangeLabel: string;
  summary: string;
  entries: readonly LogEntry[];
  canExpand: boolean;
  timeZone: string;
  onSelect?: (entry: LogEntry) => void;
  onExpand?: () => void;
}) => {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const visible = showAll ? sorted : sorted.slice(0, PREVIEW_COUNT);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="border-b border-border px-3 py-2.5">
        <p className="text-xs text-muted">살펴본 기록 · {rangeLabel}</p>
        <p className="mt-0.5 text-[15px] font-bold">{summary}</p>
      </div>
      {entries.length === 0 ? (
        <p className="p-3 text-sm text-muted">이 기간에 기록이 없어요.</p>
      ) : (
        <ul className="px-3">
          {visible.map((entry) => (
            <li key={entry.id}>
              <ListRow
                time={
                  <>
                    {formatShortDate(entry.occurredAt, timeZone)} {formatLocalTime(entry.occurredAt, timeZone)}
                    {entry.timeEstimated ? <span className="block text-[11px] leading-none">추정</span> : null}
                  </>
                }
                tag={<Tag className={KIND_STYLES[entry.kind].tag}>{LABELS.entryKind[entry.kind]}</Tag>}
                trailing={entry.isDemo ? "샘플" : null}
                onClick={onSelect ? () => onSelect(entry) : undefined}
                compact
                wideTime
              >
                {summarizeEntry(entry).join(" · ") ||
                  (entry.kind === "poop" ? <span className="text-muted">상태 미입력</span> : null)}
              </ListRow>
            </li>
          ))}
        </ul>
      )}
      <div className="flex border-t border-border text-sm">
        {sorted.length > PREVIEW_COUNT ? (
          <button type="button" onClick={() => setShowAll((v) => !v)} className="flex-1 py-2.5 text-muted">
            {showAll ? "접기" : `${sorted.length - PREVIEW_COUNT}건 더 보기`}
          </button>
        ) : null}
        {canExpand ? (
          <button type="button" onClick={onExpand} className="flex-1 py-2.5 font-bold text-accent">
            더 넓게 보기
          </button>
        ) : null}
      </div>
    </div>
  );
};

export { EvidenceCard };
