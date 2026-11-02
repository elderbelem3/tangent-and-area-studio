import { describe, expect, it } from "vitest";
import { analyzeFunction } from "@/lib/analysis";
describe("analyzeFunction", () => {
  const a = analyzeFunction("x^3 - 3x", -3, 3)!;
  it("finds critical points of x^3-3x", () => {
    expect(a.critical.map((c) => Math.round(c.x))).toEqual([-1, 1]);
    expect(a.critical[0]!.kind).toBe("Máximo local"); expect(a.critical[1]!.kind).toBe("Mínimo local");
  });
  it("finds inflection at 0 and limits", () => {
    expect(a.inflections.map((p) => Math.round(p.x))).toEqual([0]);
    expect(a.limitPos).toBe("+∞"); expect(a.limitNeg).toBe("−∞");
  });
});
