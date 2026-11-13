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
describe("Infinity handling", () => {
  it.each(["infinity", "Infinity", "∞", "INFINITY"])("parses %s as the infinity constant", (token) => {
    const parsed = parseFn(`1/(x + ${token})`);
    expect(parsed.error).toBeNull();
    expect(parsed.fn?.(1)).toBe(0);
  });
  it("keeps implicit multiplication with infinity", () => {
    expect(normalize("2infinity")).toBe("2*Infinity");
  });
  it("num() accepts infinity spellings and signs", async () => {
    const { num } = await import("@/components/Lab");
    expect(num("infinity")).toBe(Infinity);
    expect(num("-infinity")).toBe(-Infinity);
    expect(num("∞")).toBe(Infinity);
    expect(num("-∞")).toBe(-Infinity);
    expect(num("inf")).toBe(Infinity);
    expect(num("2")).toBe(2);
    expect(num("abc")).toBeNull();
  });
  it("evaluates limits at +∞ and −∞ with a single approach side", async () => {
    const { evaluateLimit } = await import("@/lib/limits");
    const pos = evaluateLimit("1/x", Infinity);
    expect(pos.L).toBeCloseTo(0, 4);
    expect(pos.left.length).toBeGreaterThan(0);
    expect(pos.right.length).toBe(0);
    const neg = evaluateLimit("x^2", -Infinity);
    expect(neg.L).toBe(Infinity);
    expect(neg.right.length).toBeGreaterThan(0);
    expect(neg.left.length).toBe(0);
  });
  it("limitSteps explains the infinite case instead of substituting a point", async () => {
    const { limitSteps } = await import("@/lib/uv-steps");
    const steps = limitSteps("1/x", Infinity, 0, 0, NaN);
    expect(steps?.[0]?.title).toContain("infinito");
    expect(steps?.[1]?.lines[0]).toContain("lim f(x) = 0");
  });
});
