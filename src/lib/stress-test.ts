import { derivative, parseFn } from "@/lib/calc";
import { evaluateLimit } from "@/lib/limits";
import { definiteIntegral } from "@/lib/uv-steps";

export const STRESS_TOLERANCE = 1e-4;
export const STRESS_PILLARS = ["Funções", "Limites", "Derivadas", "Integrais"] as const;
export type StressPillar = typeof STRESS_PILLARS[number];
type Expected = number | "indefinido" | "integral rejeitada";
export type StressCase = { id: string; pillar: StressPillar; expression: string; parameters: string; point: number; end?: number | undefined; expected: Expected; basis: string };
export type StressResult = { test: StressCase; actual: Expected | "erro"; passed: boolean; elapsed: number; error: number | null; detail: string | null };

// Independent analytic answers: never derive an answer with the engine under test.
type Seed = [expression: string, point: number, expected: Expected, basis: string, end?: number];
const seeds: Record<StressPillar, Seed[]> = {
  "Funções": [
    ["x^2-4", 3, 5, "9 − 4 = 5"], ["x^3-2*x+1", -2, -3, "−8 + 4 + 1 = −3"],
    ["5", 7, 5, "Função constante"], ["sqrt(9)", 0, 3, "Raiz principal de 9"],
    ["sin(x)", Math.PI / 2, 1, "sen(π/2) = 1"], ["cos(x)", Math.PI, -1, "cos(π) = −1"],
    ["tan(x)", Math.PI / 4, 1, "tan(π/4) = 1"], ["exp(x)", 0, 1, "e⁰ = 1"],
    ["ln(x)", Math.E, 1, "ln(e) = 1"], ["log10(x)", 100, 2, "10² = 100"],
    ["log_2(x)", 8, 3, "2³ = 8"], ["abs(x)", -3, 3, "Valor absoluto"],
    ["1/(x-1)", 1, "indefinido", "Denominador nulo"], ["sqrt(x)", -1, "indefinido", "Fora do domínio real"],
    ["2x+3", 4, 11, "Multiplicação implícita: 8 + 3"], ["(x+1)*(x-1)", 2, 3, "Diferença de quadrados"],
  ],
  "Limites": [
    ["x^2", 2, 4, "Continuidade"], ["(x^2-1)/(x-1)", 1, 2, "Cancelamento: x + 1"],
    ["(x^3-8)/(x-2)", 2, 12, "Cancelamento: x² + 2x + 4"],
    ["(sqrt(x+1)-1)/x", 0, 0.5, "Racionalização: 1/(√(x+1)+1)"],
    ["sin(x)/x", 0, 1, "Limite trigonométrico fundamental"], ["(1-cos(x))/x^2", 0, 0.5, "Limite fundamental: 1/2"],
    ["(exp(x)-1)/x", 0, 1, "Derivada de exp em zero"], ["ln(1+x)/x", 0, 1, "Derivada de ln em 1"],
    ["abs(x)", 0, 0, "Continuidade do módulo"], ["abs(x)/x", 0, "indefinido", "Limites laterais −1 e 1"],
    ["sin(1/x)", 0, "indefinido", "Oscilação não amortecida"],
    ["1/x", Infinity, 0, "Recíproco tende a zero"], ["1/x", -Infinity, 0, "Recíproco tende a zero"],
    ["(3*x^2+1)/(x^2+5)", Infinity, 3, "Razão dos coeficientes líderes"],
    ["x^2", Infinity, Infinity, "Crescimento quadrático"], ["sin(x)", Infinity, "indefinido", "Oscilação entre −1 e 1"],
  ],
  "Derivadas": [
    ["x^2", 3, 6, "f′(x) = 2x"], ["x^3", 2, 12, "f′(x) = 3x²"],
    ["4*x+7", -1, 4, "Derivada de função afim"], ["5", 2, 0, "Derivada de constante"],
    ["sqrt(9)", 0, 0, "Expressão estruturalmente constante"], ["sin(x)", 0, 1, "f′(x) = cos(x)"],
    ["cos(x)", Math.PI / 2, -1, "f′(x) = −sen(x)"], ["tan(x)", 0, 1, "f′(x) = sec²(x)"],
    ["exp(x)", 0, 1, "f′(x) = exp(x)"], ["ln(x)", 1, 1, "f′(x) = 1/x"],
    ["sqrt(x)", 4, 0.25, "f′(x) = 1/(2√x)"], ["1/x", 2, -0.25, "f′(x) = −1/x²"],
    ["sin(x^2)", 0, 0, "Cadeia: 2x cos(x²)"], ["x*exp(x)", 0, 1, "Produto: (1+x)exp(x)"],
    ["abs(x)", 0, "indefinido", "Canto: derivadas laterais distintas"], ["1/x", 0, "indefinido", "Função indefinida no ponto"],
  ],
  "Integrais": [
    ["x^2", 0, 1 / 3, "Primitiva x³/3", 1], ["x^3", 0, 4, "Primitiva x⁴/4", 2],
    ["5", 0, 10, "Primitiva 5x", 2], ["2*x+1", 0, 6, "Primitiva x² + x", 2],
    ["sin(x)", 0, 2, "Primitiva −cos(x)", Math.PI], ["cos(x)", 0, 1, "Primitiva sen(x)", Math.PI / 2],
    ["exp(x)", 0, Math.E - 1, "Primitiva exp(x)", 1], ["1/x", 1, Math.log(2), "Primitiva ln(x), x > 0", 2],
    ["1/(1+x^2)", 0, Math.PI / 4, "Primitiva arctan(x)", 1],
    ["2*x*cos(x^2)", 0, Math.sin(1), "Substituição u = x²", 1],
    ["x", 1, -0.5, "Inversão dos limites", 0], ["x^3", -1, 0, "Função ímpar em intervalo simétrico", 1],
    ["x^2", 2, 0, "Intervalo nulo", 2],
    ["1/x", -1, "integral rejeitada", "Polo interno: não é integral comum", 1],
    ["1/(x-0.123)^2", 0, "integral rejeitada", "Polo fora da malha: integral divergente", 1],
    ["sqrt(x)", -1, "integral rejeitada", "Fora do domínio real no intervalo", 1],
  ],
};

