import { describe, expect, it } from "vitest";
import { LogEntrySchema } from "./types";

const base = {
  id: "e1",
  dogId: "d1",
  kindId: "poop",
  occurredAt: "2026-10-29T01:00:00.000Z",
  createdAt: "2026-10-29T01:00:05.000Z",
};

describe("LogEntrySchema", () => {
  it("빈 칸은 기본값으로 채워진다", () => {
    const parsed = LogEntrySchema.parse(base);
    expect(parsed.weather).toBeNull();
    expect(parsed.endedAt).toBeNull();
    expect(parsed.attachmentIds).toEqual([]);
    expect(parsed.values).toEqual({});
    expect(parsed.timePrecision).toBe("exact");
  });

  it("정의에 없는 종류·항목·값 id가 든 기록도 읽힌다", () => {
    const stored = { ...base, kindId: "removed_kind", values: { stoolState: "mucus", newField: 3 } };
    expect(LogEntrySchema.safeParse(stored).success).toBe(true);
  });

  it("values는 문자열과 숫자만 받는다", () => {
    expect(LogEntrySchema.safeParse({ ...base, values: { stoolState: null } }).success).toBe(false);
    expect(LogEntrySchema.safeParse({ ...base, values: { count: true } }).success).toBe(false);
  });

  it("시각 정확도는 값 목록 안에서만 받는다", () => {
    expect(LogEntrySchema.safeParse({ ...base, timePrecision: "day" }).success).toBe(true);
    expect(LogEntrySchema.safeParse({ ...base, timePrecision: "week" }).success).toBe(false);
  });
});
