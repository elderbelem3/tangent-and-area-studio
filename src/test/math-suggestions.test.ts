import { describe, expect, it } from "vitest";
import { mathSuggestions } from "@/lib/math-suggestions";
import { parseFn } from "@/lib/calc";

describe("Contextual math completion", () => {
  it("offers logarithms with valid bases", () => {
    const items = mathSuggestions("2+log")?.suggestions ?? [];
    expect(items.map((i) => i.label)).toEqual(["log_2(x)", "ln(x)", "log10(x)"]);
    expect(parseFn(items[0]?.expression ?? "").fn?.(8)).toBeCloseTo(3);
    expect(parseFn("log_2(x)").fn?.(8)).toBeCloseTo(3);
  });
  it("completes sine without replacing preceding terms", () => {
    expect(mathSuggestions("x+sin")?.start).toBe(2);
    expect(mathSuggestions("x+sin")?.suggestions[0]?.expression).toBe("sin(x)");
  });
  it("offers square and cube for an empty power", () => {
    expect(mathSuggestions("x^")?.suggestions.map((i) => i.expression)).toEqual(["x^2", "x^3"]);
    expect(mathSuggestions("x^()")?.suggestions.map((i) => i.expression)).toEqual(["x^2", "x^3"]);
  });
  it("does not offer suggestions for completed or unrelated tokens", () => {
    expect(mathSuggestions("sin(x)+2")).toBeNull();
    expect(mathSuggestions("abc")).toBeNull();
  });
});