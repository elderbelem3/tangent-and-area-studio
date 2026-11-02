import { describe, expect, it } from "vitest";
import { addComparisonFunction, removeComparisonFunction, type ComparisonFunction } from "@/lib/comparison";

describe("Function comparison rules", () => {
  const initial: ComparisonFunction[] = [{ slot: 0, expression: "x^2" }];
  it("starts with the principal function and adds one blank function per click", () => {
    expect(initial).toEqual([{ slot: 0, expression: "x^2" }]);
    expect(addComparisonFunction(initial)).toEqual([...initial, { slot: 1, expression: "" }]);
  });
  it("never adds more than five active functions", () => {
    let functions = initial;
    for (let i = 0; i < 10; i++) functions = addComparisonFunction(functions);
    expect(functions).toHaveLength(5);
    expect(functions.map((item) => item.slot)).toEqual([0, 1, 2, 3, 4]);
  });
  it("removes an additional function independently and permits adding again", () => {
    let functions = initial;
    for (let i = 0; i < 4; i++) functions = addComparisonFunction(functions);
    const remaining = removeComparisonFunction(functions, 2);
    expect(remaining.map((item) => item.slot)).toEqual([0, 1, 3, 4]);
    expect(addComparisonFunction(remaining).map((item) => item.slot)).toEqual([0, 1, 3, 4, 2]);
  });
  it("keeps the principal function when removal is requested", () => {
    expect(removeComparisonFunction(initial, 0)).toEqual(initial);
  });
});