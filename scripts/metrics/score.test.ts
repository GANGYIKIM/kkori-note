import { describe, expect, it } from "vitest";
import type { EntryDraft } from "@/lib/domain/extract-entries";
import { scoreCase } from "./score";

const TZ = "Asia/Seoul";

const draft = (patch: Partial<EntryDraft>): EntryDraft => ({
  kindId: "poop",
  values: {},
  occurredAt: "2026-11-02T06:00:00.000Z",
  timePrecision: "exact",
  durationSec: null,
  todayOnly: false,
  rawText: "",
  ...patch,
});

describe("scoreCase", () => {
  it("정답에 적은 칸만 비교한다", () => {
    expect(
      scoreCase(
        [{ kindId: "poop", values: { stoolState: "soft" } }],
        [draft({ values: { stoolState: "soft", count: 1 } })],
        TZ,
      ),
    ).toBe(true);
    expect(
      scoreCase(
        [{ kindId: "poop", values: { stoolState: "soft" } }],
        [draft({ values: { stoolState: "normal" } })],
        TZ,
      ),
    ).toBe(false);
    expect(scoreCase([{ kindId: "poop" }], [draft({ values: { stoolState: "normal" } })], TZ)).toBe(true);
  });

  it("기록이 빠지거나 더 생기면 오답", () => {
    expect(scoreCase([{ kindId: "meal" }, { kindId: "walk" }], [draft({ kindId: "meal" })], TZ)).toBe(false);
    expect(scoreCase([], [draft({})], TZ)).toBe(false);
    expect(scoreCase([], [], TZ)).toBe(true);
  });

  it("순서가 달라도 짝을 찾는다", () => {
    expect(
      scoreCase([{ kindId: "meal" }, { kindId: "walk" }], [draft({ kindId: "walk" }), draft({ kindId: "meal" })], TZ),
    ).toBe(true);
  });

  it("시각은 현지 HH:MM이나 하루 전체로 비교한다", () => {
    expect(scoreCase([{ kindId: "poop", time: "15:00" }], [draft({})], TZ)).toBe(true);
    expect(scoreCase([{ kindId: "poop", time: "14:30" }], [draft({})], TZ)).toBe(false);
    expect(scoreCase([{ kindId: "poop", time: "day" }], [draft({ timePrecision: "day" })], TZ)).toBe(true);
    expect(scoreCase([{ kindId: "poop", time: "day" }], [draft({})], TZ)).toBe(false);
  });

  it("지속시간을 적었으면 초까지 같아야 한다", () => {
    expect(scoreCase([{ kindId: "limp", durationSec: 300 }], [draft({ kindId: "limp", durationSec: 300 })], TZ)).toBe(
      true,
    );
    expect(scoreCase([{ kindId: "limp", durationSec: 300 }], [draft({ kindId: "limp", durationSec: null })], TZ)).toBe(
      false,
    );
  });
});
