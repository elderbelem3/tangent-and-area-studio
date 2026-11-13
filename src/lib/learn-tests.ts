import { setModuleState } from "@/lib/module-state";

export type GraphTest =
  | { module: "Funções"; expression: string; a?: number; b?: number }
  | { module: "Limites"; expression: string; c: number }
  | { module: "Derivadas"; expression: string; x0: number }
  | { module: "Integrais"; expression: string; a: number; b: number; solid?: boolean };

export const ROUTES = { "Funções": "/", "Limites": "/limites", "Derivadas": "/derivadas", "Integrais": "/integrais" } as const;

/** Function captured from each solved example, sent to the matching module. */
export const GRAPH_TESTS: Record<string, GraphTest> = {
  definicao: { module: "Funções", expression: "sqrt(x-1)", a: 0, b: 6 },
  inversa: { module: "Funções", expression: "2*x+3" },
  composta: { module: "Funções", expression: "sqrt(x^2-4)", a: -5, b: 5 },
  familias: { module: "Funções", expression: "x^2-4*x+3", a: -1, b: 5 },
  epsilon: { module: "Limites", expression: "3*x+1", c: 2 },
  assintotas: { module: "Limites", expression: "(2*x+1)/(x-2)", c: 2 },
  infinito: { module: "Funções", expression: "1/x", a: 1, b: 50 },
  confronto: { module: "Limites", expression: "sin(x)/x", c: 0 },
  continuidade: { module: "Funções", expression: "x^3+x-1", a: -2, b: 2 },
  "def-derivada": { module: "Derivadas", expression: "x^2", x0: 3 },
  regras: { module: "Derivadas", expression: "x^2*sin(3*x)", x0: 1 },
  implicita: { module: "Derivadas", expression: "sqrt(25-x^2)", x0: 3 },
  taxas: { module: "Derivadas", expression: "(4/3)*pi*x^3", x0: 3 },
  lhopital: { module: "Limites", expression: "(exp(x)-1-x)/x^2", c: 0 },
  "rolle-tvm": { module: "Derivadas", expression: "x^2", x0: 2 },
  analise: { module: "Funções", expression: "x^3-3*x" },
  imediatas: { module: "Derivadas", expression: "x^3+x^2-5*x", x0: 1 },
  substituicao: { module: "Integrais", expression: "2*x*cos(x^2)", a: 0, b: 1 },
  "por-partes": { module: "Integrais", expression: "x*exp(x)", a: 0, b: 1 },
  "trig-sub": { module: "Integrais", expression: "sqrt(4-x^2)", a: 0, b: 2 },
  fracoes: { module: "Integrais", expression: "1/(x^2-1)", a: 2, b: 3 },
  riemann: { module: "Integrais", expression: "x^2", a: 0, b: 1 },
  tfc: { module: "Integrais", expression: "x^2", a: 0, b: 2 },
  areas: { module: "Integrais", expression: "x-x^2", a: 0, b: 1 },
  volumes: { module: "Integrais", expression: "x^2", a: 0, b: 1, solid: true },
  arco: { module: "Integrais", expression: "sqrt(1+x)", a: 0, b: 1 },
  sequencias: { module: "Funções", expression: "x/(x+1)", a: 0, b: 20 },
  serie: { module: "Funções", expression: "2*(1-(1/2)^(x+1))", a: 0, b: 10 },
  razao: { module: "Funções", expression: "2/(x+1)", a: 0, b: 20 },
  raiz: { module: "Funções", expression: "x/(3*x+1)", a: 0, b: 20 },
  "integral-comparacao": { module: "Integrais", expression: "1/x^2", a: 1, b: 50 },
  superficies: { module: "Funções", expression: "sqrt(8-x^2-y^2)", a: -2, b: 2 },
  "parciais-plano": { module: "Derivadas", expression: "x^2+2*x+4", x0: 1 },
  otimizacao: { module: "Funções", expression: "x^2+y^2-2*x-4*y", a: -3, b: 3 },
  "aprox-linear": { module: "Derivadas", expression: "sqrt(x)", x0: 4 },
  "otimizacao-aplicada": { module: "Funções", expression: "x*(12-2*x)^2", a: 0, b: 6 },
  improprias: { module: "Integrais", expression: "1/x^2", a: 1, b: 100 },
  taylor: { module: "Funções", expression: "sin(x)", a: -6, b: 6 },
  polares: { module: "Integrais", expression: "0.5*(1+cos(x))^2", a: 0, b: 2 * Math.PI },
  vetorial: { module: "Funções", expression: "x^2+y^2", a: -3, b: 3 },
};

/** Writes the example into the target module's saved inputs; returns the route to open. */
export function applyGraphTest(t: GraphTest) {
  if (t.module === "Funções") {
    setModuleState("funcoes.functions", [{ slot: 0, expression: t.expression }]);
    if (t.a !== undefined) setModuleState("funcoes.a", String(t.a));
    if (t.b !== undefined) setModuleState("funcoes.b", String(t.b));
  } else if (t.module === "Limites") {
    setModuleState("limites.expr", t.expression); setModuleState("limites.cS", String(t.c));
  } else if (t.module === "Derivadas") {
    setModuleState("derivadas.functions", [{ slot: 0, expression: t.expression }]); setModuleState("derivadas.x0S", String(t.x0));
  } else {
    setModuleState("integrais.expr", t.expression); setModuleState("integrais.aS", String(Number(t.a.toFixed(6)))); setModuleState("integrais.bS", String(Number(t.b.toFixed(6))));
    setModuleState("integrais.mode", t.solid ? "solido" : "area");
  }
  return ROUTES[t.module];
}