function pointText(x: number) { return x === Infinity ? "+∞" : x === -Infinity ? "−∞" : String(Number(x.toFixed(6))); }
export const STRESS_CASES: StressCase[] = STRESS_PILLARS.flatMap((pillar) => seeds[pillar].map(([expression, point, expected, basis, end], index) => ({
  id: `${pillar}-${index + 1}`, pillar, expression, point, end, expected, basis,
  parameters: pillar === "Integrais" ? `[${pointText(point)}, ${pointText(end ?? point)}]` : pillar === "Limites" ? `x → ${pointText(point)}` : `x = ${pointText(point)}`,
})));

export function compareStressResult(actual: Expected | "erro", expected: Expected): boolean {
  if (actual === "erro") return false;
  if (typeof actual !== "number" || typeof expected !== "number") return actual === expected;
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return actual === expected && !Number.isNaN(actual);
  return Math.abs(actual - expected) <= STRESS_TOLERANCE;
}

export function executeStressCase(test: StressCase): StressResult {
  const start = performance.now();
  let actual: StressResult["actual"] = "erro", detail: string | null = null;
  try {
    if (test.pillar === "Integrais") {
      if (test.end === undefined) throw new Error("Limite de integração ausente.");
      const result = definiteIntegral(test.expression, test.point, test.end);
      actual = result.error ? "integral rejeitada" : result.value;
      detail = result.error ?? `Método: ${result.method}`;
    } else {
      const { fn, error } = parseFn(test.expression);
      if (!fn) throw new Error(error ?? "Expressão inválida.");
      const value = test.pillar === "Funções" ? fn(test.point) : test.pillar === "Derivadas" ? derivative(fn, test.point) : evaluateLimit(test.expression, test.point).L;
      actual = Number.isNaN(value) ? "indefinido" : value;
    }
  } catch (error) { detail = error instanceof Error ? error.message : "Falha na execução."; }
  const error = typeof actual === "number" && typeof test.expected === "number" && Number.isFinite(actual) && Number.isFinite(test.expected) ? Math.abs(actual - test.expected) : null;
  return { test, actual, passed: compareStressResult(actual, test.expected), elapsed: performance.now() - start, error, detail };
}

export async function runStressBattery(onProgress: (results: StressResult[]) => void, cancelled: () => boolean = () => false): Promise<StressResult[]> {
  const results: StressResult[] = [];
  for (const test of STRESS_CASES) {
    if (cancelled()) break;
    results.push(executeStressCase(test));
    if (results.length % 4 === 0 || results.length === STRESS_CASES.length) {
      onProgress([...results]);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
  return results;
}