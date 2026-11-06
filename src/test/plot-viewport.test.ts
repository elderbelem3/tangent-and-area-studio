import { describe, expect, it } from "vitest";
import { axisTicks, axisLabel, transformedDomain, plotCoordinate } from "../lib/plot-viewport";
const base = { xMin: -10, xMax: 10, yMin: -5, yMax: 5 };
const rect = { left: 50, top: 20, width: 400, height: 200 };
describe("cartesian navigation", () => {
  it("zooms both axes keeping the cursor anchor fixed", () => {
    const anchor = { x: 150, y: 70 };
    const next = transformedDomain(base, rect, { k: 2, x: -anchor.x, y: -anchor.y });
    expect(next.xMax - next.xMin).toBe(10);
    expect(next.yMax - next.yMin).toBe(5);
    expect(plotCoordinate(next, rect, anchor.x, anchor.y)).toEqual(plotCoordinate(base, rect, anchor.x, anchor.y));
  });
  it("pans without changing the scale", () => {
    expect(transformedDomain(base, rect, { k: 1, x: 40, y: 20 })).toEqual({ xMin: -12, xMax: 8, yMin: -4, yMax: 6 });
  });
  it("adapts tick divisions to finer zoom", () => {
    expect(axisTicks(-10, 10)).toEqual([-10, -5, 0, 5, 10]);
    expect(axisTicks(-0.01, 0.01)).toEqual([-0.01, -0.005, 0, 0.005, 0.01]);
    expect(axisLabel(0.005, 0.02)).toBe("0.005");
  });
});