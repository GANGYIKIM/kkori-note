import { startOfLocalDay } from "./datetime";
import type { TimePrecision } from "./values";

/**
 * 최소 시각 파서 (PRD R1-4). 아는 표현만 시각으로 바꾸고, 모르는 시각 표현은 unknown으로 돌려 LLM에 맡긴다.
 * 추정 시각("아까", "어제 저녁쯤")은 R2에서 넓힌다.
 */

type TimeParseResult =
  | { status: "found"; occurredAt: string; timePrecision: TimePrecision; todayOnly: boolean }
  | { status: "none" }
  | { status: "unknown" };

const RELATIVE = /(\d+)\s*(분|시간)\s*전/g;
const WHOLE_DAY = /하루\s*종일|종일|오늘\s*하루/g;
const NOW = /방금|지금/g;
const TODAY = /오늘/;
const UNSUPPORTED = /아까|어제|그저께|그제|아침|점심|오후|저녁|밤|새벽|오전|\d+\s*시(?!간)|쯤|(분|시간)\s*전/;

const DURATION = /(\d+)\s*(시간|분|초)(?!\s*전)\s*(?:쯤|정도|동안)?/;
const UNIT_SEC: Record<string, number> = { 시간: 3600, 분: 60, 초: 1 };

/** 에피소드의 지속시간("2분쯤", "30초 동안"). 읽은 표현을 공백으로 지운 문장도 함께 준다 */
const parseDuration = (text: string): { durationSec: number; rest: string } | null => {
  const match = DURATION.exec(text);
  if (!match) return null;
  return {
    durationSec: Number(match[1]) * UNIT_SEC[match[2]],
    rest: text.slice(0, match.index) + " " + text.slice(match.index + match[0].length),
  };
};

const parseTime = (text: string, nowIso: string, timeZone: string): TimeParseResult => {
  const nowMs = Date.parse(nowIso);
  const found: { occurredAt: string; timePrecision: TimePrecision }[] = [];
  let rest = text;

  rest = rest.replace(RELATIVE, (_, amount: string, unit: string) => {
    const minutes = Number(amount) * (unit === "시간" ? 60 : 1);
    found.push({ occurredAt: new Date(nowMs - minutes * 60_000).toISOString(), timePrecision: "exact" });
    return " ";
  });
  rest = rest.replace(WHOLE_DAY, () => {
    found.push({ occurredAt: startOfLocalDay(nowIso, timeZone), timePrecision: "day" });
    return " ";
  });
  rest = rest.replace(NOW, () => {
    found.push({ occurredAt: new Date(nowMs).toISOString(), timePrecision: "exact" });
    return " ";
  });

  if (UNSUPPORTED.test(rest)) return { status: "unknown" };

  const distinct = new Set(found.map((f) => `${f.occurredAt}|${f.timePrecision}`));
  if (distinct.size > 1) return { status: "unknown" };
  if (found.length > 0) return { status: "found", ...found[0], todayOnly: false };
  if (TODAY.test(rest)) {
    return { status: "found", occurredAt: startOfLocalDay(nowIso, timeZone), timePrecision: "day", todayOnly: true };
  }
  return { status: "none" };
};

export { parseTime, parseDuration };
export type { TimeParseResult };
