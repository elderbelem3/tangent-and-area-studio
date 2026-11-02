import { describe, expect, it } from "vitest";
import { decodeTutorPlot, tutorPlotFunctions, validateTutorPlot } from "@/lib/tutor-plot";
import { tutorSolutionSchema, TUTOR_OUTPUT_SCHEMA } from "@/lib/tutor";
import { parseFn } from "@/lib/calc";

describe("Tutor graph transfer", () => {
  const suggestion = { funcoes: ["x^3 - 3*x"], intervalo: [-3, 3] };
  it("transfers the cubic and interval into graph state", () => {
    const { plot } = decodeTutorPlot(JSON.stringify(suggestion));
    expect(plot).toEqual(suggestion);
    if (!plot) throw new Error("Missing graph");
    expect(tutorPlotFunctions(plot)).toEqual([{ slot: 0, expression: "x^3 - 3*x" }]);
    expect(parseFn(plot.funcoes[0] ?? "").fn?.(2)).toBe(2);
  });
  it("rejects invalid parser expressions and nonnumeric relations", () => {
    for (const expr of ["sin(", "x <= 2", "y^2", "sqrt(-abs(x)-1)"]) expect(validateTutorPlot({ ...suggestion, funcoes: [expr] }).plot).toBeNull();
  });
  it("rejects intervals without finite increasing bounds", () => {
    for (const intervalo of [[3, -3], [3, 3], [-Infinity, 3]]) expect(validateTutorPlot({ ...suggestion, intervalo }).plot).toBeNull();
  });
  it("keeps all five comparison slots and rejects a sixth", () => {
    const five = { ...suggestion, funcoes: ["x", "x^2", "sin(x)", "cos(x)", "exp(x)"] };
    const result = validateTutorPlot(five); if (!result.plot) throw new Error("Missing graph");
    expect(tutorPlotFunctions(result.plot).map((f) => f.slot)).toEqual([0, 1, 2, 3, 4]);
    expect(validateTutorPlot({ ...five, funcoes: [...five.funcoes, "x^3"] }).plot).toBeNull();
  });
  it("rejects malformed graph links", () => { expect(decodeTutorPlot("{invalid").plot).toBeNull(); });
  it("preserves older session solutions without graph fields", () => {
    const step = { title: "Derivada", explanation: "Regra da potência", formula: "2x" };
    expect(tutorSolutionSchema.safeParse({ title: "Exemplo", steps: [step], conclusion: step }).success).toBe(true);
    expect(TUTOR_OUTPUT_SCHEMA.required).toContain("funcoes"); expect(TUTOR_OUTPUT_SCHEMA.required).toContain("intervalo");
  });
});