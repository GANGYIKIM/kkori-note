import { formatDuration } from "./datetime";
import type { LogEntry } from "./types";
import { LABELS, isEpisodeKind } from "./values";

/** 기록 한 건을 칩·목록에 보여줄 짧은 조각들로 바꾼다. 예: ["무름"], ["밀크", "20g"], ["강도 중", "진행 중"] */
const summarizeEntry = (entry: LogEntry): string[] => {
  const parts: string[] = [];

  if (entry.kind === "poop") {
    if (entry.stoolState) parts.push(LABELS.stoolState[entry.stoolState]);
    if (entry.count && entry.count > 1) parts.push(`${entry.count}회`);
  }

  if (entry.kind === "picked_up") {
    if (entry.riskFood) parts.push(LABELS.riskFood[entry.riskFood]);
    if (entry.chocolateType && entry.chocolateType !== "unknown") parts.push(LABELS.chocolateType[entry.chocolateType]);
    if (entry.amountG !== null) parts.push(`${entry.amountG}g`);
  }

  if (isEpisodeKind(entry.kind) && entry.intensity) parts.push(`강도 ${LABELS.intensity[entry.intensity]}`);

  if (entry.durationSec !== null) parts.push(formatDuration(entry.durationSec));
  else if (isEpisodeKind(entry.kind) && entry.endedAt === null) parts.push("진행 중");

  if (entry.detail && !(entry.kind === "picked_up" && entry.riskFood)) parts.push(entry.detail);

  return parts;
};

export { summarizeEntry };
