/**
 * 날짜·시각 표시와 현지 날짜 묶기. 저장은 UTC ISO 문자열이고,
 * "오늘", "어제" 같은 날짜 개념은 기기 현지 시간대로 계산한다 (PRD R2).
 * 현재 시각과 시간대는 항상 인자로 받는다.
 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** 현지 시간대 기준 날짜 키 (YYYY-MM-DD) */
const localDateKey = (iso: string, timeZone: string): string => {
  // en-CA 로캘은 YYYY-MM-DD 형식을 준다
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(iso),
  );
};

/** 현지 시간대 기준 HH:mm */
const formatLocalTime = (iso: string, timeZone: string): string => {
  return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(iso),
  );
};

/** 기록의 시각 자리. 하루 전체 기록은 "종일" */
const formatEntryTime = (entry: { occurredAt: string; timePrecision: string }, timeZone: string): string => {
  return entry.timePrecision === "day" ? "종일" : formatLocalTime(entry.occurredAt, timeZone);
};

/** 그 순간의 시간대 오프셋(분). 현지 시각 − UTC */
const offsetMinutes = (epochMs: number, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(epochMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - Math.floor(epochMs / 1000) * 1000) / 60_000);
};

/** 현지 시간대의 그날 0시를 UTC ISO 문자열로 */
const startOfLocalDay = (nowIso: string, timeZone: string): string => {
  const midnightAsUtc = Date.parse(`${localDateKey(nowIso, timeZone)}T00:00:00.000Z`);
  const guess = midnightAsUtc - offsetMinutes(midnightAsUtc, timeZone) * 60_000;
  // 0시 전후로 오프셋이 바뀌는 날(서머타임)을 위해 한 번 더 맞춘다
  return new Date(midnightAsUtc - offsetMinutes(guess, timeZone) * 60_000).toISOString();
};

/** 날짜 키를 하루씩 옮긴다. 날짜 키는 달력 날짜라 시간대와 무관하게 UTC로 계산해도 된다 */
const shiftDateKey = (dateKey: string, days: number): string => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/** 목록의 날짜 제목. 예: "오늘 · 10월 29일 (목)", "어제 · 10월 28일 (수)", "10월 20일 (화)" */
const formatDateHeading = (dateKey: string, nowIso: string, timeZone: string): string => {
  const [, month, day] = dateKey.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(`${dateKey}T00:00:00.000Z`).getUTCDay()];
  const base = `${month}월 ${day}일 (${weekday})`;
  const today = localDateKey(nowIso, timeZone);
  if (dateKey === today) return `오늘 · ${base}`;
  if (dateKey === shiftDateKey(today, -1)) return `어제 · ${base}`;
  return base;
};

/**
 * 지속시간 표시. 예: 45초, 2분, 1분 30초, 1시간 5분.
 * 1시간 미만은 초를 버리지 않는다 (발작 5분 초과 같은 안전 규칙에 쓰이는 숫자라서).
 */
const formatDuration = (totalSec: number): string => {
  if (totalSec < 60) return `${totalSec}초`;
  if (totalSec < 3600) {
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return seconds === 0 ? `${minutes}분` : `${minutes}분 ${seconds}초`;
  }
  const totalMin = Math.round(totalSec / 60);
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`;
};

/** 짧은 현지 날짜. 예: 10/28 */
const formatShortDate = (iso: string, timeZone: string): string => {
  const [, month, day] = localDateKey(iso, timeZone).split("-").map(Number);
  return `${month}/${day}`;
};

/** 시작부터 지금까지 지난 분 (진행 중 에피소드 표시용) */
const elapsedMinutes = (startIso: string, nowIso: string): number => {
  return Math.max(0, Math.floor((Date.parse(nowIso) - Date.parse(startIso)) / 60_000));
};

/** occurredAt을 가진 항목을 현지 날짜별로 묶는다. 날짜와 항목 모두 오래된 것이 먼저, 하루 전체 기록은 그날 맨 뒤 */
const groupByLocalDate = <T extends { occurredAt: string; timePrecision?: string }>(
  items: readonly T[],
  timeZone: string,
): { dateKey: string; items: T[] }[] => {
  const sortKey = (item: T) => [localDateKey(item.occurredAt, timeZone), item.timePrecision === "day" ? 1 : 0] as const;
  const sorted = [...items].sort((a, b) => {
    const [dateA, dayA] = sortKey(a);
    const [dateB, dayB] = sortKey(b);
    return dateA.localeCompare(dateB) || dayA - dayB || a.occurredAt.localeCompare(b.occurredAt);
  });
  const groups: { dateKey: string; items: T[] }[] = [];
  for (const item of sorted) {
    const key = localDateKey(item.occurredAt, timeZone);
    const last = groups.at(-1);
    if (last?.dateKey === key) last.items.push(item);
    else groups.push({ dateKey: key, items: [item] });
  }
  return groups;
};

export {
  localDateKey,
  formatLocalTime,
  formatEntryTime,
  startOfLocalDay,
  formatDateHeading,
  formatDuration,
  formatShortDate,
  elapsedMinutes,
  groupByLocalDate,
};
