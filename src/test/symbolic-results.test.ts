import { describe, expect, it } from "vitest";
import { parse, simplify } from "mathjs";
import { derivativeExpression, derivativeValues } from "@/lib/derivative-results";
import { indefiniteIntegral, definiteIntegral } from "@/lib/uv-steps";

const equivalent = (actual: string | null, expected: string) => {
  expect(actual).not.toBeNull();
  expect(simplify(`(${actual})-(${expected})`).toString()).toBe("0");
};

describe("symbolic results without numerical parameters", () => {
  it.each([["x^3", "3*x^2"], ["x^2+2x", "2*x+2"], ["5x", "5"]])("derives %s", (expression, expected) => {
    equivalent(derivativeExpression(expression), expected);
    expect(derivativeValues(expression, "")).toBeNull();
  });
  it("evaluates x^3 at 2 without changing its symbolic result", () => {
    expect(derivativeValues("x^3", "2")?.value).toBe(8);
    expect(derivativeValues("x^3", "2")?.slope).toBeCloseTo(12, 5);
    equivalent(derivativeExpression("x^3"), "3*x^2");
  });
  it("keeps evaluation independent when another function changes", () => {
    const second = derivativeValues("x^2", "3");
    expect(derivativeValues("x^3", "2")?.value).toBe(8);
    expect(derivativeValues("5x", "2")?.value).toBe(10);
    expect(derivativeValues("x^2", "3")).toEqual(second);
    expect(second?.value).toBe(9);
    expect(second?.slope).toBeCloseTo(6, 5);
  });
  it.each([["x^2", "x^3/3"], ["2x", "x^2"], ["5", "5*x"]])("integrates %s without bounds", (expression, expected) => {
    equivalent(indefiniteIntegral(expression), expected);
  });
  it("preserves the defined integral of x^2 from 0 to 3", () => {
    expect(definiteIntegral("x^2", 0, 3).value).toBe(9);
  });
  it("does not invent unsupported primitives", () => {
    expect(indefiniteIntegral("sin(x^2)")).toBeNull();
    expect(indefiniteIntegral("log(x,2)")).toBeNull();
  });
  it("retains symbolic fractions as exact expressions", () => {
    const primitive = indefiniteIntegral("x^2");
    expect(primitive && parse(primitive).evaluate({ x: 3 })).toBe(9);
  });
});