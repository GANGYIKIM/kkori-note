import type { EntryDraft } from "./extract-entries";
import { findField, findKind, kindLabel, missingCoreFields } from "./kinds";

/** 기록 응답 고정 문장 (PRD R1-7). LLM을 쓰지 않는다 */

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

/** 마지막 한글 글자에 받침이 있으면 "을", 없으면 "를" */
const objectParticle = (word: string): string => {
  const last = [...word].reverse().find((ch) => {
    const code = ch.charCodeAt(0);
    return code >= HANGUL_START && code <= HANGUL_END;
  });
  if (last === undefined) return "를";
  return (last.charCodeAt(0) - HANGUL_START) % 28 === 0 ? "를" : "을";
};

const withObject = (words: string[]): string => {
  const joined = words.join(", ");
  return `${joined}${objectParticle(joined)}`;
};

const recordReply = (dogName: string, drafts: readonly EntryDraft[]): string => {
  const kinds = [...new Set(drafts.map((d) => kindLabel(d.kindId)))];
  const recorded = `${dogName}의 ${withObject(kinds)} 기록했어요.`;

  const hints = drafts.flatMap((d) => missingCoreFields(d.kindId, d.values).map((f) => f.askHint ?? f.label));
  if (hints.length > 0) return `${recorded} ${withObject(hints)} 알려주시면 더 정확해요.`;

  const todayOnly = drafts.filter((d) => d.todayOnly);
  if (todayOnly.length === 0) return recorded;
  const hasCount = todayOnly.some((d) => findField(findKind(d.kindId), "count") !== null);
  return hasCount
    ? `${recorded} 오늘 하루 몇 번인지 남기시려면 칩에서 횟수를, 대략적인 시각이 기억나시면 칩에서 시각을 고쳐 주세요.`
    : `${recorded} 대략적인 시각이 기억나시면 칩에서 시각을 고쳐 주세요.`;
};

export { recordReply };
