import { describe, expect, it } from "vitest";
import { derivativeSteps, integralSteps, limitSteps } from "@/lib/uv-steps";

const text = (s: { lines: string[]; title: string }[] | null) => (s ?? []).map((x) => x.title + " " + x.lines.join(" ")).join("\n");

describe("uv steps", () => {
  it.each(["5", "sqrt(9)", "2", "0"])("returns bounded zero-derivative steps for %s", (expression) => {
    const steps = derivativeSteps(expression);
    expect(steps).toHaveLength(3);
    expect(steps?.[1]?.lines[0]).toBe("f′(x) = 0 e f″(x) = 0 em todo o domínio ℝ.");
  });
  it("factors (x^2-1)/(x-1) at 1 to limit 2", () => {
    const t = text(limitSteps("(x^2-1)/(x-1)", 1, 2, 2, 2));
    expect(t).toContain("Fatoração");
    expect(t).toContain("= 2");
  });
  it("uses L'Hôpital for sin(x)/x", () => {
    expect(text(limitSteps("sin(x)/x", 0, 1, 1, 1))).toContain("L'Hôpital");
  });
  it("names product, quotient and chain rules", () => {
    expect(text(derivativeSteps("x*sin(x)"))).toContain("Produto");
    expect(text(derivativeSteps("x/(x+1)"))).toContain("Quociente");
    expect(text(derivativeSteps("sin(x^2)"))).toContain("Cadeia");
  });
  it("integrates x^2 on [0,2] via TFC = 8/3", () => {
    const t = text(integralSteps("x^2", 0, 2));
    expect(t).toContain("Teorema Fundamental");
    expect(t).toContain("2.666667");
  });
  it("uses parts for x*exp(x) and substitution for sin(2x)", () => {
    expect(text(integralSteps("x*exp(x)", 0, 1))).toContain("partes");
    expect(text(integralSteps("sin(2x)", 0, 1))).toContain("Substituição");
  });
});
