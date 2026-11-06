import { describe, expect, it } from "vitest";
import { normalize, parseFn } from "@/lib/calc";
import { asciiToMathjs } from "@/lib/math-blocks";

describe("Special functions and logarithm bases", () => {
  it.each(["log10(x)", "log_10(x)", "log_(10)(x)", "log_{10}(x)", "log10 (x)", "log(x, 10)"])("evaluates %s as a base-10 logarithm", (expression) => {
    const parsed = parseFn(expression);
    expect(parsed.error).toBeNull();
    expect(parsed.fn?.(100)).toBeCloseTo(2, 12);
  });
  it.each([
    ["ln (x)", Math.E, 1], ["log (x)", Math.E, 1],
    ["sin (x)", Math.PI / 2, 1], ["cos (x)", 0, 1], ["sqrt (x)", 9, 3],
  ] as const)("accepts ordinary parentheses in %s", (expression, x, expected) => {
    expect(parseFn(expression).fn?.(x)).toBeCloseTo(expected, 12);
  });
  it("preserves log10 identifiers while retaining implicit multiplication", () => {
    expect(normalize("2log10(x)+3x+2(x+1)")).toBe("2*log10(x)+3*x+2*(x+1)");
  });
  it("evaluates subscripted editor output through the real parser", () => {
    expect(parseFn(asciiToMathjs("log_(10)(x)")).fn?.(100)).toBeCloseTo(2, 12);
    expect(parseFn(asciiToMathjs("l o g _(10)(x)")).fn?.(100)).toBeCloseTo(2, 12);
  });
});