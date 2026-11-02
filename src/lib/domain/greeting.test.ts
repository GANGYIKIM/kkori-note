import { describe, expect, it } from "vitest";
import { GREETING_LINES } from "./greeting";

describe("GREETING_LINES", () => {
  it("R1-3의 두 채팅 문장이다", () => {
    expect(GREETING_LINES).toEqual([
      "안녕하세요! 기록하거나 궁금한 걸 물어보세요.",
      "예: '방금 배변했는데 무른 편', '지난주 배변 어땠어?'",
    ]);
  });
});
