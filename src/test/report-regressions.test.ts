import { describe, expect, it } from "vitest";
import { analyzeFunction } from "@/lib/analysis";
import { derivative, parseFn } from "@/lib/calc";
import { realDomain } from "@/lib/domain";
import { evaluateLimit } from "@/lib/limits";
import { tangentExpression } from "@/lib/math-format";
import { definiteIntegral, derivativeSteps, limitSteps } from "@/lib/uv-steps";

describe("Uploaded mathematical report regressions", () => {
  it("excludes zero from 1/x regardless of sampled endpoints", () => {
    expect(analyzeFunction("1/x", -5.66, 8.12)?.domain).toBe("ℝ ∖ {0}");
  });
  it.each(["1/x", "-(1/x^2)"])("splits monotonicity across zero for %s", (expression) => {
    const signs = analyzeFunction(expression, -3.305, 4.856)?.signs;
    expect(signs?.map((s) => [s.from, s.to, s.sign])).toEqual(expression === "1/x" ? [[-3.305, 0, "−"], [0, 4.856, "−"]] : [[-3.305, 0, "−"], [0, 4.856, "+"]]);
  });
  it("retains logarithm and square root real restrictions", () => {
    expect(realDomain("log(x)", -3, 3).contains(-1)).toBe(false);
    expect(realDomain("log(x)", -3, 3).contains(0)).toBe(false);
    expect(realDomain("sqrt(x)", -3, 3).contains(0)).toBe(true);
    expect(realDomain("sqrt(x)", -3, 3).contains(-1)).toBe(false);
  });
  it("locates the periodic poles of tan", () => {
    expect(realDomain("tan(x)", -2, 2).poles).toEqual([-Math.PI / 2, Math.PI / 2]);
  });
  it("does not claim L'Hôpital for abs(x)/x", () => {
    const result = evaluateLimit("abs(x)/x", 0);
    expect(result.L1).toBe(-1); expect(result.L2).toBe(1); expect(result.L).toBeNaN();
    const steps = limitSteps("abs(x)/x", 0, result.L, result.L1, result.L2);
    expect(steps?.some((s) => s.title.includes("Regra de L'Hôpital"))).toBe(false);
  });
  it("recognizes the nonexistence of both sin(1/x) side limits", () => {
    const result = evaluateLimit("sin(1/x)", 0);
    expect(result.oscillation).not.toBeNull(); expect(result.L1).toBeNaN(); expect(result.L2).toBeNaN();
    expect(evaluateLimit("x^2*sin(1/x)", 0).L).toBeCloseTo(0, 6);
  });
  it("distinguishes scalar multiplication from constant differentiation", () => {
    expect(derivativeSteps("x^3-3x")?.some((s) => s.lines.some((l) => l.includes("múltiplo constante")))).toBe(true);
    expect(derivativeSteps("5")?.[1]?.lines[0]).toContain("f′(x) = 0");
  });
  it("rejects a cusp but preserves abs(x^2) derivative", () => {
    const cusp = parseFn("abs(x)").fn, smooth = parseFn("abs(x^2)").fn;
    expect(cusp && derivative(cusp, 0)).toBeNaN();
    expect(smooth && derivative(smooth, 0)).toBeCloseTo(0, 6);
  });
  it("rejects 1/x derivative at zero", () => {
    const fn = parseFn("1/x").fn;
    expect(fn && derivative(fn, 0)).toBeNaN();
  });
  it.each([[0, -2, "-2"], [1, 0, "x"], [9, -16, "9 * x - 16"]] as const)("simplifies tangent coefficients %s and %s", (m, b, expected) => {
    expect(tangentExpression(m, b)).toBe(expected);
  });
  it.each(["1/x", "1/(x-0.3)", "1/(x-0.300123)"])("refuses the ordinary integral across the pole of %s", (expression) => {
    const result = definiteIntegral(expression, -1, 1);
    expect(result.value).toBeNaN(); expect(result.method).toBeNull(); expect(result.error).not.toBeNull();
  });
  it.each([
    ["3x^2+2x", 1, 3, 34], ["1/(x^2-1)", 2, 3, Math.log(1.5) / 2],
    ["sin(x)", 0, 2 * Math.PI, 0], ["x^2", 2, 0, -8 / 3],
  ] as const)("calculates %s from %s to %s", (expression, a, b, value) => {
    expect(definiteIntegral(expression, a, b).value).toBeCloseTo(value, 6);
  });
  it("reports the primitive as the method used for a polynomial", () => {
    expect(definiteIntegral("3x^2+2x", 1, 3).method).toBe("primitiva");
  });
});