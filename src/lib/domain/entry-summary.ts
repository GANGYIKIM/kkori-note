import { formatDuration } from "./datetime";
import { findKind, isEpisodeKind, optionLabel } from "./kinds";
import type { LogEntry } from "./types";

/** 기록 한 건을 칩·목록에 보여줄 짧은 조각들로 바꾼다. 예: ["무름"], ["밀크", "20g"], ["강도 중", "진행 중"] */
const summarizeEntry = (entry: LogEntry): string[] => {
  const parts: string[] = [];
  const kind = findKind(entry.kindId);
  const { stoolState, count, riskFood, chocolateType, amountG, intensity, detail } = entry.values;
  const label = (fieldId: string, value: string | number) => optionLabel(kind, fieldId, String(value));

  if (entry.kindId === "poop") {
    if (stoolState !== undefined) parts.push(label("stoolState", stoolState));
    if (typeof count === "number" && count > 1) parts.push(`${count}회`);
  }

  if (entry.kindId === "picked_up") {
    if (riskFood !== undefined) parts.push(label("riskFood", riskFood));
    if (chocolateType !== undefined && chocolateType !== "unknown") parts.push(label("chocolateType", chocolateType));
    if (amountG !== undefined) parts.push(`${amountG}g`);
  }

  if (isEpisodeKind(entry.kindId) && intensity !== undefined) parts.push(`강도 ${label("intensity", intensity)}`);

  if (entry.durationSec !== null) parts.push(formatDuration(entry.durationSec));
  else if (isEpisodeKind(entry.kindId) && entry.endedAt === null) parts.push("진행 중");

  if (detail !== undefined && detail !== "" && !(entry.kindId === "picked_up" && riskFood !== undefined))
    parts.push(String(detail));

  return parts;
};

export { summarizeEntry };
