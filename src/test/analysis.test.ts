import { describe, expect, it } from "vitest";
import { analyzeFunction } from "@/lib/analysis";
describe("analyzeFunction", () => {
  it.each([["5", 5], ["sqrt(9)", 3], ["2", 2], ["0", 0]])("handles constant %s without enumerating stationary points", (expression, value) => {
    const result = analyzeFunction(String(expression), -3, 3);
    expect(result).toMatchObject({ constantValue: value, d1: "0", d2: "0", roots: [], critical: [], signs: [], inflections: [], domain: "ℝ", limitPos: String(value), limitNeg: String(value) });
  });
  it("does not mistake a sampled constant-looking function for a constant", () => {
    expect(analyzeFunction("sin(2*pi*x)", -3, 3)?.constantValue).toBeNull();
  });
  const a = analyzeFunction("x^3 - 3x", -3, 3)!;
  it("finds critical points of x^3-3x", () => {
    expect(a.critical.map((c) => Math.round(c.x))).toEqual([-1, 1]);
    expect(a.critical[0]!.kind).toBe("Máximo local"); expect(a.critical[1]!.kind).toBe("Mínimo local");
  });
  it("finds inflection at 0 and limits", () => {
    expect(a.inflections).toHaveLength(1); expect(a.inflections[0]!.x).toBeCloseTo(0, 3);
    expect(a.limitPos).toBe("+∞"); expect(a.limitNeg).toBe("−∞");
  });
});
