import { describe, expect, it } from "vitest";
import { findPlotAnnotations } from "@/lib/plot-annotations";
describe("Plot annotation hints", () => {
  it("marks both roots and the local minimum of a quadratic", () => {
    const points = findPlotAnnotations((x) => x * x - 1, -3, 3);
    const roots = points.filter((p) => p.kind === "Raiz").sort((a, b) => a.x - b.x);
    expect(roots).toHaveLength(2); expect(roots[0]?.x).toBeCloseTo(-1, 5); expect(roots[1]?.x).toBeCloseTo(1, 5);
    const min = points.find((p) => p.kind === "Mín. local"); expect(min?.x).toBeCloseTo(0, 4); expect(min?.y).toBeCloseTo(-1, 5);
  });
  it("marks a local maximum", () => { const max = findPlotAnnotations((x) => -x * x, -2, 2).find((p) => p.kind === "Máx. local"); expect(max?.y).toBeCloseTo(0, 5); });
  it("does not mark a vertical asymptote as a root", () => { expect(findPlotAnnotations((x) => 1 / (x - 0.123), -1, 1)).toEqual([]); });
  it("does not mark a constant zero curve with isolated roots", () => { expect(findPlotAnnotations(() => 0, -1, 1)).toEqual([]); });
});