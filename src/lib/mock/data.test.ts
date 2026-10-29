import { describe, expect, it } from "vitest";
import { CHAT_CASES, MAIN_CHAT_CASE_IDS, MOCK_ENTRIES } from "./data";

describe("미리보기 가짜 데이터", () => {
  it("채팅 블록이 가리키는 기록이 모두 있다", () => {
    for (const c of CHAT_CASES) {
      for (const m of c.messages) {
        for (const b of m.blocks) {
          const ids = "entryIds" in b ? b.entryIds : [];
          for (const id of ids) expect(c.entries[id], `${c.id} → ${id}`).toBeDefined();
        }
      }
    }
  });

  it("메인 대화에 쓰는 케이스가 모두 있다", () => {
    for (const id of MAIN_CHAT_CASE_IDS) expect(CHAT_CASES.some((c) => c.id === id)).toBe(true);
  });

  it("조회 상담 근거 카드의 건수가 기록과 일치한다", () => {
    const lookup = CHAT_CASES.find((c) => c.id === "consult-lookup")!;
    const evidence = lookup.messages[1].blocks.find((b) => b.type === "evidence");
    expect(evidence?.type).toBe("evidence");
    if (evidence?.type !== "evidence") return;
    expect(evidence.summary.startsWith(`배변 ${evidence.entryIds.length}건`)).toBe(true);
    const ids = new Set(MOCK_ENTRIES.map((e) => e.id));
    for (const id of evidence.entryIds) expect(ids.has(id)).toBe(true);
  });
});
