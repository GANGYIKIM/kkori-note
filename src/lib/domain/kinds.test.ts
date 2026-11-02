import { describe, expect, it } from "vitest";
import {
  DEFAULT_KINDS,
  checkValues,
  fieldLabel,
  findKind,
  isEpisodeKind,
  kindLabel,
  missingCoreFields,
  optionLabel,
  type KindDef,
} from "./kinds";

const poop = findKind("poop") as KindDef;
const pickedUp = findKind("picked_up") as KindDef;

describe("DEFAULT_KINDS", () => {
  it("기본 종류 9개와 항목이 정해진 대로다", () => {
    const shape = DEFAULT_KINDS.map((k) => [k.id, k.episode, k.fields.map((f) => f.id)]);
    expect(shape).toEqual([
      ["poop", false, ["stoolState", "count", "detail"]],
      ["meal", false, ["detail"]],
      ["snack", false, ["detail"]],
      ["walk", false, ["detail"]],
      ["picked_up", false, ["riskFood", "chocolateType", "amountG", "detail"]],
      ["limp", true, ["intensity", "detail"]],
      ["seizure", true, ["intensity", "detail"]],
      ["thunder_fear", true, ["intensity", "detail"]],
      ["note", false, ["detail"]],
    ]);
  });

  it("종류 id, 종류 안의 항목 id, 항목 안의 값 id가 겹치지 않는다", () => {
    const unique = (ids: string[]) => new Set(ids).size === ids.length;
    expect(unique(DEFAULT_KINDS.map((k) => k.id))).toBe(true);
    for (const kind of DEFAULT_KINDS) {
      expect(unique(kind.fields.map((f) => f.id))).toBe(true);
      for (const field of kind.fields) {
        if (field.type === "choice") expect(unique(field.options.map((o) => o.id))).toBe(true);
      }
    }
  });

  it("기본 종류는 모두 지울 수 없는 종류다", () => {
    expect(DEFAULT_KINDS.every((k) => k.system)).toBe(true);
  });
});

describe("checkValues", () => {
  it("정의 안의 값은 통과한다", () => {
    expect(checkValues(poop, { stoolState: "soft", count: 3, detail: "아침" })).toEqual({
      ok: true,
      values: { stoolState: "soft", count: 3, detail: "아침" },
    });
    expect(checkValues(pickedUp, { riskFood: "chocolate", amountG: 12 }).ok).toBe(true);
  });

  it("정의에 없는 항목을 거부한다", () => {
    expect(checkValues(poop, { intensity: "high" })).toEqual({ ok: false, invalidFieldIds: ["intensity"] });
  });

  it("값 목록 밖의 값을 거부한다", () => {
    expect(checkValues(poop, { stoolState: "흐물흐물" })).toEqual({ ok: false, invalidFieldIds: ["stoolState"] });
  });

  it("범위 밖이거나 정수가 아닌 숫자를 거부한다", () => {
    expect(checkValues(poop, { count: 0 }).ok).toBe(false);
    expect(checkValues(poop, { count: 11 }).ok).toBe(false);
    expect(checkValues(poop, { count: 1.5 }).ok).toBe(false);
    expect(checkValues(pickedUp, { amountG: 5001 }).ok).toBe(false);
    expect(checkValues(pickedUp, { amountG: 12.5 }).ok).toBe(false);
  });

  it("길이를 넘는 텍스트를 거부한다", () => {
    expect(checkValues(poop, { detail: "가".repeat(201) })).toEqual({ ok: false, invalidFieldIds: ["detail"] });
  });
});

describe("라벨", () => {
  it("정의에 있으면 라벨을 돌려준다", () => {
    expect(kindLabel("thunder_fear")).toBe("천둥 떨림");
    expect(fieldLabel(poop, "stoolState")).toBe("상태");
    expect(optionLabel(poop, "stoolState", "soft")).toBe("무름");
  });

  it("정의에서 빠진 종류·항목·값은 id를 그대로 돌려준다", () => {
    expect(kindLabel("removed_kind")).toBe("removed_kind");
    expect(fieldLabel(poop, "removedField")).toBe("removedField");
    expect(optionLabel(poop, "stoolState", "mucus")).toBe("mucus");
    expect(optionLabel(findKind("removed_kind"), "stoolState", "soft")).toBe("soft");
  });
});

describe("isEpisodeKind", () => {
  it("정의의 에피소드 여부를 읽는다", () => {
    expect(isEpisodeKind("seizure")).toBe(true);
    expect(isEpisodeKind("poop")).toBe(false);
    expect(isEpisodeKind("removed_kind")).toBe(false);
  });
});

describe("핵심 항목과 기본값", () => {
  it("정의의 core·askHint·defaultValue가 정해진 대로다", () => {
    const marked = DEFAULT_KINDS.flatMap((k) =>
      k.fields
        .filter((f) => f.core || f.askHint !== undefined || (f.type === "number" && f.defaultValue !== undefined))
        .map((f) => [k.id, f.id, f.core, f.askHint, f.type === "number" ? f.defaultValue : undefined]),
    );
    expect(marked).toEqual([
      ["poop", "stoolState", true, "상태(무른지, 딱딱한지)", undefined],
      ["poop", "count", false, undefined, 1],
      ["picked_up", "riskFood", true, "무엇을 먹었는지", undefined],
    ]);
  });

  it("missingCoreFields는 값이 없는 핵심 항목만 준다", () => {
    expect(missingCoreFields("poop", {}).map((f) => f.id)).toEqual(["stoolState"]);
    expect(missingCoreFields("poop", { stoolState: "soft" })).toEqual([]);
    expect(missingCoreFields("meal", {})).toEqual([]);
    expect(missingCoreFields("unknown_kind", {})).toEqual([]);
  });
});
