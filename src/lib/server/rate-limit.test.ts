import { describe, expect, it } from "vitest";
import { checkRateLimit, createMemoryStore } from "./rate-limit";

const DAY = 24 * 60 * 60 * 1000;

describe("checkRateLimit", () => {
  it("한도까지는 허용하고 초과하면 막는다", () => {
    const store = createMemoryStore();
    const results = Array.from({ length: 4 }, () => checkRateLimit(store, "ip:1", 3, DAY, 1000));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results[0].remaining).toBe(2);
    expect(results[3].remaining).toBe(0);
  });

  it("클라이언트별로 따로 센다", () => {
    const store = createMemoryStore();
    checkRateLimit(store, "ip:a", 1, DAY, 1000);
    expect(checkRateLimit(store, "ip:a", 1, DAY, 1000).allowed).toBe(false);
    expect(checkRateLimit(store, "ip:b", 1, DAY, 1000).allowed).toBe(true);
  });

  it("윈도우가 지나면 다시 허용한다", () => {
    const store = createMemoryStore();
    checkRateLimit(store, "ip:a", 1, DAY, 1000);
    expect(checkRateLimit(store, "ip:a", 1, DAY, 1000).allowed).toBe(false);
    expect(checkRateLimit(store, "ip:a", 1, DAY, 1000 + DAY + 1).allowed).toBe(true);
  });
});
