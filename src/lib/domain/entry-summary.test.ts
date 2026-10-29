import { describe, expect, it } from "vitest";
import { summarizeEntry } from "./entry-summary";
import { LogEntrySchema } from "./types";

const entry = (fields: Record<string, unknown>) =>
  LogEntrySchema.parse({
    id: "e1",
    dogId: "d1",
    occurredAt: "2026-10-29T01:00:00.000Z",
    createdAt: "2026-10-29T01:00:05.000Z",
    ...fields,
  });

describe("summarizeEntry", () => {
  it("배변은 상태와 횟수를 보여준다", () => {
    expect(summarizeEntry(entry({ kind: "poop", stoolState: "soft" }))).toEqual(["무름"]);
    expect(summarizeEntry(entry({ kind: "poop", stoolState: "normal", count: 2 }))).toEqual(["정상", "2회"]);
    expect(summarizeEntry(entry({ kind: "poop" }))).toEqual([]);
  });

  it("에피소드는 강도와 지속시간, 진행 중 여부를 보여준다", () => {
    expect(summarizeEntry(entry({ kind: "seizure", durationSec: 120, endedAt: "2026-10-29T01:02:00.000Z" }))).toEqual([
      "2분",
    ]);
    expect(summarizeEntry(entry({ kind: "thunder_fear", intensity: "medium" }))).toEqual(["강도 중", "진행 중"]);
  });

  it("위험 음식은 음식, 종류, 양을 보여주고 모르는 칸은 뺀다", () => {
    expect(
      summarizeEntry(entry({ kind: "picked_up", riskFood: "chocolate", chocolateType: "milk", amountG: 20 })),
    ).toEqual(["초콜릿", "밀크", "20g"]);
    expect(summarizeEntry(entry({ kind: "picked_up", riskFood: "chocolate", chocolateType: "unknown" }))).toEqual([
      "초콜릿",
    ]);
  });

  it("자유 텍스트는 끝에 붙인다", () => {
    expect(summarizeEntry(entry({ kind: "walk", durationSec: 1800, detail: "친구랑 잘 놀았어" }))).toEqual([
      "30분",
      "친구랑 잘 놀았어",
    ]);
    expect(summarizeEntry(entry({ kind: "picked_up", detail: "휴지" }))).toEqual(["휴지"]);
  });
});
