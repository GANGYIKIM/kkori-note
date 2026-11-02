import { describe, expect, it } from "vitest";
import { parseDuration, parseTime } from "./time-parse";

const SEOUL = "Asia/Seoul";
const NOW = "2026-11-02T05:00:00.000Z"; // 11/2 14:00 KST
const TODAY_START = "2026-11-01T15:00:00.000Z"; // 11/2 00:00 KST

describe("parseTime", () => {
  it("시각 표현이 없으면 none", () => {
    expect(parseTime("배변했어", NOW, SEOUL)).toEqual({ status: "none" });
  });

  it.each(["방금 배변했어", "지금 산책 나왔어"])("%s → 지금, exact", (text) => {
    expect(parseTime(text, NOW, SEOUL)).toEqual({
      status: "found",
      occurredAt: NOW,
      timePrecision: "exact",
      todayOnly: false,
    });
  });

  it.each([
    ["10분 전에 배변했어", "2026-11-02T04:50:00.000Z"],
    ["2시간 전에 밥 먹었어", "2026-11-02T03:00:00.000Z"],
    ["30 분 전 산책", "2026-11-02T04:30:00.000Z"],
  ])("%s → 그만큼 앞선 시각", (text, occurredAt) => {
    expect(parseTime(text, NOW, SEOUL)).toEqual({
      status: "found",
      occurredAt,
      timePrecision: "exact",
      todayOnly: false,
    });
  });

  it.each(["하루종일 설사했어", "하루 종일 설사", "종일 떨었어", "오늘 하루 3번 배변"])(
    "%s → 오늘 하루 전체",
    (text) => {
      expect(parseTime(text, NOW, SEOUL)).toEqual({
        status: "found",
        occurredAt: TODAY_START,
        timePrecision: "day",
        todayOnly: false,
      });
    },
  );

  it('시각 없이 "오늘"만 있으면 하루 전체이고 todayOnly', () => {
    expect(parseTime("오늘 설사했어", NOW, SEOUL)).toEqual({
      status: "found",
      occurredAt: TODAY_START,
      timePrecision: "day",
      todayOnly: true,
    });
  });

  it("KST 00:30의 하루종일은 KST 그날 0시다", () => {
    // 2026-11-01 15:30 UTC = 2026-11-02 00:30 KST
    expect(parseTime("하루종일", "2026-11-01T15:30:00.000Z", SEOUL)).toMatchObject({ occurredAt: TODAY_START });
  });

  it.each([
    "아까 배변했어",
    "어제 저녁쯤 설사",
    "그저께 산책",
    "오늘 아침에 밥",
    "점심에 간식",
    "오후에 산책",
    "밤에 떨었어",
    "새벽에 발작",
    "오전에 배변",
    "3시에 밥",
    "한 시간 전에 배변",
    "10분 전에 밥 먹고 방금 산책했어",
  ])("%s → unknown", (text) => {
    expect(parseTime(text, NOW, SEOUL)).toEqual({ status: "unknown" });
  });

  it("같은 시각을 두 번 말하면 하나로 본다", () => {
    expect(parseTime("방금 밥 먹고 지금 산책", NOW, SEOUL)).toMatchObject({ status: "found", occurredAt: NOW });
  });
});

describe("parseDuration", () => {
  it.each([
    ["2분쯤", 120],
    ["30초 동안", 30],
    ["1시간 정도", 3600],
    ["3분", 180],
  ])("%s → %i초", (text, durationSec) => {
    expect(parseDuration(`발작 ${text} 했어`)?.durationSec).toBe(durationSec);
  });

  it("'전'이 붙으면 지속시간이 아니다", () => {
    expect(parseDuration("10분 전에 발작")).toBeNull();
  });

  it("읽은 표현을 지운 문장을 준다", () => {
    expect(parseDuration("발작 2분쯤 했어")?.rest).not.toContain("쯤");
  });
});
