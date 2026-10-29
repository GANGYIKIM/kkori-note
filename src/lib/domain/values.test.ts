import { describe, expect, it } from "vitest";
import {
  CHOCOLATE_TYPES,
  ENTRY_KINDS,
  EPISODE_KINDS,
  INTENSITIES,
  LABELS,
  MODES,
  RISK_FOODS,
  RISK_GRADES,
  STOOL_STATES,
  WEATHERS,
  isEpisodeKind,
} from "./values";

describe("값 목록", () => {
  it("모든 값에 한글 라벨이 있다", () => {
    for (const k of ENTRY_KINDS) expect(LABELS.entryKind[k]).toBeTruthy();
    for (const s of STOOL_STATES) expect(LABELS.stoolState[s]).toBeTruthy();
    for (const i of INTENSITIES) expect(LABELS.intensity[i]).toBeTruthy();
    for (const w of WEATHERS) expect(LABELS.weather[w]).toBeTruthy();
    for (const m of MODES) expect(LABELS.mode[m]).toBeTruthy();
    for (const f of RISK_FOODS) expect(LABELS.riskFood[f]).toBeTruthy();
    for (const c of CHOCOLATE_TYPES) expect(LABELS.chocolateType[c]).toBeTruthy();
    for (const g of RISK_GRADES) expect(LABELS.riskGrade[g]).toBeTruthy();
  });

  it("에피소드 종류는 기록 종류의 부분집합이다", () => {
    for (const k of EPISODE_KINDS) expect(ENTRY_KINDS).toContain(k);
    expect(isEpisodeKind("seizure")).toBe(true);
    expect(isEpisodeKind("poop")).toBe(false);
  });
});
