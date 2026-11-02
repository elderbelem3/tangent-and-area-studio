import { compile, derivative as symD, parse, simplify } from "mathjs";
import { fmt, integrate, normalize, parseFn } from "@/lib/calc";
import type { UvStep } from "@/lib/uv-steps";

export type Fn2 = (x: number, y: number) => number;

/** A 3D view is needed when the expression depends on y, i.e. f(x, y). */
export function needs3D(expression: string): boolean {
  try {
    return parse(normalize(expression)).filter((n) => (n as unknown as { isSymbolNode?: boolean; name?: string }).isSymbolNode === true && (n as unknown as { name: string }).name === "y").length > 0;
  } catch { return false; }
}

export function parseFn2(expression: string): { fn: Fn2 | null; error: string | null } {
  if (!expression.trim()) return { fn: null, error: "Digite uma função f(x, y)." };
  try {
    const code = compile(normalize(expression));
    const fn: Fn2 = (x, y) => { try { const v = code.evaluate({ x, y, e: Math.E, pi: Math.PI }); return typeof v === "number" && Number.isFinite(v) ? v : NaN; } catch { return NaN; } };
    code.evaluate({ x: 0.37, y: 0.41 });
    return { fn, error: null };
  } catch (e) { return { fn: null, error: `Função inválida: ${(e as Error).message}` }; }
}

const show = (s: string) => s.replace(/\blog\(/g, "ln(").replace(/ \* /g, "·").replace(/ \^ /g, "^");
const ds = (expr: string, v: string) => { try { return simplify(symD(parse(expr), v)).toString(); } catch { return null; } };

export type SurfaceInfo = { fx: string | null; fy: string | null; critical: { x: number; y: number; z: number; kind: string } | null; steps: UvStep[] };

export function surfaceAnalysis(expression: string, range: number): SurfaceInfo | null {
  const { fn } = parseFn2(expression); if (!fn) return null;
  const n = normalize(expression), fx = ds(n, "x"), fy = ds(n, "y");
  const gx = fx ? parseFn2(fx).fn : null, gy = fy ? parseFn2(fy).fn : null;
  const grad = (x: number, y: number) => {
    const a = gx ? gx(x, y) : (fn(x + 1e-5, y) - fn(x - 1e-5, y)) / 2e-5;
    const b = gy ? gy(x, y) : (fn(x, y + 1e-5) - fn(x, y - 1e-5)) / 2e-5;
    return [a, b] as const;
  };
  let best: { x: number; y: number; g: number } | null = null;
  const N = 60;
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
    const x = -range + 2 * range * i / N, y = -range + 2 * range * j / N, [a, b] = grad(x, y), g = Math.hypot(a, b);
    if (Number.isFinite(g) && (!best || g < best.g)) best = { x, y, g };
  }
  let critical: SurfaceInfo["critical"] = null;
  const steps: UvStep[] = [
    { title: "Passo 1 — Derivadas parciais", lines: [`∂f/∂x = ${fx ? show(fx) : "(numérica)"}`, `∂f/∂y = ${fy ? show(fy) : "(numérica)"}`] },
  ];
  if (best && best.g < 1e-2 * Math.max(1, range)) {
    const h = 1e-3, { x, y } = best;
    const fxx = (fn(x + h, y) - 2 * fn(x, y) + fn(x - h, y)) / h ** 2, fyy = (fn(x, y + h) - 2 * fn(x, y) + fn(x, y - h)) / h ** 2;
    const fxy = (fn(x + h, y + h) - fn(x + h, y - h) - fn(x - h, y + h) + fn(x - h, y - h)) / (4 * h * h);
    const D = fxx * fyy - fxy ** 2;
    const kind = D > 1e-6 ? (fxx > 0 ? "Mínimo local" : "Máximo local") : D < -1e-6 ? "Ponto de sela" : "Teste inconclusivo";
    critical = { x, y, z: fn(x, y), kind };
    steps.push({ title: "Passo 2 — Ponto crítico (∇f = 0)", lines: [`∂f/∂x = 0 e ∂f/∂y = 0 ⇒ (x, y) ≈ (${fmt(x, 4)}, ${fmt(y, 4)})`, `f(${fmt(x, 4)}, ${fmt(y, 4)}) = ${fmt(critical.z, 5)}`] });
    steps.push({ title: "Passo 3 — Teste da segunda derivada (Hessiana)", lines: [`fxx = ${fmt(fxx, 4)} · fyy = ${fmt(fyy, 4)} · fxy = ${fmt(fxy, 4)}`, `D = fxx·fyy − fxy² = ${fmt(D, 4)}`, `Conclusão: ${kind}`] });
  } else steps.push({ title: "Passo 2 — Ponto crítico", lines: ["∇f não se anula na região exibida."] });
  const [a, b] = grad(1, 1);
  steps.push({ title: `Passo ${steps.length + 1} — Vetor gradiente em (1, 1)`, lines: [`∇f(1, 1) = (${fmt(a, 4)}, ${fmt(b, 4)}) — direção de maior crescimento`] });
  return { fx, fy, critical, steps };
}

export function solidSteps(expression: string, a: number, b: number): { volume: number; steps: UvStep[] } | null {
  const { fn } = parseFn(expression); if (!fn) return null;
  const sq = (x: number) => fn(x) ** 2;
  const volume = Math.PI * integrate(sq, a, b);
  const m = (a + b) / 2, r = Math.abs(fn(m));
  let f2 = `(${expression})^2`;
  try { f2 = show(simplify(parse(`(${normalize(expression)})^2`)).toString()); } catch { /* keep raw */ }
  return { volume, steps: [
    { title: "Passo 1 — Método dos discos", lines: ["Girando y = f(x) em torno do eixo x, cada fatia é um disco de raio f(x)", "dV = π·[f(x)]²·dx"] },
    { title: "Passo 2 — Disco destacado (x = ponto médio)", lines: [`x = ${fmt(m, 4)} ⇒ r = |f(${fmt(m, 4)})| = ${fmt(r, 4)}`, `Área do disco = π·r² = ${fmt(Math.PI * r * r, 5)}`] },
    { title: "Passo 3 — Montar a integral", lines: [`V = π ∫ de ${fmt(a)} a ${fmt(b)} ${f2} dx`] },
    { title: "Passo 4 — Calcular", lines: [`∫ ${f2} dx ≈ ${fmt(integrate(sq, a, b), 6)}`, `V = π · ${fmt(integrate(sq, a, b), 6)} ≈ ${fmt(volume, 6)}`] },
  ] };
}
