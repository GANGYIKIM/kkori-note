"use client";

import { useState, type ReactNode } from "react";
import { formatLocalTime, localDateKey } from "@/lib/domain/datetime";
import type { LogEntry } from "@/lib/domain/types";
import { DEFAULT_KINDS, findKind, type EntryValues, type FieldDef, type Option } from "@/lib/domain/kinds";
import { BottomSheet } from "@/components/layout/BottomSheet";

const DETAIL_PLACEHOLDER: Record<string, string> = {
  meal: "예: 사료 반 컵",
  snack: "예: 닭가슴살 육포",
  walk: "예: 다른 강아지랑 잘 놀았어",
  picked_up: "예: 휴지 조각",
  limp: "예: 왼쪽 뒷다리",
  note: "메모",
};

const KIND_OPTIONS: Option[] = DEFAULT_KINDS.map((k) => ({ id: k.id, label: k.label }));

/** 초콜릿 종류는 초콜릿일 때만, 양은 위험 음식을 골랐을 때만 묻는다 */
const isHidden = (field: FieldDef, values: EntryValues): boolean => {
  if (field.id === "chocolateType") return values.riskFood !== "chocolate";
  if (field.id === "amountG") return values.riskFood === undefined;
  return false;
};

/** 저장할 때 지금 종류에서 보이는 칸의 값만 남긴다 */
const visibleValues = (entry: LogEntry): LogEntry => {
  const fields = (findKind(entry.kindId)?.fields ?? []).filter((f) => !isHidden(f, entry.values));
  const kept = Object.entries(entry.values).filter(([fieldId]) => fields.some((f) => f.id === fieldId));
  return { ...entry, values: Object.fromEntries(kept) };
};

/**
 * 기록 한 건의 칸을 고치는 폼. 칸과 값 목록은 종류 정의에서 읽는다 (CLAUDE.md 규칙 4, ADR-0012).
 * 폼이 열려 있는 동안 값은 종류마다 따로 보관한다. 다른 종류로 갔다가 돌아오면 그 종류에서 고른 값이 다시 보인다.
 */
const EditForm = ({
  entry,
  timeZone,
  onChange,
}: {
  entry: LogEntry;
  timeZone: string;
  onChange: (entry: LogEntry) => void;
}) => {
  const [valuesByKind, setValuesByKind] = useState<Record<string, EntryValues>>({});
  const set = (patch: Partial<LogEntry>) => onChange({ ...entry, ...patch });
  const changeKind = (kindId: string) => {
    if (kindId === entry.kindId) return;
    setValuesByKind((saved) => ({ ...saved, [entry.kindId]: entry.values }));
    set({ kindId, values: valuesByKind[kindId] ?? {} });
  };
  const setValue = (fieldId: string, value: string | number | undefined) => {
    const rest = Object.fromEntries(Object.entries(entry.values).filter(([id]) => id !== fieldId));
    set({ values: value === undefined ? rest : { ...rest, [fieldId]: value } });
  };
  const kind = findKind(entry.kindId);
  const fields = (kind?.fields ?? []).filter((f) => !isHidden(f, entry.values));
  const minutes = entry.durationSec === null ? "" : String(Math.round(entry.durationSec / 60));

  return (
    <div className="space-y-5">
      <Field label="종류">
        <Options options={KIND_OPTIONS} selected={entry.kindId} onSelect={changeKind} />
      </Field>

      <Field label={entry.timePrecision === "estimated" ? "시각 (추정)" : "시각"}>
        <input
          type="datetime-local"
          value={`${localDateKey(entry.occurredAt, timeZone)}T${formatLocalTime(entry.occurredAt, timeZone)}`}
          onChange={(e) => {
            const date = new Date(e.target.value);
            if (!Number.isNaN(date.getTime())) set({ occurredAt: date.toISOString(), timePrecision: "exact" });
          }}
          className="h-11 w-full rounded-lg border border-border bg-background px-3"
        />
      </Field>

      {fields
        .filter((f) => f.type !== "text")
        .map((field) => (
          <ValueField key={field.id} field={field} value={entry.values[field.id]} onChange={setValue} />
        ))}

      {kind?.episode || entry.kindId === "walk" ? (
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

      {fields
        .filter((f) => f.type === "text")
        .map((field) => (
          <ValueField
            key={field.id}
            field={field}
            value={entry.values[field.id]}
            placeholder={DETAIL_PLACEHOLDER[entry.kindId]}
            onChange={setValue}
          />
        ))}

      {entry.rawText ? (
        <p className="rounded-lg bg-surface px-3 py-2 text-sm text-muted">원문: “{entry.rawText}”</p>
      ) : null}
    </div>
  );
};

const ValueField = ({
  field,
  value,
  placeholder,
  onChange,
}: {
  field: FieldDef;
  value: string | number | undefined;
  placeholder?: string;
  onChange: (fieldId: string, value: string | number | undefined) => void;
}) => {
  switch (field.type) {
    case "choice":
      return (
        <Field label={field.label}>
          <Options
            options={field.options}
            selected={typeof value === "string" ? value : null}
            onSelect={(id) => onChange(field.id, id === value ? undefined : id)}
          />
        </Field>
      );
    case "number":
      return (
        <Field label={`${field.label} (${field.unit})`}>
          <input
            inputMode={field.integer ? "numeric" : "decimal"}
            value={value ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange(field.id, e.target.value.trim() === "" || !Number.isFinite(n) ? undefined : n);
            }}
            placeholder="모름"
            className="h-11 w-full rounded-lg border border-border bg-background px-3"
          />
        </Field>
      );
    case "text":
      return (
        <Field label={field.label}>
          <input
            value={value ?? ""}
            onChange={(e) => onChange(field.id, e.target.value || undefined)}
            placeholder={placeholder}
            maxLength={field.maxLength}
            className="h-11 w-full rounded-lg border border-border bg-background px-3"
          />
        </Field>
      );
  }
};

/** 기록을 탭하면 열리는 칩 수정 시트. 삭제·완료 버튼은 시트 하단에 고정한다 (PRD R0) */
const EditSheet = ({
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
  // key로 기록이 바뀔 때마다 초안을 새로 만든다
  return entry ? (
    <EditBody key={entry.id} entry={entry} timeZone={timeZone} onClose={onClose} onSave={onSave} onDelete={onDelete} />
  ) : null;
};

const EditBody = ({
  entry,
  timeZone,
  onClose,
  onSave,
  onDelete,
}: {
  entry: LogEntry;
  timeZone: string;
  onClose: () => void;
  onSave: (entry: LogEntry) => void;
  onDelete: (id: string) => void;
}) => {
  const [draft, setDraft] = useState(entry);
  return (
    <BottomSheet
      open
      title="기록 고치기"
      onClose={onClose}
      footer={
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
            onClick={() => onSave(visibleValues(draft))}
            className="h-12 flex-2 rounded-xl bg-accent font-bold text-accent-foreground"
          >
            완료
          </button>
        </div>
      }
    >
      <EditForm entry={draft} timeZone={timeZone} onChange={setDraft} />
    </BottomSheet>
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

const Options = ({
  options,
  selected,
  onSelect,
}: {
  options: readonly Option[];
  selected: string | null;
  onSelect: (id: string) => void;
}) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={selected === option.id}
          onClick={() => onSelect(option.id)}
          className={`h-9 rounded-full px-3.5 text-sm ${
            selected === option.id ? "bg-accent font-bold text-accent-foreground" : "bg-surface text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export { EditForm, EditSheet };
