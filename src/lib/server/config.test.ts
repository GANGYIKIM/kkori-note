import { describe, expect, it } from "vitest";
import { parseReasoningEffort } from "./config";

describe("parseReasoningEffort", () => {
  it("허용된 값은 그대로 쓴다 (대소문자·공백 무시)", () => {
    expect(parseReasoningEffort("low", "none")).toBe("low");
    expect(parseReasoningEffort("  HIGH ", "none")).toBe("high");
  });

  it("비어 있거나 허용 목록에 없으면 기본값을 쓴다", () => {
    expect(parseReasoningEffort(undefined, "none")).toBe("none");
    expect(parseReasoningEffort("", "low")).toBe("low");
    expect(parseReasoningEffort("max", "low")).toBe("low");
    expect(parseReasoningEffort("fast", "none")).toBe("none");
  });
});
