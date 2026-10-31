"use client";

import { useState, type ReactNode } from "react";
import { formatLocalTime, localDateKey } from "@/lib/domain/datetime";
import type { LogEntry } from "@/lib/domain/types";
import {
  CHOCOLATE_TYPES,
  ENTRY_KINDS,
  INTENSITIES,
  LABELS,
  RISK_FOODS,
  STOOL_STATES,
  isEpisodeKind,
} from "@/lib/domain/values";
import { BottomSheet } from "./BottomSheet";

const DETAIL_PLACEHOLDER: Partial<Record<LogEntry["kind"], string>> = {
  meal: "예: 사료 반 컵",
  snack: "예: 닭가슴살 육포",
  walk: "예: 다른 강아지랑 잘 놀았어",
  picked_up: "예: 휴지 조각",
  limp: "예: 왼쪽 뒷다리",
  note: "메모",
};

/** 기록 한 건의 칸을 고치는 폼. 칸은 값 목록에서만 고른다 (CLAUDE.md 규칙 4) */
const EntryEditForm = ({
  entry,
  timeZone,
  onChange,
}: {
  entry: LogEntry;
  timeZone: string;
  onChange: (entry: LogEntry) => void;
}) => {
  const set = (patch: Partial<LogEntry>) => onChange({ ...entry, ...patch });
  const minutes = entry.durationSec === null ? "" : String(Math.round(entry.durationSec / 60));

  return (
    <div className="space-y-5">
      <Field label="종류">
        <Options
          values={ENTRY_KINDS}
          labels={LABELS.entryKind}
          selected={entry.kind}
          onSelect={(kind) => set({ kind })}
        />
      </Field>

      <Field label={entry.timeEstimated ? "시각 (추정)" : "시각"}>
        <input
          type="datetime-local"
          value={`${localDateKey(entry.occurredAt, timeZone)}T${formatLocalTime(entry.occurredAt, timeZone)}`}
          onChange={(e) => {
            const date = new Date(e.target.value);
            if (!Number.isNaN(date.getTime())) set({ occurredAt: date.toISOString(), timeEstimated: false });
          }}
          className="h-11 w-full rounded-lg border border-border bg-background px-3"
        />
      </Field>

      {entry.kind === "poop" ? (
        <Field label="상태">
          <Options
            values={STOOL_STATES}
            labels={LABELS.stoolState}
            selected={entry.stoolState}
            onSelect={(stoolState) => set({ stoolState })}
          />
        </Field>
      ) : null}

      {isEpisodeKind(entry.kind) ? (
        <Field label="강도">
          <Options
            values={INTENSITIES}
            labels={LABELS.intensity}
            selected={entry.intensity}
            onSelect={(intensity) => set({ intensity })}
          />
        </Field>
      ) : null}

      {isEpisodeKind(entry.kind) || entry.kind === "walk" ? (
        <Field label="지속시간 (분)">
          <input
            inputMode="numeric"
            value={minutes}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              set({ durationSec: Number.isFinite(n) && n >= 0 ? n * 60 : null });
            }}
            placeholder="모름"
            className="h-11 w-full rounded-lg border border-border bg-background px-3"
          />
        </Field>
      ) : null}

      {entry.kind === "picked_up" ? (
        <>
          <Field label="위험 음식">
            <Options
              values={RISK_FOODS}
              labels={LABELS.riskFood}
              selected={entry.riskFood}
              onSelect={(riskFood) => set({ riskFood: riskFood === entry.riskFood ? null : riskFood })}
            />
          </Field>
          {entry.riskFood === "chocolate" ? (
            <Field label="초콜릿 종류">
              <Options
                values={CHOCOLATE_TYPES}
                labels={LABELS.chocolateType}
                selected={entry.chocolateType}
                onSelect={(chocolateType) => set({ chocolateType })}
              />
            </Field>
          ) : null}
          {entry.riskFood ? (
            <Field label="먹은 양 (g)">
              <input
                inputMode="decimal"
                value={entry.amountG ?? ""}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  set({ amountG: e.target.value.trim() === "" || !Number.isFinite(n) ? null : n });
                }}
                placeholder="모름"
                className="h-11 w-full rounded-lg border border-border bg-background px-3"
              />
            </Field>
          ) : null}
        </>
      ) : null}

      {DETAIL_PLACEHOLDER[entry.kind] ? (
        <Field label="내용">
          <input
            value={entry.detail ?? ""}
            onChange={(e) => set({ detail: e.target.value || null })}
            placeholder={DETAIL_PLACEHOLDER[entry.kind]}
            maxLength={200}
            className="h-11 w-full rounded-lg border border-border bg-background px-3"
          />
        </Field>
      ) : null}

      {entry.rawText ? (
        <p className="rounded-lg bg-surface px-3 py-2 text-sm text-muted">원문: “{entry.rawText}”</p>
      ) : null}
    </div>
  );
};

/** 기록을 탭하면 열리는 칩 수정 시트 (PRD R0) */
const EntryEditSheet = ({
  entry,
  timeZone,
  onClose,
  onSave,
  onDelete,
}: {
  entry: LogEntry | null;
  timeZone: string;
  onClose: () => void;
  onSave: (entry: LogEntry) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <BottomSheet open={entry !== null} title="기록 고치기" onClose={onClose}>
      {/* key로 기록이 바뀔 때마다 초안을 새로 만든다 */}
      {entry ? <EditBody key={entry.id} entry={entry} timeZone={timeZone} onSave={onSave} onDelete={onDelete} /> : null}
    </BottomSheet>
  );
};

const EditBody = ({
  entry,
  timeZone,
  onSave,
  onDelete,
}: {
  entry: LogEntry;
  timeZone: string;
  onSave: (entry: LogEntry) => void;
  onDelete: (id: string) => void;
}) => {
  const [draft, setDraft] = useState(entry);
  return (
    <div className="space-y-6">
      <EntryEditForm entry={draft} timeZone={timeZone} onChange={setDraft} />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="h-12 flex-1 rounded-xl bg-danger/10 font-bold text-danger"
        >
          삭제
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="h-12 flex-2 rounded-xl bg-accent font-bold text-accent-foreground"
        >
          완료
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-muted">{label}</p>
      {children}
    </div>
  );
};

const Options = <T extends string>({
  values,
  labels,
  selected,
  onSelect,
}: {
  values: readonly T[];
  labels: Record<T, string>;
  selected: T | null;
  onSelect: (value: T) => void;
}) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={selected === value}
          onClick={() => onSelect(value)}
          className={`h-9 rounded-full px-3.5 text-sm ${
            selected === value ? "bg-accent font-bold text-accent-foreground" : "bg-surface text-foreground"
          }`}
        >
          {labels[value]}
        </button>
      ))}
    </div>
  );
};

export { EntryEditForm, EntryEditSheet };
