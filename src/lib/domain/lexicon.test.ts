import { describe, expect, it } from "vitest";
import { findKinds, findValues, overlapsLexicon } from "./lexicon";

const kindsOf = (text: string) => findKinds(text).map((h) => h.kindId);
const valueOf = (text: string, fieldId: string) => findValues(text).find((v) => v.fieldId === fieldId)?.value;

describe("findKinds", () => {
  it.each([
    ["poop", ["배변했어", "응가함", "응아 했어", "똥 쌌어", "대변 봤어", "혈변이 나왔어", "설사했어", "무른 변 봤어"]],
    ["meal", ["밥 먹었어", "사료 다 먹음", "식사 끝"]],
    ["snack", ["간식 줬어", "개껌 씹었어", "트릿 하나"]],
    ["walk", ["산책했어"]],
    ["picked_up", ["뭘 주워 먹었어", "주워먹었어", "뭔가 삼켰어", "초콜릿 먹었어", "포도 먹었어"]],
    ["limp", ["절뚝거려", "절룩여"]],
    ["seizure", ["발작했어", "경련 일으켰어"]],
    ["thunder_fear", ["천둥 쳐서 떨어"]],
  ])("%s", (kindId, texts) => {
    for (const text of texts) expect(kindsOf(text), text).toEqual([kindId]);
  });

  it("문장 속 단어의 '변'은 배변이 아니다", () => {
    expect(kindsOf("주변 냄새 맡았어")).toEqual([]);
    expect(kindsOf("성격이 변했어")).toEqual([]);
  });

  it("위험 음식이 있어도 먹지 않았으면 주워 먹음이 아니다", () => {
    expect(kindsOf("초콜릿 냄새 맡았어")).toEqual([]);
  });

  it("문장에 처음 나온 순서대로 준다", () => {
    expect(kindsOf("밥 먹고 산책했어")).toEqual(["meal", "walk"]);
    expect(kindsOf("산책하고 밥 먹었어")).toEqual(["walk", "meal"]);
  });
});

describe("findValues", () => {
  it.each([
    ["stoolState", "hard", ["딱딱해", "단단했어", "토끼똥 같아", "토끼 똥"]],
    ["stoolState", "normal", ["정상이야"]],
    ["stoolState", "soft", ["무른 편", "무름", "물렁해", "흐물흐물", "묽어"]],
    ["stoolState", "diarrhea", ["설사", "물똥"]],
    ["stoolState", "blood_mucus", ["혈변", "피똥", "점액"]],
    ["riskFood", "chocolate", ["초콜릿", "초콜렛", "초코"]],
    ["riskFood", "grape_raisin", ["포도", "건포도"]],
    ["riskFood", "xylitol", ["자일리톨 껌"]],
    ["riskFood", "macadamia", ["마카다미아"]],
    ["riskFood", "onion_garlic", ["양파", "마늘"]],
    ["chocolateType", "dark", ["다크"]],
    ["chocolateType", "milk", ["밀크"]],
    ["chocolateType", "white", ["화이트"]],
    ["chocolateType", "baking", ["베이킹용"]],
    ["intensity", "high", ["심하게", "심했어", "심각해"]],
    ["intensity", "low", ["살짝", "약하게"]],
  ])("%s = %s", (fieldId, value, texts) => {
    for (const text of texts) expect(valueOf(text, fieldId), text).toBe(value);
  });

  it("횟수와 먹은 양은 숫자로 준다", () => {
    expect(valueOf("3회", "count")).toBe(3);
    expect(valueOf("2번 쌌어", "count")).toBe(2);
    expect(valueOf("20g 정도", "amountG")).toBe(20);
    expect(valueOf("50 그램", "amountG")).toBe(50);
  });
});

describe("overlapsLexicon", () => {
  it("사전 표현과 겹치는 이름인지 안다", () => {
    expect(overlapsLexicon("초코")).toBe(true);
    expect(overlapsLexicon("보리")).toBe(false);
  });
});
