import { describe, expect, it } from "vitest";
import { invertFunction, solveForX } from "@/lib/inverse";
import { parseFn } from "@/lib/calc";
const check = (f: string, xs: number[]) => {
  const r = invertFunction(f); expect(r.error).toBeNull();
  const F = parseFn(f).fn!, G = parseFn(r.inverse!).fn!;
  for (const x of xs) expect(G(F(x))).toBeCloseTo(x, 6);
};
describe("inverse", () => {
  it("linear", () => check("2x+3", [-2, 0, 5]));
  it("exp", () => check("e^(x-1)", [0, 2]));
  it("cubic root", () => check("(x-1)^3", [-1, 3]));
  it("log", () => check("ln(2x)", [1, 4]));
  it("rejects repeated x", () => expect(invertFunction("x^2-x").inverse).toBeNull());
  it("solves x for y", () => expect(solveForX("x^2-4x-5", 0)).toEqual([-1, 5]));

  it("lista raízes repetidas com multiplicidade (grau 5 → 5 valores)", () => {
    expect(solveForX("(x-1)^2*(x-2)^3", 0)).toEqual([1, 1, 2, 2, 2]);
  });

  it("raiz dupla aparece duas vezes (x^2 = 0 → x₁ = x₂ = 0)", () => {
    expect(solveForX("x^2", 0)).toEqual([0, 0]);
  });

  it("polinômio com raízes mistas repete só as múltiplas", () => {
    expect(solveForX("(x+1)*(x-3)^2", 0)).toEqual([-1, 3, 3]);
  });

  it("detecta raiz de tangência em função não polinomial", () => {
    const roots = solveForX("abs(x-2)", 0);
    expect(roots).toHaveLength(1);
    expect(roots[0]).toBeCloseTo(2, 6);
  });
});
