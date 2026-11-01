import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eraser, Sparkles, TrendingUp, TrendingDown, Waves, Pencil } from "lucide-react";
import { PageHeader, Panel, Stat } from "@/components/Lab";

export const Route = createFileRoute("/desenho")({
  head: () => ({
    meta: [
      { title: "Desenho Livre · CalculusLab" },
      { name: "description", content: "Desenhe uma curva à mão livre e veja uma análise de crescimento, área e derivada." },
      { property: "og:title", content: "Desenho Livre · CalculusLab" },
      { property: "og:description", content: "Desenhe uma curva à mão livre e veja uma análise de crescimento, área e derivada." },
    ],
  }),
  component: Desenho,
});

type P = { x: number; y: number };
const W = 800;
const H = 450;
const U = 50; // pixels por unidade

type Result = {
  trend: "crescente" | "decrescente" | "oscilante" | "constante";
  up: number;
  down: number;
  area: number;
  tangent: { p: P; slope: number };
  curve: P[];
};

function cssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function analyze(strokes: P[][]): Result | null {
  const pts = strokes.flat();
  if (pts.length < 5) return null;
  // reamostra por colunas de x
  const cols = new Map<number, number[]>();
  for (const p of pts) {
    const k = Math.round(p.x / 8);
    if (!cols.has(k)) cols.set(k, []);
    cols.get(k)!.push(p.y);
  }
  const curve = [...cols.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([k, ys]) => ({ x: k * 8, y: ys.reduce((s, v) => s + v, 0) / ys.length }));
  if (curve.length < 3) return null;
  let up = 0, down = 0, area = 0, best = { i: 1, s: 0 };
  for (let i = 1; i < curve.length; i++) {
    const a = curve[i - 1], b = curve[i];
    const dx = (b.x - a.x) / U;
    const dy = (a.y - b.y) / U; // y do canvas é invertido
    if (dy > 0.02) up += dx; else if (dy < -0.02) down += dx;
    area += ((H - a.y + H - b.y) / 2 / U) * dx;
    const s = dy / dx;
    if (Math.abs(s) > Math.abs(best.s)) best = { i, s };
  }
  const total = up + down || 1;
  const trend = up + down < 0.3 ? "constante" : up / total > 0.75 ? "crescente" : down / total > 0.75 ? "decrescente" : "oscilante";
  const a = curve[best.i - 1], b = curve[best.i];
  return { trend, up, down, area, curve, tangent: { p: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, slope: best.s } };
}

