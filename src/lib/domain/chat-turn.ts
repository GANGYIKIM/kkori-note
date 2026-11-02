import { startOfLocalDay } from "./datetime";
import type { EntryDraft } from "./extract-entries";
import { checkValues, findKind, type EntryValues } from "./kinds";
import type { ChatTurn } from "./types";

/**
 * LLM이 고른 기록을 종류 정의로 걸러 기록 초안으로 바꾼다 (demo 브랜치).
 * 정의에 없는 종류는 버리고, 맞지 않는 값은 그 칸만 비운다.
 */
const toDrafts = (
  entries: ChatTurn["entries"],
  { nowIso, timeZone, rawText }: { nowIso: string; timeZone: string; rawText: string },
): EntryDraft[] => {
  return entries.flatMap((raw) => {
    const kind = findKind(raw.kindId);
    if (!kind) return [];

    const checked = checkValues(kind, raw.values);
    const values: EntryValues = checked.ok
      ? { ...raw.values }
      : Object.fromEntries(Object.entries(raw.values).filter(([id]) => !checked.invalidFieldIds.includes(id)));
    for (const field of kind.fields) {
      if (field.type === "number" && field.defaultValue !== undefined && values[field.id] === undefined) {
        values[field.id] = field.defaultValue;
      }
    }

    const parsed = Date.parse(raw.occurredAt);
    const valid = Number.isFinite(parsed);
    const iso = valid ? new Date(parsed).toISOString() : new Date(nowIso).toISOString();
    const timePrecision = valid ? raw.timePrecision : "estimated";
    const durationSec =
      kind.episode && raw.durationSec !== null && raw.durationSec >= 0 ? Math.round(raw.durationSec) : null;

    return [
      {
        kindId: kind.id,
        values,
        occurredAt: timePrecision === "day" ? startOfLocalDay(iso, timeZone) : iso,
        timePrecision,
        durationSec,
        todayOnly: timePrecision === "day",
        rawText,
      },
    ];
  });
};

export { toDrafts };
