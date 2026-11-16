import { describe, expect, it } from "vitest";
import { STRESS_CASES, STRESS_PILLARS, STRESS_TOLERANCE, compareStressResult, executeStressCase, runStressBattery } from "@/lib/stress-test";

describe("Bateria de validação algorítmica", () => {
  it("contains exactly the four pillars and dozens of independent analytic cases", () => {
    expect(STRESS_PILLARS).toEqual(["Funções", "Limites", "Derivadas", "Integrais"]);
    expect(STRESS_CASES).toHaveLength(64);
    for (const pillar of STRESS_PILLARS) expect(STRESS_CASES.filter((t) => t.pillar === pillar)).toHaveLength(16);
    expect(new Set(STRESS_CASES.map((t) => t.id)).size).toBe(64);
  });
  it("uses strict absolute tolerance of 10⁻⁴ without a magnitude multiplier", () => {
    expect(STRESS_TOLERANCE).toBe(0.0001);
    expect(compareStressResult(0.0001, 0)).toBe(true);
    expect(compareStressResult(0.00010001, 0)).toBe(false);
    expect(compareStressResult(1e6 + 0.001, 1e6)).toBe(false);
  });
  it("compares exceptional answers explicitly instead of accepting nonfinite numbers", () => {
    expect(compareStressResult(Infinity, Infinity)).toBe(true);
    expect(compareStressResult(-Infinity, Infinity)).toBe(false);
    expect(compareStressResult(NaN, NaN)).toBe(false);
    expect(compareStressResult("erro", "indefinido")).toBe(false);
    expect(compareStressResult("indefinido", "indefinido")).toBe(true);
    expect(compareStressResult("integral rejeitada", 0)).toBe(false);
  });
  it.each(STRESS_PILLARS)("executes real %s cases without changing their answers", (pillar) => {
    const results = STRESS_CASES.filter((t) => t.pillar === pillar).map(executeStressCase);
    expect(results.every((r) => r.elapsed >= 0)).toBe(true);
    const known = results.find((r) => r.test === STRESS_CASES.find((t) => t.pillar === pillar));
    expect(known?.passed).toBe(true);
    for (const result of results) expect(result.passed).toBe(compareStressResult(result.actual, result.test.expected));
  });
  it("reports a wrong independent answer as a divergence, never substitutes the answer", () => {
    const test = STRESS_CASES[0];
    if (!test) throw new Error("Missing analytic test");
    const result = executeStressCase({ ...test, expected: 99 });
    expect(result.actual).toBe(5);
    expect(result.passed).toBe(false);
    expect(result.error).toBe(94);
  });
  it("finishes every case and publishes complete progress even when a case diverges", async () => {
    let count = 0;
    const results = await runStressBattery((batch) => { count = batch.length; });
    expect(count).toBe(64);
    expect(results).toHaveLength(64);
    expect(results.find((r) => r.test.expression === "1/(x-0.123)^2")?.actual).toBe("integral rejeitada");
  });
});