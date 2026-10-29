/**
 * 날짜·시각 표시와 현지 날짜 묶기. 저장은 UTC ISO 문자열이고,
 * "오늘", "어제" 같은 날짜 개념은 기기 현지 시간대로 계산한다 (PRD R2).
 * 현재 시각과 시간대는 항상 인자로 받는다.
 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** 현지 시간대 기준 날짜 키 (YYYY-MM-DD) */
export function localDateKey(iso: string, timeZone: string): string {
  // en-CA 로캘은 YYYY-MM-DD 형식을 준다
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(iso),
  );
}

/** 현지 시간대 기준 HH:mm */
export function formatLocalTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(iso),
  );
}

/** 날짜 키를 하루씩 옮긴다. 날짜 키는 달력 날짜라 시간대와 무관하게 UTC로 계산해도 된다 */
function shiftDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** 목록의 날짜 제목. 예: "오늘 · 10월 29일 (목)", "어제 · 10월 28일 (수)", "10월 20일 (화)" */
export function formatDateHeading(dateKey: string, nowIso: string, timeZone: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(`${dateKey}T00:00:00.000Z`).getUTCDay()];
  const base = `${month}월 ${day}일 (${weekday})`;
  const today = localDateKey(nowIso, timeZone);
  if (dateKey === today) return `오늘 · ${base}`;
  if (dateKey === shiftDateKey(today, -1)) return `어제 · ${base}`;
  return base;
}

/**
 * 지속시간 표시. 예: 45초, 2분, 1분 30초, 1시간 5분.
 * 1시간 미만은 초를 버리지 않는다 (발작 5분 초과 같은 안전 규칙에 쓰이는 숫자라서).
 */
export function formatDuration(totalSec: number): string {
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
}

/** 짧은 현지 날짜. 예: 10/28 */
export function formatShortDate(iso: string, timeZone: string): string {
  const [, month, day] = localDateKey(iso, timeZone).split("-").map(Number);
  return `${month}/${day}`;
}

/** 시작부터 지금까지 지난 분 (진행 중 에피소드 표시용) */
export function elapsedMinutes(startIso: string, nowIso: string): number {
  return Math.max(0, Math.floor((Date.parse(nowIso) - Date.parse(startIso)) / 60_000));
}

/** occurredAt을 가진 항목을 현지 날짜별로 묶는다. 날짜와 항목 모두 최신이 먼저 */
export function groupByLocalDate<T extends { occurredAt: string }>(
  items: readonly T[],
  timeZone: string,
): { dateKey: string; items: T[] }[] {
  const sorted = [...items].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const groups: { dateKey: string; items: T[] }[] = [];
  for (const item of sorted) {
    const key = localDateKey(item.occurredAt, timeZone);
    const last = groups.at(-1);
    if (last?.dateKey === key) last.items.push(item);
    else groups.push({ dateKey: key, items: [item] });
  }
  return groups;
}
