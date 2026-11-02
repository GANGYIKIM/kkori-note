import { findKind, findField, isEpisodeKind, missingCoreFields, type EntryValues } from "./kinds";
import { DOG_PARTICLES, findKinds, findValues, overlapsLexicon } from "./lexicon";
import { parseDuration, parseTime } from "./time-parse";
import type { TimePrecision } from "./values";

/**
 * 기록 메시지를 사전과 시각 파서로 기록 초안으로 나눈다 (PRD R1-4, R1-8, R1-10).
 * 채우지 못한 칸은 reasons로 돌려주고, LLM 호출 여부는 부르는 쪽이 정한다.
 */

interface EntryDraft {
  kindId: string;
  values: EntryValues;
  occurredAt: string;
  timePrecision: TimePrecision;
  durationSec: number | null;
  /** 시각 없이 "오늘"만 있어 하루 전체로 둔 기록 */
  todayOnly: boolean;
  rawText: string;
}

type LlmReason =
  | { type: "noKind" }
  | { type: "time" }
  | { type: "missingCore"; kindId: string; fieldId: string }
  | { type: "ambiguousValue"; fieldId: string };

interface ExtractResult {
  drafts: EntryDraft[];
  reasons: LlmReason[];
  needsLlm: boolean;
}

/** 이름이 사전 표현과 겹칠 때, 강아지를 가리키는 이름(뒤에 조사)만 공백으로 지운다 */
const maskDogName = (text: string, dogName: string): string => {
  if (dogName === "" || !overlapsLexicon(dogName)) return text;
  let masked = text;
  let from = 0;
  for (let at = masked.indexOf(dogName, from); at !== -1; at = masked.indexOf(dogName, from)) {
    const after = masked.slice(at + dogName.length);
    if (DOG_PARTICLES.some((p) => after.startsWith(p))) {
      masked = masked.slice(0, at) + " ".repeat(dogName.length) + after;
    }
    from = at + dogName.length;
  }
  return masked;
};

const extractEntries = (
  text: string,
  { nowIso, timeZone, dogName }: { nowIso: string; timeZone: string; dogName: string },
): ExtractResult => {
  const masked = maskDogName(text, dogName);
  const kindIds = [...new Set(findKinds(masked).map((h) => h.kindId))];
  if (kindIds.length === 0) return { drafts: [], reasons: [{ type: "noKind" }], needsLlm: true };

  const reasons: LlmReason[] = [];
  const episodeKindIds = kindIds.filter(isEpisodeKind);
  const duration = episodeKindIds.length > 0 ? parseDuration(masked) : null;
  const time = parseTime(duration?.rest ?? masked, nowIso, timeZone);
  const occurred =
    time.status === "found"
      ? time
      : { occurredAt: new Date(nowIso).toISOString(), timePrecision: "exact" as const, todayOnly: false };
  if (time.status === "unknown") {
    occurred.timePrecision = "estimated";
    reasons.push({ type: "time" });
  }

  const drafts: EntryDraft[] = kindIds.map((kindId) => ({
    kindId,
    values: {},
    occurredAt: occurred.occurredAt,
    timePrecision: occurred.timePrecision,
    durationSec: duration && episodeKindIds.length === 1 && isEpisodeKind(kindId) ? duration.durationSec : null,
    todayOnly: occurred.todayOnly,
    rawText: text,
  }));

  if (duration && episodeKindIds.length > 1) reasons.push({ type: "ambiguousValue", fieldId: "durationSec" });

  const valuesByField = new Map<string, Set<string | number>>();
  for (const hit of findValues(masked)) {
    valuesByField.set(hit.fieldId, (valuesByField.get(hit.fieldId) ?? new Set()).add(hit.value));
  }
  for (const [fieldId, values] of valuesByField) {
    const targets = drafts.filter((d) => findField(findKind(d.kindId), fieldId) !== null);
    if (targets.length === 0) continue;
    if (values.size > 1 || targets.length > 1) {
      reasons.push({ type: "ambiguousValue", fieldId });
      continue;
    }
    targets[0].values[fieldId] = [...values][0];
  }

  for (const draft of drafts) {
    for (const field of findKind(draft.kindId)?.fields ?? []) {
      if (field.type === "number" && field.defaultValue !== undefined && draft.values[field.id] === undefined) {
        draft.values[field.id] = field.defaultValue;
      }
    }
    for (const field of missingCoreFields(draft.kindId, draft.values)) {
      reasons.push({ type: "missingCore", kindId: draft.kindId, fieldId: field.id });
    }
  }

  return { drafts, reasons, needsLlm: reasons.length > 0 };
};

export { extractEntries };
export type { EntryDraft, LlmReason, ExtractResult };
