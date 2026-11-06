import { describe, expect, it } from "vitest";
import { plotSampleCount, plotSamples, sampleCurve } from "@/lib/plot-sampling";

describe("Discontinuity-safe zoom sampling", () => {
  it("increases resolution proportionally on zoom out within a safe budget", () => {
    expect(plotSampleCount(6, 6)).toBe(600);
    expect(plotSampleCount(24, 6)).toBe(2400);
    expect(plotSampleCount(6000, 6)).toBe(12000);
    expect(plotSamples(-12, 12, 6)).toHaveLength(2401);
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