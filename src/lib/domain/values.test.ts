import { describe, expect, it } from "vitest";
import { DEFAULT_KINDS } from "./kinds";
import { KIND_STYLES, LABELS, MODES, RISK_GRADES, WEATHERS, kindStyle } from "./values";

describe("값 목록", () => {
  it("모든 값에 한글 라벨이 있다", () => {
    for (const w of WEATHERS) expect(LABELS.weather[w]).toBeTruthy();
    for (const m of MODES) expect(LABELS.mode[m]).toBeTruthy();
    for (const g of RISK_GRADES) expect(LABELS.riskGrade[g]).toBeTruthy();
  });

  it("기본 종류마다 색이 있고, 정의에 없는 종류는 메모 색을 쓴다", () => {
    for (const k of DEFAULT_KINDS) expect(KIND_STYLES[k.id]).toBeTruthy();
    expect(kindStyle("removed_kind")).toEqual(KIND_STYLES.note);
  });
});