function Desenho() {
  const ref = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<P[][]>([]);
  const drawing = useRef(false);
  const [result, setResult] = useState<Result | null>(null);
  const [msg, setMsg] = useState("");
  const anim = useRef(0);

  const redraw = (res: Result | null, progress = 1) => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const grid = cssVar("--border", "#ddd");
    const fg = cssVar("--foreground", "#111");
    const primary = cssVar("--primary", "#2563eb");
    const accent = cssVar("--destructive", "#e11d48");
    ctx.fillStyle = cssVar("--card", "#fff");
    ctx.fillRect(0, 0, W, H);
    // papel milimetrado
    for (let x = 0; x <= W; x += 10) {
      ctx.strokeStyle = grid;
      ctx.globalAlpha = x % U === 0 ? 0.9 : 0.35;
      ctx.lineWidth = x % U === 0 ? 1 : 0.5;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 10) {
      ctx.globalAlpha = (H - y) % U === 0 ? 0.9 : 0.35;
      ctx.lineWidth = (H - y) % U === 0 ? 1 : 0.5;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // área sombreada animada
    if (res) {
      const n = Math.max(2, Math.floor(res.curve.length * progress));
      const pts = res.curve.slice(0, n);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, H);
      pts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, H);
      ctx.closePath();
      ctx.fillStyle = primary;
      ctx.globalAlpha = 0.18;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // traço do usuário
    ctx.strokeStyle = res ? primary : fg;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const s of strokes.current) {
      ctx.beginPath();
      s.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    }
    // reta tangente
    if (res && progress >= 1) {
      const { p, slope } = res.tangent;
      const L = 90;
      const dx = L / Math.sqrt(1 + slope * slope);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(p.x - dx, p.y + slope * dx);
      ctx.lineTo(p.x + dx, p.y - slope * dx);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 13px 'JetBrains Mono', monospace";
      ctx.fillText(`f'(x) ≈ ${slope.toFixed(2)}`, Math.min(p.x + 10, W - 130), Math.max(p.y - 12, 16));
    }
  };

  useEffect(() => { redraw(null); return () => cancelAnimationFrame(anim.current); }, []);

  const pos = (e: React.PointerEvent): P => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    if (result) setResult(null);
    strokes.current.push([pos(e)]);
    redraw(null);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    strokes.current[strokes.current.length - 1].push(pos(e));
    redraw(null);
  };
  const up = () => { drawing.current = false; };

  const clear = () => {
    cancelAnimationFrame(anim.current);
    strokes.current = [];
    setResult(null);
    setMsg("");
    redraw(null);
  };

  const run = () => {
    const res = analyze(strokes.current);
    if (!res) { setMsg("Desenhe uma curva um pouco maior antes de analisar."); return; }
    setMsg("");
    cancelAnimationFrame(anim.current);
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 900);
      redraw(res, p);
      if (p < 1) anim.current = requestAnimationFrame(step);
      else setResult(res);
    };
    anim.current = requestAnimationFrame(step);
  };

  const TrendIcon = result?.trend === "crescente" ? TrendingUp : result?.trend === "decrescente" ? TrendingDown : Waves;
  const trendText: Record<Result["trend"], string> = {
    crescente: "Sua curva sobe da esquerda para a direita: f'(x) > 0 na maior parte do traço.",
    decrescente: "Sua curva desce da esquerda para a direita: f'(x) < 0 na maior parte do traço.",
    oscilante: "Sua curva sobe e desce: há trechos com f'(x) > 0 e outros com f'(x) < 0 — provavelmente existem máximos ou mínimos locais.",
    constante: "Sua curva é quase horizontal: f'(x) ≈ 0, a função é praticamente constante.",
  };

  return (
    <div>
      <PageHeader
        tag="05 · Demonstração"
        title="Área de Desenho e Análise Gráfica"
        desc="Desenhe qualquer curva no papel milimetrado com o mouse ou o dedo e clique em “Analisar Curva” para ver se ela cresce ou decresce, a área sob o traço e um ponto de derivada."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel>
          <canvas
            ref={ref}
            width={W}
            height={H}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            className="w-full cursor-crosshair touch-none rounded-xl border border-border"
            style={{ aspectRatio: `${W}/${H}` }}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={clear} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary">
              <Eraser className="h-4 w-4" /> Limpar Tela
            </button>
            <button onClick={run} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
              <Sparkles className="h-4 w-4" /> Analisar Curva
            </button>
          </div>
          {msg && <p className="mt-3 text-sm text-destructive">{msg}</p>}
        </Panel>

        <Panel title="Análise do traço">
          {!result ? (
            <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
              <Pencil className="h-8 w-8 text-primary" />
              <p className="mt-3 text-sm">Desenhe uma curva da esquerda para a direita e clique em “Analisar Curva”.</p>
              <p className="mt-2 text-xs">Cada quadrado grande vale 1 unidade.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-secondary p-4">
                <TrendIcon className="h-6 w-6 shrink-0 text-primary" />
                <div>
                  <p className="font-display text-lg font-semibold capitalize">{result.trend}</p>
                  <p className="text-sm text-muted-foreground">{trendText[result.trend]}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Sobe" value={`${result.up.toFixed(1)} u`} />
                <Stat label="Desce" value={`${result.down.toFixed(1)} u`} />
              </div>
              <Stat label="Área sob o traço ≈" value={`${result.area.toFixed(2)} u²`} />
              <p className="text-sm text-muted-foreground">A região azul é a área acumulada entre o traço e a base do quadro — a ideia da integral definida.</p>
              <Stat label="Maior inclinação f'(x) ≈" value={result.tangent.slope.toFixed(2)} />
              <p className="text-sm text-muted-foreground">O ponto vermelho marca onde o traço é mais íngreme; a reta tracejada é a tangente simulada.</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
