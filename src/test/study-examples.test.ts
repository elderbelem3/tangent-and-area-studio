import { describe, expect, it } from "vitest";
import { compile } from "mathjs";
import { derivative, integrate, normalize, parseFn } from "@/lib/calc";
import { functionExamples, limitExamples, derivativeExamples, integralExamples } from "@/lib/study-examples";

describe("Official study examples", () => {
  it.each([
    [0, "x^2 - 4x - 5", 2, -9],
    [1, "sin(x)", Math.PI / 2, 1],
    [2, "2^x", 3, 8],
    [3, "x^3 - 3x", 2, 2],
    [4, "(2x + 3) / (x^2 - 1)", 2, 7 / 3],
  ] as const)("loads function example %i with its correct calculation", (index, expression, x, result) => {
    expect(functionExamples[index]?.expression).toBe(expression);
    expect(parseFn(expression).fn?.(x)).toBeCloseTo(result, 10);
  });
  it("offers exactly one 3D example, the paraboloid", () => {
    const surfaces = functionExamples.filter((e) => /\by\b/.test(e.expression));
    expect(surfaces).toHaveLength(1);
    expect(surfaces[0]?.expression).toBe("x^2 + y^2");
    expect(compile(normalize(surfaces[0]?.expression ?? "")).evaluate({ x: 2, y: 3 })).toBe(13);
  });
  it.each([
    [0, "(x^2 - 4) / (x - 2)", 2, 4],
    [1, "(sqrt(x+1) - 1) / x", 0, 0.5],
    [2, "sin(x) / x", 0, 1],
  ] as const)("loads limit example %i at its study point", (index, expression, point, result) => {
    const example = limitExamples[index];
    expect(example?.expression).toBe(expression);
    expect(Number(example?.point)).toBe(point);
    const fn = parseFn(expression).fn;
    expect(fn?.(point - 1e-5)).toBeCloseTo(result, 4);
    expect(fn?.(point + 1e-5)).toBeCloseTo(result, 4);
  });
  it.each([
    [0, "x^3 - 4x", -1],
    [1, "sin(x)", Math.cos(1)],
    [2, "sin(3x)", 3 * Math.cos(3)],
  ] as const)("loads derivative example %i", (index, expression, result) => {
    expect(derivativeExamples[index]?.expression).toBe(expression);
    const fn = parseFn(expression).fn;
    expect(fn).not.toBeNull();
    if (fn) expect(derivative(fn, 1)).toBeCloseTo(result, 6);
  });
  it.each([
    [0, "2x * cos(x^2)"],
    [1, "(2x + 3) / (x^3 - 1)"],
    [2, "e^x"],
  ] as const)("loads integral example %i with a finite study interval", (index, expression) => {
    const example = integralExamples[index];
    expect(example?.expression).toBe(expression);
    const fn = parseFn(expression).fn;
    expect(fn).not.toBeNull();
    if (fn && example) {
      const value = integrate(fn, Number(example.a), Number(example.b));
      expect(Number.isFinite(value)).toBe(true);
      if (index === 0) expect(value).toBeCloseTo(Math.sin(1), 8);
      if (index === 2) expect(value).toBeCloseTo(Math.E - 1, 8);
    }
  });
});