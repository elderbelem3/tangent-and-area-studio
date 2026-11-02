import type { UvStep } from "@/lib/uv-steps";

export function UvStepsPanel({ title, steps }: { title: string; steps: UvStep[] | null }) {
  if (!steps?.length) return null;
  return <section className="uv-panel" aria-label={title}><div><div className="uv-box">
    <h3 className="mb-4 text-lg">{title} · Luz Negra</h3>
    <ol className="space-y-3 text-sm">{steps.map((s, i) => <li key={i}><span>{s.title}</span>{s.lines.map((l, j) => <p key={j} className="break-words font-mono">{l}</p>)}</li>)}</ol>
  </div></div></section>;
}
