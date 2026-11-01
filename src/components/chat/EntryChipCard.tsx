import type { ReactNode } from "react";
import { formatLocalTime } from "@/lib/domain/datetime";
import { summarizeEntry } from "@/lib/domain/entry-summary";
import type { LogEntry, UncertainField } from "@/lib/domain/types";
import { fieldLabel, findKind, kindLabel, optionLabel } from "@/lib/domain/kinds";
import { kindStyle } from "@/lib/domain/values";
import { CheckCircleIcon, UndoIcon } from "@/components/common/Icons";
import { Tag } from "@/components/common/Tag";

const COMMON_FIELD_LABELS: Record<string, string> = {
  kindId: "종류",
  occurredAt: "시각",
  durationSec: "지속시간",
};

const uncertainLabel = (entry: LogEntry, field: string): string => {
  return COMMON_FIELD_LABELS[field] ?? fieldLabel(findKind(entry.kindId), field);
};

/** 후보 값을 화면 라벨로. 값 목록이 있는 칸은 정의의 라벨을 쓴다 */
const candidateLabel = (entry: LogEntry, field: string, value: string): string => {
  if (field === "kindId") return kindLabel(value);
  return optionLabel(findKind(entry.kindId), field, value);
};

/** 아직 비어 있는 칸만 `?`로 보여준다. 사용자가 채운 칸은 일반 칩이 된다 */
const isStillEmpty = (entry: LogEntry, field: string): boolean => {
  if (field === "occurredAt" || field === "kindId") return false;
  if (field === "durationSec") return entry.durationSec === null;
  return entry.values[field] === undefined;
};

/** 저장된 기록의 칩 카드 (PRD R1). 칩은 즉시 저장되고, 칸을 탭해 고치거나 되돌린다 */
const EntryChipCard = ({
  entries,
  uncertain = [],
  undone = false,
  timeZone,
  onEdit,
  onPick,
  onUndo,
}: {
  entries: readonly LogEntry[];
  uncertain?: readonly UncertainField[];
  undone?: boolean;
  timeZone: string;
  onEdit?: (entry: LogEntry) => void;
  onPick?: (entryId: string, field: UncertainField["field"], value: string) => void;
  onUndo?: (entryIds: string[]) => void;
}) => {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-background ${undone ? "opacity-60" : ""}`}>
      <ul className="divide-y divide-border">
        {entries.map((entry) => {
          const open = uncertain.filter((u) => u.entryId === entry.id && isStillEmpty(entry, u.field));
          return (
            <li key={entry.id} className="space-y-2 p-3">
              <button
                type="button"
                disabled={undone || !onEdit}
                onClick={() => onEdit?.(entry)}
                className="flex w-full flex-wrap items-center gap-1.5 text-left"
              >
                <Tag className={kindStyle(entry.kindId).tag}>{kindLabel(entry.kindId)}</Tag>
                <Chip>
                  {formatLocalTime(entry.occurredAt, timeZone)}
                  {entry.timePrecision === "estimated" ? <span className="ml-1 text-muted">추정</span> : null}
                </Chip>
                {summarizeEntry(entry).map((part) => (
                  <Chip key={part}>{part}</Chip>
                ))}
                {open.map((u) => (
                  <span
                    key={u.field}
                    className="inline-flex h-7 items-center rounded-lg border border-dashed border-accent px-2 text-sm font-bold text-accent"
                  >
                    ? {uncertainLabel(entry, u.field)}
                  </span>
                ))}
              </button>

              {!undone &&
                open.map((u) => (
                  <div key={u.field} className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted">{uncertainLabel(entry, u.field)}:</span>
                    {u.candidates.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => onPick?.(entry.id, u.field, value)}
                        className="h-7 rounded-full bg-accent/10 px-3 text-sm font-bold text-accent"
                      >
                        {candidateLabel(entry, u.field, value)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => onEdit?.(entry)}
                      className="h-7 rounded-full border border-border px-3 text-sm text-muted"
                    >
                      직접 입력
                    </button>
                  </div>
                ))}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between bg-surface px-3 py-2 text-xs text-muted">
        {undone ? (
          <span>기록을 되돌렸어요</span>
        ) : (
          <>
            <span className="inline-flex items-center gap-1">
              <CheckCircleIcon width={14} height={14} className="text-success" />
              저장됨 · 칩을 눌러 고칠 수 있어요
            </span>
            <button
              type="button"
              onClick={() => onUndo?.(entries.map((e) => e.id))}
              className="inline-flex items-center gap-1 font-bold text-foreground"
            >
              <UndoIcon width={14} height={14} />
              되돌리기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Chip = ({ children }: { children: ReactNode }) => {
  return <span className="inline-flex h-7 items-center rounded-lg bg-surface px-2 text-sm">{children}</span>;
};

export { EntryChipCard };
