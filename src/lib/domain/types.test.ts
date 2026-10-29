import { describe, expect, it } from "vitest";
import { LogEntrySchema } from "./types";

const base = {
  id: "e1",
  dogId: "d1",
  kind: "poop",
  occurredAt: "2026-10-29T01:00:00.000Z",
  createdAt: "2026-10-29T01:00:05.000Z",
};

describe("LogEntrySchema", () => {
  it("weather가 비어 있어도 통과하고 null로 채워진다", () => {
    const parsed = LogEntrySchema.parse(base);
    expect(parsed.weather).toBeNull();
    expect(parsed.endedAt).toBeNull();
    expect(parsed.attachmentIds).toEqual([]);
  });

  it("값 목록 밖의 배변 상태는 거부한다", () => {
    expect(LogEntrySchema.safeParse({ ...base, stoolState: "흐물흐물" }).success).toBe(false);
    expect(LogEntrySchema.safeParse({ ...base, stoolState: "soft" }).success).toBe(true);
  });
});
