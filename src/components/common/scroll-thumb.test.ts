import { describe, expect, it } from "vitest";
import { scrollDeltaForDrag, scrollEdges, thumbMetrics } from "./scroll-thumb";

const box = { scrollHeight: 1000, clientHeight: 200 };

describe("thumbMetrics", () => {
  it("스크롤할 것이 없으면 null", () => {
    expect(thumbMetrics({ scrollTop: 0, scrollHeight: 200, clientHeight: 200, reversed: false })).toBeNull();
  });

  it("크기는 보이는 비율, 위치는 스크롤 위치를 따른다", () => {
    expect(thumbMetrics({ ...box, scrollTop: 0, reversed: false })).toEqual({ size: 40, offset: 0 });
    expect(thumbMetrics({ ...box, scrollTop: 400, reversed: false })).toEqual({ size: 40, offset: 80 });
    expect(thumbMetrics({ ...box, scrollTop: 800, reversed: false })).toEqual({ size: 40, offset: 160 });
  });

  it("reversed는 scrollTop 0이 아래 끝, 가장 작은 음수가 위 끝이다", () => {
    expect(thumbMetrics({ ...box, scrollTop: 0, reversed: true })).toEqual({ size: 40, offset: 160 });
    expect(thumbMetrics({ ...box, scrollTop: -400, reversed: true })).toEqual({ size: 40, offset: 80 });
    expect(thumbMetrics({ ...box, scrollTop: -800, reversed: true })).toEqual({ size: 40, offset: 0 });
  });

  it("막대는 24px보다 작아지지 않는다", () => {
    expect(thumbMetrics({ scrollTop: 0, scrollHeight: 100_000, clientHeight: 200, reversed: false })?.size).toBe(24);
  });

  it("범위를 넘는 scrollTop(바운스)은 끝에 붙는다", () => {
    expect(thumbMetrics({ ...box, scrollTop: -30, reversed: false })?.offset).toBe(0);
    expect(thumbMetrics({ ...box, scrollTop: 30, reversed: true })?.offset).toBe(160);
  });
});

describe("scrollDeltaForDrag", () => {
  it("막대를 트랙 끝까지 끌면 스크롤 범위 끝까지 간다", () => {
    expect(scrollDeltaForDrag(160, { ...box, size: 40 })).toBe(800);
    expect(scrollDeltaForDrag(-80, { ...box, size: 40 })).toBe(-400);
  });

  it("막대가 트랙을 다 차지하면 0", () => {
    expect(scrollDeltaForDrag(10, { scrollHeight: 300, clientHeight: 24, size: 24 })).toBe(0);
  });
});

describe("scrollEdges", () => {
  it("스크롤할 것이 없으면 둘 다 없다", () => {
    expect(scrollEdges({ scrollTop: 0, scrollHeight: 200, clientHeight: 200, reversed: false })).toEqual({
      top: false,
      bottom: false,
    });
  });

  it("보통 방향: 맨 위는 아래만, 가운데는 둘 다, 맨 아래는 위만", () => {
    expect(scrollEdges({ ...box, scrollTop: 0, reversed: false })).toEqual({ top: false, bottom: true });
    expect(scrollEdges({ ...box, scrollTop: 400, reversed: false })).toEqual({ top: true, bottom: true });
    expect(scrollEdges({ ...box, scrollTop: 800, reversed: false })).toEqual({ top: true, bottom: false });
  });

  it("reversed: scrollTop 0(맨 아래)은 위만, 가장 작은 음수(맨 위)는 아래만", () => {
    expect(scrollEdges({ ...box, scrollTop: 0, reversed: true })).toEqual({ top: true, bottom: false });
    expect(scrollEdges({ ...box, scrollTop: -800, reversed: true })).toEqual({ top: false, bottom: true });
  });
});
