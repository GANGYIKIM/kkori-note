import { describe, expect, it } from "vitest";
import { extractEntries } from "./extract-entries";
import { recordReply } from "./record-reply";

const reply = (text: string, dogName = "초코") =>
  recordReply(
    dogName,
    extractEntries(text, { nowIso: "2026-11-02T05:00:00.000Z", timeZone: "Asia/Seoul", dogName }).drafts,
  );

describe("recordReply", () => {
  it("R1-7.1 빈 핵심 항목이 있으면 알려 달라고 한다", () => {
    expect(reply("배변했어")).toBe("초코의 배변을 기록했어요. 상태(무른지, 딱딱한지)를 알려주시면 더 정확해요.");
  });

  it("R1-7.2 핵심 항목이 차 있으면 종류만 말하고, 여러 기록은 한 문장으로 묶는다", () => {
    expect(reply("방금 배변했는데 무른 편")).toBe("초코의 배변을 기록했어요.");
    expect(reply("밥 먹고 산책했어")).toBe("초코의 식사, 산책을 기록했어요.");
  });

  it("R1-7.3 오늘만 있는 기록에는 칩에서 횟수와 시각을 고치는 안내가 붙는다", () => {
    expect(reply("오늘 설사했어")).toBe(
      "초코의 배변을 기록했어요. 오늘 하루 몇 번인지 남기시려면 칩에서 횟수를, 대략적인 시각이 기억나시면 칩에서 시각을 고쳐 주세요.",
    );
    expect(reply("오늘 산책했어")).toBe(
      "초코의 산책을 기록했어요. 대략적인 시각이 기억나시면 칩에서 시각을 고쳐 주세요.",
    );
  });

  it("안내는 하나만 붙이고 빈 핵심 항목이 먼저다", () => {
    expect(reply("오늘 배변했어")).toBe("초코의 배변을 기록했어요. 상태(무른지, 딱딱한지)를 알려주시면 더 정확해요.");
  });

  it("을/를을 받침으로 고른다", () => {
    expect(reply("밥 먹었어")).toBe("초코의 식사를 기록했어요.");
    expect(reply("뭘 주워먹었어")).toBe("초코의 주워 먹음을 기록했어요. 무엇을 먹었는지를 알려주시면 더 정확해요.");
  });
});
