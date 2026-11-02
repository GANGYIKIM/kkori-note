import { describe, expect, it } from "vitest";
import { fromList } from "./load-state";

describe("fromList", () => {
  it("빈 목록은 empty, 아니면 data", () => {
    expect(fromList([])).toEqual({ status: "empty" });
    expect(fromList([1, 2])).toEqual({ status: "data", data: [1, 2] });
  });
});
