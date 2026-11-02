import { describe, expect, it } from "vitest";
import { toDrafts } from "./chat-turn";

const ctx = { nowIso: "2026-11-02T08:00:00.000Z", timeZone: "Asia/Seoul", rawText: "원문" };

describe("toDrafts", () => {
  it("정의에 없는 종류는 버린다", () => {
    const drafts = toDrafts(
      [{ kindId: "bath", values: {}, occurredAt: ctx.nowIso, timePrecision: "exact", durationSec: null }],
      ctx,
    );
    expect(drafts).toEqual([]);
  });

  it("맞지 않는 값은 그 칸만 비우고 기본값을 채운다", () => {
    const [draft] = toDrafts(
      [
        {
          kindId: "poop",
          values: { stoolState: "mushy", color: "brown" },
          occurredAt: "2026-11-02T16:30:00+09:00",
          timePrecision: "exact",
          durationSec: 60,
        },
      ],
      ctx,
    );
    expect(draft.values).toEqual({ count: 1 });
    expect(draft.occurredAt).toBe("2026-11-02T07:30:00.000Z");
    expect(draft.durationSec).toBeNull();
    expect(draft.rawText).toBe("원문");
  });

  it("에피소드 종류만 지속시간을 받는다", () => {
    const [draft] = toDrafts(
      [{ kindId: "thunder_fear", values: {}, occurredAt: ctx.nowIso, timePrecision: "exact", durationSec: 300 }],
      ctx,
    );
    expect(draft.durationSec).toBe(300);
  });

  it("하루 전체 기록은 현지 그날 0시로 둔다", () => {
    const [draft] = toDrafts(
      [
        {
          kindId: "poop",
          values: { stoolState: "diarrhea", count: 2 },
          occurredAt: "2026-11-02T12:00:00+09:00",
          timePrecision: "day",
          durationSec: null,
        },
      ],
      ctx,
    );
    expect(draft.occurredAt).toBe("2026-11-01T15:00:00.000Z");
    expect(draft.todayOnly).toBe(true);
    expect(draft.values).toEqual({ stoolState: "diarrhea", count: 2 });
  });

  it("읽을 수 없는 시각은 지금 시각의 추정으로 둔다", () => {
    const [draft] = toDrafts(
      [{ kindId: "walk", values: {}, occurredAt: "어제쯤", timePrecision: "exact", durationSec: null }],
      ctx,
    );
    expect(draft.occurredAt).toBe(ctx.nowIso);
    expect(draft.timePrecision).toBe("estimated");
  });
});
