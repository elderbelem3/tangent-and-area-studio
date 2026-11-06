import { describe, expect, it } from "vitest";
import { curveChartRows, curveSegments, plotSampleCount, plotSamples, sampleCurve } from "@/lib/plot-sampling";

describe("Discontinuity-safe zoom sampling", () => {
  it("cuts jumps above three visible Y heights and keeps the restart point", () => {
    const points = sampleCurve((x) => x < 0 ? -31 : 31, [-1, 1, 2], -10, 10);
    expect(points[1]?.breakBefore).toBe(true);
    expect(curveSegments(points)).toEqual([[{ x: -1, y: -31 }], [{ x: 1, y: 31 }, { x: 2, y: 31 }]]);
  });
  it("creates a curve-specific separator without dropping points or breaking other curves", () => {
    const xs = [-0.1, 0.1, 0.2];
    const rows = curveChartRows(xs, [
      { key: "rational", points: sampleCurve((x) => 1 / x, xs, -100, 100) },
      { key: "continuous", points: sampleCurve((x) => x, xs, -100, 100) },
    ]);
    expect(rows).toEqual([
      { x: -0.1, rational: -10, continuous: -0.1 },
      { x: 0.1, rational: null, continuous: 0.1 },
      { x: 0.1, rational: 10, continuous: 0.1 },
      { x: 0.2, rational: 5, continuous: 0.2 },
    ]);
  });
  it("never connects a rational subpath across either vertical pole", () => {
    for (const span of [6, 60, 600]) {
      const segments = curveSegments(sampleCurve((x) => (2 * x + 3) / (x * x - 1), plotSamples(-span / 2 + 0.017, span / 2 + 0.017, 6), -1000, 1000));
      expect(segments.length).toBeGreaterThanOrEqual(3);
      for (const segment of segments) {
        const first = segment[0], last = segment[segment.length - 1];
        for (const pole of [-1, 1]) expect(first && last && first.x < pole && last.x > pole).toBe(false);
      }
    }
  });
  it("increases resolution proportionally on zoom out within a safe budget", () => {
    expect(plotSampleCount(6, 6)).toBe(600);
    expect(plotSampleCount(24, 6)).toBe(2400);
    expect(plotSampleCount(6000, 6)).toBe(2400);
    expect(plotSamples(-12, 12, 6)).toHaveLength(2401);
  });
  it("bounds the total sampling budget for five simultaneous curves", () => {
    expect(plotSampleCount(6000, 6, 5)).toBe(480);
    expect(plotSampleCount(6, 6, 5) * 5).toBeLessThanOrEqual(2400);
  });
  it("rejects unsafe jumps immediately without midpoint evaluation", () => {
    let evaluations = 0;
    const points = sampleCurve((x) => { evaluations++; return 1 / x; }, [-0.001, 0.001], -10, 10);
    expect(points[1]?.breakBefore).toBe(true);
    expect(evaluations).toBe(2);
  });
  it("breaks an off-grid pole even when zoomed-out y range masks the jump", () => {
    const points = sampleCurve((x) => 1 / (x - 0.137), [0.1, 0.2], -10000, 10000);
    expect(points[1]?.breakBefore).toBe(true);
  });
  it("breaks division by zero and large consecutive vertical jumps", () => {
    expect(sampleCurve((x) => 1 / x, [-0.1, 0, 0.1], -10, 10)[1]?.y).toBeNull();
    expect(sampleCurve((x) => 1 / x, [-0.001, 0.001], -10, 10)[1]?.breakBefore).toBe(true);
  });
  it("keeps ordinary sign-changing roots continuous", () => {
    const points = sampleCurve((x) => Math.sin(x), [-0.1, 0.1], -1000, 1000);
    expect(points[1]?.breakBefore).toBe(false);
    expect(points[1]?.y).toBeCloseTo(Math.sin(0.1), 12);
  });
  it("detects a same-sign pole between samples", () => {
    expect(sampleCurve((x) => 1 / (x * x), [-0.1, 0.1], -1000, 1000)[1]?.breakBefore).toBe(true);
  });
  it("splits every branch around both rational poles at broad zoom", () => {
    const points = sampleCurve((x) => (2 * x + 3) / (x * x - 1), plotSamples(-30.017, 29.983, 6), -1000, 1000);
    for (const pole of [-1, 1]) {
      const index = points.findIndex((point) => point.x > pole);
      expect(index).toBeGreaterThan(0);
      expect(points[index]?.breakBefore).toBe(true);
    }
  });
});