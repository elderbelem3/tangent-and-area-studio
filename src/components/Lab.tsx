import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

export function PageHeader({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <header className="mb-6">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">{tag}</p>
      <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{desc}</p>
    </header>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 shadow-soft ${className}`}>
      {title && <h2 className="mb-3 font-display text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export function Field({ label, value, onChange, mono = true, placeholder }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-input bg-background px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
}

export function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-all font-mono text-2xl font-semibold text-primary">{value}</p>
    </div>
  );
}

export function Chip({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="rounded-full border border-border bg-background px-3 py-1 text-sm transition hover:border-primary hover:text-primary">
      {children}
    </button>
  );
}

export function num(s: string): number | null {
  const v = Number(s.replace(",", "."));
  return s.trim() === "" || !Number.isFinite(v) ? null : v;
}
