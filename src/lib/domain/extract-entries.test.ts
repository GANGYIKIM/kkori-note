import { describe, expect, it } from "vitest";
import { extractEntries } from "./extract-entries";

const NOW = "2026-11-02T05:00:00.000Z"; // 11/2 14:00 KST
const TODAY_START = "2026-11-01T15:00:00.000Z";
const extract = (text: string, dogName = "초코") =>
  extractEntries(text, { nowIso: NOW, timeZone: "Asia/Seoul", dogName });
const kinds = (text: string) => extract(text).drafts.map((d) => [d.kindId, d.values]);

describe("extractEntries", () => {
  it("R1-4.1 방금 배변했는데 무른 편 → 지금, 배변, 무름이고 LLM이 필요 없다", () => {
    const result = extract("방금 배변했는데 무른 편");
    expect(result.drafts).toEqual([
      {
        kindId: "poop",
        values: { stoolState: "soft", count: 1 },
        occurredAt: NOW,
        timePrecision: "exact",
        durationSec: null,
        todayOnly: false,
        rawText: "방금 배변했는데 무른 편",
      },
    ]);
    expect(result.needsLlm).toBe(false);
  });

  it("R1-4.2 10분 전 설사는 10분 앞선 시각, 하루종일 3회는 오늘 하루 전체", () => {
    expect(extract("10분 전에 배변했는데 설사").drafts[0]).toMatchObject({
      occurredAt: "2026-11-02T04:50:00.000Z",
      timePrecision: "exact",
      values: { stoolState: "diarrhea" },
    });
    expect(extract("배변 하루종일 3회").drafts[0]).toMatchObject({
      occurredAt: TODAY_START,
      timePrecision: "day",
      values: { count: 3 },
    });
  });

  it("R1-7.3 오늘 설사했어 → 오늘 하루 전체, 1회, LLM이 필요 없다", () => {
    const result = extract("오늘 설사했어");
    expect(result.drafts[0]).toMatchObject({
      kindId: "poop",
      values: { stoolState: "diarrhea", count: 1 },
      occurredAt: TODAY_START,
      timePrecision: "day",
      todayOnly: true,
    });
    expect(result.needsLlm).toBe(false);
  });

  it("R1-8.1 밥 먹고 산책했어 → 식사, 산책 두 개", () => {
    expect(kinds("밥 먹고 산책했어")).toEqual([
      ["meal", {}],
      ["walk", {}],
    ]);
  });

  it("R1-8.2 밥 먹고 무른 변 봤어 → 식사, 배변(무름)", () => {
    expect(kinds("밥 먹고 무른 변 봤어")).toEqual([
      ["meal", {}],
      ["poop", { stoolState: "soft", count: 1 }],
    ]);
  });

  it("R1-8 시각 하나를 모든 기록에 쓴다", () => {
    const drafts = extract("30분 전에 밥 먹고 산책").drafts;
    expect(drafts.map((d) => d.occurredAt)).toEqual(["2026-11-02T04:30:00.000Z", "2026-11-02T04:30:00.000Z"]);
  });

  it("R1-10.1 초코가 초코 먹었어 → 주워 먹음 · 초콜릿", () => {
    expect(kinds("초코가 초코 먹었어")).toEqual([["picked_up", { riskFood: "chocolate" }]]);
  });

  it("R1-10.2 이름 뒤 조사로 강아지와 음식을 가른다", () => {
    expect(kinds("초코가 밥 먹었어")).toEqual([["meal", {}]]);
    expect(kinds("초코가 초코를 주워먹었는데 초코가 좀 녹아있었어")).toEqual([
      ["picked_up", { riskFood: "chocolate" }],
    ]);
  });

  it("이름이 사전과 겹치지 않으면 그대로 둔다", () => {
    expect(extract("보리가 초코 먹었어", "보리").drafts.map((d) => d.kindId)).toEqual(["picked_up"]);
  });

  it("R11 배변 횟수를 말하지 않으면 1회", () => {
    expect(extract("배변했어").drafts[0].values.count).toBe(1);
  });

  it("빈 핵심 항목은 missingCore", () => {
    const result = extract("배변했어");
    expect(result.reasons).toEqual([{ type: "missingCore", kindId: "poop", fieldId: "stoolState" }]);
    expect(result.needsLlm).toBe(true);
  });

  it("종류를 못 찾으면 noKind", () => {
    expect(extract("안녕")).toEqual({ drafts: [], reasons: [{ type: "noKind" }], needsLlm: true });
  });

  it("같은 항목을 가진 종류가 둘이면 값을 붙이지 않고 ambiguousValue", () => {
    const result = extract("절뚝이고 발작했는데 심했어");
    expect(result.drafts.map((d) => d.values)).toEqual([{}, {}]);
    expect(result.reasons).toEqual([{ type: "ambiguousValue", fieldId: "intensity" }]);
  });

  it("한 항목에 다른 값이 둘이면 ambiguousValue", () => {
    const result = extract("딱딱하다가 무른 변");
    expect(result.drafts[0].values.stoolState).toBeUndefined();
    expect(result.reasons).toContainEqual({ type: "ambiguousValue", fieldId: "stoolState" });
  });

  it("모르는 시각 표현은 지금·추정으로 두고 time", () => {
    const result = extract("아까 배변했는데 무른 편");
    expect(result.drafts[0]).toMatchObject({ occurredAt: NOW, timePrecision: "estimated" });
    expect(result.reasons).toEqual([{ type: "time" }]);
  });

  it("R1-4.3 발작 2분쯤 했어 → 지금, 지속시간 2분이고 LLM이 필요 없다", () => {
    const result = extract("발작 2분쯤 했어");
    expect(result.drafts[0]).toMatchObject({
      kindId: "seizure",
      occurredAt: NOW,
      timePrecision: "exact",
      durationSec: 120,
    });
    expect(result.needsLlm).toBe(false);
  });

  it("지속시간과 시각을 함께 읽는다", () => {
    expect(extract("10분 전에 30초 동안 경련했어").drafts[0]).toMatchObject({
      occurredAt: "2026-11-02T04:50:00.000Z",
      durationSec: 30,
    });
  });

  it("에피소드 종류가 없으면 지속시간을 읽지 않는다", () => {
    expect(extract("방금 산책 30분 했어").drafts[0].durationSec).toBeNull();
  });

  it("에피소드 종류가 둘이면 지속시간을 붙이지 않고 ambiguousValue", () => {
    const result = extract("절뚝이고 발작 1분 정도");
    expect(result.drafts.map((d) => d.durationSec)).toEqual([null, null]);
    expect(result.reasons).toContainEqual({ type: "ambiguousValue", fieldId: "durationSec" });
  });
});
