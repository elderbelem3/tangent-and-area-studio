import { describe, expect, it } from "vitest";
import { findTableRoots, polynomialDegree } from "@/lib/table-roots";
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
    expect(findTableRoots("x^200-1")).toEqual({ roots: [], status: "unverified", degree: null });
  });
  it("distingue função nula de ausência de raízes", () => {
    expect(findTableRoots("x-x")).toEqual({ roots: [], status: "continuum", degree: null });
    expect(findTableRoots("5")).toEqual({ roots: [], status: "complete", degree: 0 });
  });
});

describe("identificação do grau do polinômio após simplificação", () => {
  it.each([
    ["x^3 + 2x^7 - 5x^2 + x", 7],
    ["4x^2 + 3x^8 - x^5 + 7x^{10} - 2", 10],
    ["x³ + x⁷ + x²", 7],
    ["2x⁴ + 5x⁹ - x²", 9],
    ["x² + 3x⁶ + 2x¹⁰", 10],
    ["5x + 3x⁸ - 2", 8],
    ["7x¹² - 4x³ + x⁵", 12],
    ["4x² + 3x⁸ - x⁵ + 7x¹⁰", 10],
    ["2x¹² - 5x³ + x⁶", 12],
    ["x⁷ - x⁷ + 3x³", 3],
    ["5x + 2x⁹ - 4", 9],
    ["0*x^11 + 4x^2 - 1", 2],
  ] as [string, number][]) ("identifica o maior expoente não nulo de %s como grau %i", (expression, expectedDegree) => {
    expect(polynomialDegree(expression)).toBe(expectedDegree);
    const result = findTableRoots(expression);
    expect(result.status).toBe("complete");
    expect(result.degree).toBe(expectedDegree);
  });

  it.each([
    ["x³ + x⁷ + x²", [-0.7548776662466992, 0, 0]],
    ["4x² + 3x⁸ - x⁵ + 7x¹⁰", [0, 0]],
    ["2x¹² - 5x³ + x⁶", [0, 0, 0, 1.072825335142845]],
    ["x⁷ - x⁷ + 3x³", [0, 0, 0]],
    ["5x + 2x⁹ - 4", [0.7643713367382432]],
    ["x^3 + 2x^7 - 5x^2 + x", [0, 0.2087482653103855, 1.084000749418737]],
    ["4x^2 + 3x^8 - x^5 + 7x^{10} - 2", [-0.6504740378164351, 0.6813025652053974]],
  ] as [string, number[]][]) ("encontra todas as raízes reais com multiplicidade para %s em F(x) = 0", (expression, expectedRoots) => {
    const result = findTableRoots(expression);
    expect(result.status).toBe("complete");
    expect(result.roots).toHaveLength(expectedRoots.length);
    result.roots.forEach((value, i) => expect(value).toBeCloseTo(expectedRoots[i] ?? NaN, 6));
  });
});