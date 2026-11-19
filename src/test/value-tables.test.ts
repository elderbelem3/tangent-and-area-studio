import { describe, expect, it } from "vitest";
import { MAX_TABLE_ROWS, formatTableNumber, addTableRow, emptyRows, tableRows, writeRows, type TablesState } from "@/lib/value-tables";
import { solveForX } from "@/lib/inverse";

describe("tabela de valores — estado por função", () => {
  it("começa com uma linha vazia", () => {
    expect(tableRows(undefined, "x^2", "fx")).toEqual([""]);
  });

  it("invalida os dados apenas da função cuja expressão mudou", () => {
    let tables: TablesState = {};
    tables = writeRows(tables, 0, "x^2", "fx", ["1", "2"]);
    tables = writeRows(tables, 1, "2x", "fx", ["3"]);
    // Expressão do slot 0 mudou: suas linhas são descartadas…
    expect(tableRows(tables[0], "x^3", "fx")).toEqual([""]);
    // …mas as do slot 1 permanecem intactas.
    expect(tableRows(tables[1], "2x", "fx")).toEqual(["3"]);
  });

  it("mantém as duas modalidades independentes na mesma função", () => {
    let tables: TablesState = {};
    tables = writeRows(tables, 0, "x^2", "fx", ["1", "2"]);
    tables = writeRows(tables, 0, "x^2", "x", ["4"]);
    expect(tableRows(tables[0], "x^2", "fx")).toEqual(["1", "2"]);
    expect(tableRows(tables[0], "x^2", "x")).toEqual(["4"]);
  });

  it("limita as linhas a 5 valores", () => {
    let rows = emptyRows();
    for (let i = 0; i < 10; i++) rows = addTableRow(rows);
    expect(rows).toHaveLength(MAX_TABLE_ROWS);
  });
});

describe("apresentação com até três casas decimais", () => {
  it.each([[2.123456, "2.123"], [3.5, "3.5"], [4, "4"], [-1.234567, "-1.235"], [7.1239, "7.124"], [-0.00001, "0"]])("formata %s sem zeros desnecessários", (value, expected) => {
    expect(formatTableNumber(Number(value))).toBe(expected);
  });
  it("preserva a precisão interna", () => {
    const roots = solveForX("x^2", 2);
    const root = roots[1];
    expect(root).toBeDefined();
    if (root === undefined) throw new Error("Missing root");
    expect(formatTableNumber(root)).toBe("1.414");
    expect(root * root).toBeCloseTo(2, 9);
  });
});

describe("tabela de valores — encontrar x a partir de f(x)", () => {
  it("encontra as duas soluções de x^2 = 4", () => {
    const roots = solveForX("x^2", 4);
    expect(roots.length).toBe(2);
    expect(roots[0]).toBeCloseTo(-2, 6);
    expect(roots[1]).toBeCloseTo(2, 6);
  });

  it("não inventa solução quando não existe", () => {
    expect(solveForX("x^2", -1)).toEqual([]);
  });

  it("resolve a função linear 2x+1 = 7 em x = 3", () => {
    const roots = solveForX("2x+1", 7);
    expect(roots.length).toBe(1);
    expect(roots[0]).toBeCloseTo(3, 6);
  });
});
