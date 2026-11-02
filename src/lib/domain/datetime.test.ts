import { describe, expect, it } from "vitest";
import {
  elapsedMinutes,
  formatDateHeading,
  formatDuration,
  formatLocalTime,
  formatShortDate,
  groupByLocalDate,
  localDateKey,
  startOfLocalDay,
} from "./datetime";

const SEOUL = "Asia/Seoul";

describe("localDateKey", () => {
  it("UTC로는 전날이어도 서울 기준 날짜를 준다", () => {
    // 2026-10-28 15:30 UTC = 2026-10-29 00:30 KST
    expect(localDateKey("2026-10-28T15:30:00.000Z", SEOUL)).toBe("2026-10-29");
    expect(localDateKey("2026-10-28T15:30:00.000Z", "UTC")).toBe("2026-10-28");
  });
});

describe("formatLocalTime", () => {
  it("현지 시각을 24시간제로 준다", () => {
    expect(formatLocalTime("2026-10-28T15:30:00.000Z", SEOUL)).toBe("00:30");
    expect(formatLocalTime("2026-10-29T10:05:00.000Z", SEOUL)).toBe("19:05");
  });
});

describe("formatDateHeading", () => {
  const now = "2026-10-29T03:00:00.000Z"; // 10/29 12:00 KST

  it("오늘과 어제를 붙여 준다", () => {
    expect(formatDateHeading("2026-10-29", now, SEOUL)).toBe("오늘 · 10월 29일 (목)");
    expect(formatDateHeading("2026-10-28", now, SEOUL)).toBe("어제 · 10월 28일 (수)");
    expect(formatDateHeading("2026-10-20", now, SEOUL)).toBe("10월 20일 (화)");
  });

  it("자정 직후에는 서울 기준으로 오늘을 판단한다", () => {
    const justAfterMidnight = "2026-10-28T15:10:00.000Z"; // 10/29 00:10 KST
    expect(formatDateHeading("2026-10-29", justAfterMidnight, SEOUL)).toBe("오늘 · 10월 29일 (목)");
  });
});

describe("formatDuration", () => {
  it("초, 분, 시간을 읽기 쉽게 준다", () => {
    expect(formatDuration(45)).toBe("45초");
    expect(formatDuration(120)).toBe("2분");
    expect(formatDuration(90)).toBe("1분 30초");
    expect(formatDuration(330)).toBe("5분 30초");
    expect(formatDuration(3900)).toBe("1시간 5분");
    expect(formatDuration(7200)).toBe("2시간");
  });
});

describe("formatShortDate", () => {
  it("서울 기준 월/일을 준다", () => {
    expect(formatShortDate("2026-10-28T15:30:00.000Z", SEOUL)).toBe("10/29");
  });
});

describe("elapsedMinutes", () => {
  it("지난 분을 내림해서 주고 음수는 0으로 둔다", () => {
    expect(elapsedMinutes("2026-10-29T03:00:00.000Z", "2026-10-29T03:12:59.000Z")).toBe(12);
    expect(elapsedMinutes("2026-10-29T03:10:00.000Z", "2026-10-29T03:00:00.000Z")).toBe(0);
  });
});

describe("groupByLocalDate", () => {
  it("서울 날짜로 묶고 최신이 먼저 온다", () => {
    const items = [
      { id: "a", occurredAt: "2026-10-28T14:50:00.000Z" }, // 10/28 23:50 KST
      { id: "b", occurredAt: "2026-10-28T15:10:00.000Z" }, // 10/29 00:10 KST
      { id: "c", occurredAt: "2026-10-29T01:00:00.000Z" }, // 10/29 10:00 KST
    ];
    const groups = groupByLocalDate(items, SEOUL);
    expect(groups.map((g) => g.dateKey)).toEqual(["2026-10-29", "2026-10-28"]);
    expect(groups[0].items.map((i) => i.id)).toEqual(["c", "b"]);
    expect(groups[1].items.map((i) => i.id)).toEqual(["a"]);
  });
});

describe("startOfLocalDay", () => {
  it("현지 시간대의 그날 0시를 UTC로 준다", () => {
    expect(startOfLocalDay("2026-11-02T05:00:00.000Z", SEOUL)).toBe("2026-11-01T15:00:00.000Z");
    // 2026-11-01 15:30 UTC = 2026-11-02 00:30 KST
    expect(startOfLocalDay("2026-11-01T15:30:00.000Z", SEOUL)).toBe("2026-11-01T15:00:00.000Z");
    expect(startOfLocalDay("2026-11-02T05:00:00.000Z", "UTC")).toBe("2026-11-02T00:00:00.000Z");
  });

  it("서머타임이 바뀌는 날에도 0시를 준다", () => {
    // 2026-03-08 뉴욕은 02:00에 EST(-5) → EDT(-4). 0시는 EST
    expect(startOfLocalDay("2026-03-08T18:00:00.000Z", "America/New_York")).toBe("2026-03-08T05:00:00.000Z");
  });
});
