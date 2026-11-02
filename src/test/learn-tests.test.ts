import { describe, it, expect } from "vitest";
import { LEARN } from "@/lib/learn-content";
import { GRAPH_TESTS, applyGraphTest } from "@/lib/learn-tests";
import { getModuleState, clearModuleState } from "@/lib/module-state";

describe("Testar no Gráfico", () => {
  it("every solved example has a graph test", () => {
    const missing = LEARN.flatMap((m) => m.topics).filter((t) => !GRAPH_TESTS[t.id]).map((t) => t.id);
    expect(missing).toEqual([]);
  });
  it("includes the new advanced topics", () => {
    const ids = LEARN.flatMap((m) => m.topics.map((t) => t.id));
    for (const id of ["aprox-linear", "otimizacao-aplicada", "improprias", "taylor", "polares", "vetorial"]) expect(ids).toContain(id);
  });
  it("pre-fills the Limites module with sin(x)/x at c = 0", () => {
    clearModuleState();
    expect(applyGraphTest(GRAPH_TESTS["confronto"]!)).toBe("/limites");
    expect(getModuleState("limites.expr")).toBe("sin(x)/x");
    expect(getModuleState("limites.cS")).toBe("0");
  });
});
