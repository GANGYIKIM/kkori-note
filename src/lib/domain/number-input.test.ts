import { describe, expect, it } from "vitest";
import { findField, findKind } from "./kinds";
import { commitNumberText, rangeHint, ruleFromField, sanitizeNumberText, type NumberRule } from "./number-input";

const COUNT: NumberRule = { min: 1, max: 10, integer: true, decimals: 0 };
const WEIGHT: NumberRule = { min: 0.1, max: 120, integer: false, decimals: 1 };
const MINUTES: NumberRule = { min: 0, max: Infinity, integer: true, decimals: 0 };

describe("sanitizeNumberText", () => {
  it("숫자와 점 말고는 지운다", () => {
    expect(sanitizeNumberText("3a", COUNT)).toBe("3");
    expect(sanitizeNumberText("4.2kg", WEIGHT)).toBe("4.2");
  });

  it("정수 칸은 점 뒤를 버린다", () => {
    expect(sanitizeNumberText("2.5", COUNT)).toBe("2");
  });

  it("쉼표는 점으로 바꾸고 점은 하나만 남긴다", () => {
    expect(sanitizeNumberText("4,5", WEIGHT)).toBe("4.5");
    expect(sanitizeNumberText("4.5.", WEIGHT)).toBe("4.5");
  });

  it("소수는 정한 자리까지만 남긴다", () => {
    expect(sanitizeNumberText("4.25", WEIGHT)).toBe("4.2");
  });

  it("앞자리 0은 하나만 남기고, 점으로 시작하면 0을 붙인다", () => {
    expect(sanitizeNumberText("007", MINUTES)).toBe("7");
    expect(sanitizeNumberText("0.5", WEIGHT)).toBe("0.5");
    expect(sanitizeNumberText(".5", WEIGHT)).toBe("0.5");
  });

  it("최대값을 넘으면 null", () => {
    expect(sanitizeNumberText("11", COUNT)).toBeNull();
    expect(sanitizeNumberText("120.5", WEIGHT)).toBeNull();
    expect(sanitizeNumberText("10", COUNT)).toBe("10");
  });

  it("최소값보다 작아도 칠 때는 막지 않는다", () => {
    expect(sanitizeNumberText("0", COUNT)).toBe("0");
    expect(sanitizeNumberText("0.", WEIGHT)).toBe("0.");
  });

  it("빈칸은 빈칸", () => {
    expect(sanitizeNumberText("", COUNT)).toBe("");
  });
});

describe("commitNumberText", () => {
  it("빈칸은 null", () => {
    expect(commitNumberText("", COUNT)).toBeNull();
  });

  it("최소값보다 작으면 최소값", () => {
    expect(commitNumberText("0", COUNT)).toBe(1);
    expect(commitNumberText("0.0", WEIGHT)).toBe(0.1);
  });

  it("점으로 끝나도 숫자로 읽는다", () => {
    expect(commitNumberText("5.", WEIGHT)).toBe(5);
  });
});

describe("rangeHint", () => {
  it("최대가 있으면 범위, 없으면 이상", () => {
    expect(rangeHint(COUNT)).toBe("1~10");
    expect(rangeHint(MINUTES)).toBe("0 이상");
  });
});

describe("ruleFromField", () => {
  it("종류 정의의 숫자 항목에서 규칙을 만든다", () => {
    const field = findField(findKind("poop"), "count");
    if (field?.type !== "number") throw new Error("count 항목이 없음");
    expect(ruleFromField(field)).toEqual({ min: 1, max: 10, integer: true, decimals: 0 });
  });
});
