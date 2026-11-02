import { formatLocalTime } from "@/lib/domain/datetime";
import type { EntryDraft } from "@/lib/domain/extract-entries";
import type { ExpectedEntry } from "./parse-cases";

const matchesEntry = (expected: ExpectedEntry, draft: EntryDraft, timeZone: string): boolean => {
  if (expected.kindId !== draft.kindId) return false;
  for (const [fieldId, value] of Object.entries(expected.values ?? {})) {
    if (draft.values[fieldId] !== value) return false;
  }
  if (expected.time === "day" && draft.timePrecision !== "day") return false;
  if (expected.time !== undefined && expected.time !== "day") {
    if (draft.timePrecision === "day" || formatLocalTime(draft.occurredAt, timeZone) !== expected.time) return false;
  }
  if (expected.durationSec !== undefined && draft.durationSec !== expected.durationSec) return false;
  return true;
};

/** 기록 개수가 같고, 정답 기록마다 아직 짝이 없는 기록 중 맞는 것이 있으면 정답 */
const scoreCase = (expected: ExpectedEntry[], drafts: EntryDraft[], timeZone: string): boolean => {
  if (expected.length !== drafts.length) return false;
  const unmatched = [...drafts];
  for (const entry of expected) {
    const at = unmatched.findIndex((draft) => matchesEntry(entry, draft, timeZone));
    if (at === -1) return false;
    unmatched.splice(at, 1);
  }
  return true;
};

export { scoreCase };
