import { describe, expect, it } from "vitest";
import { findTableRoots } from "@/lib/table-roots";
import { solveForX } from "@/lib/inverse";

describe("busca completa de raízes reais na tabela", () => {
  it.each([
    ["x^2-4", [-2, 2]],
    ["x^3-x", [-1, 0, 1]],
    ["x^5-5x^3+4x", [-2, -1, 0, 1, 2]],
    ["(x-2)^2*(x+1)^3", [-1, -1, -1, 2, 2]],
    ["x^2+1", []],
    ["(x-1)*(x-2)*(x-3)*(x-4)*(x-5)*(x-6)", [1, 2, 3, 4, 5, 6]],
    ["(x-2)^25", Array.from({ length: 25 }, () => 2)],
    ["(x^2+1)*(x-3)^2", [3, 3]],
    ["(x-100)*(x+120)", [-120, 100]],
    ["(x-1)*(x-1.0001)", [1, 1.0001]],
    ["x^2/2-2", [-2, 2]],
    ["0.00000000000001*x^2-1", [-10000000, 10000000]],
  ] as [string, number[]][]) ("resolve %s com multiplicidades e sem limite de cinco", (expression, expected) => {
    const result = findTableRoots(expression);
    expect(result.status).toBe("complete");
    expect(result.roots).toHaveLength(expected.length);
    result.roots.forEach((value, i) => expect(value).toBeCloseTo(expected[i] ?? NaN, 5));
  });
  it("mantém f(x)=5 no mecanismo anterior", () => {
    expect(solveForX("2*x+1", 5)).toEqual([2]);
  });
  it("não apresenta uma busca limitada como completa", () => {
    expect(findTableRoots("sin(x)").status).toBe("bounded");
  });
  it("informa quando ultrapassa a capacidade de verificação", () => {
    expect(findTableRoots("x^200-1")).toEqual({ roots: [], status: "unverified" });
  });
  it("distingue função nula de ausência de raízes", () => {
    expect(findTableRoots("x-x")).toEqual({ roots: [], status: "continuum" });
    expect(findTableRoots("5")).toEqual({ roots: [], status: "complete" });
  });
});