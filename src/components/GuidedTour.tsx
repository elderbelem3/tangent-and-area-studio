import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { CircleHelp, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = { selector: string; title: string; text: string; before?: () => void };

const STEPS: Step[] = [
  { selector: 'nav[aria-label="Módulos"]', title: "Abas dos módulos", text: "Navegue pelos módulos de Funções, Limites, Derivadas e Integrais." },
  { selector: "main input", title: "Campo da função", text: "Digite a sua equação aqui (ex: x^2 ou sin(x)) para atualizar o gráfico na hora." },
  { selector: ".tour-graph", title: "Gráfico inteligente", text: "O gráfico inteligente adapta-se sozinho. Tente digitar f(x,y) para ver as superfícies 3D!" },
  { selector: 'button[aria-label="Modo Quadro Negro"]', title: "Modo Quadro Negro", text: "Ative a lousa para um ambiente sem distrações." },
  {
    selector: ".uv-toggle", title: "Luz Negra (UV)", text: "Visão Detetive: Acenda a Luz Negra para revelar raízes, limites e cálculos ocultos na lousa!",
    // The UV button only exists in chalkboard mode: switch it on so it can be shown.
    before: () => { if (!document.querySelector(".uv-toggle")) document.querySelector<HTMLButtonElement>('button[aria-label="Modo Quadro Negro"]')?.click(); },
  },
];

type Rect = { top: number; left: number; width: number; height: number };
const PAD = 8;

export function HelpButton() {
  const [open, setOpen] = useState(false);
  return <>
    <Button type="button" size="sm" onClick={() => setOpen(true)} className="help-pulse h-9 gap-1.5 rounded-full px-3.5" aria-label="Como usar o CalculusLab">
      <CircleHelp className="h-4 w-4" /><span>Como Usar</span>
    </Button>
    {open && <GuidedTour onClose={() => setOpen(false)} />}
  </>;
}

function GuidedTour({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const step = STEPS[index]!;

  // Steps 2 and 3 live on the Funções page.
  useEffect(() => { if (pathname !== "/") void navigate({ to: "/" }); }, [pathname, navigate]);

  const measure = useCallback(() => {
    const el = document.querySelector(step.selector);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
  }, [step.selector]);

  useLayoutEffect(() => {
    step.before?.();
    let tries = 0;
    const find = () => {
      const el = document.querySelector(step.selector);
      if (el) { el.scrollIntoView({ block: "center", behavior: "smooth" }); window.setTimeout(measure, 350); }
      else if (tries++ < 20) window.setTimeout(find, 100);
      else setRect(null);
    };
    find();
  }, [step, measure, pathname]);

  useEffect(() => {
    const on = () => measure();
    window.addEventListener("resize", on); window.addEventListener("scroll", on, true);
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); };
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("resize", on); window.removeEventListener("scroll", on, true); window.removeEventListener("keydown", key); };
  });

  const next = () => (index < STEPS.length - 1 ? setIndex(index + 1) : onClose());
  const prev = () => index > 0 && setIndex(index - 1);

  const vw = typeof window === "undefined" ? 1200 : window.innerWidth, vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const boxW = Math.min(340, vw - 24);
  const below = !rect || rect.top + rect.height + 220 < vh;
  const top = rect ? (below ? rect.top + rect.height + 12 : Math.max(12, rect.top - 12 - 200)) : vh / 2 - 100;
  const left = rect ? Math.min(Math.max(12, rect.left), vw - boxW - 12) : (vw - boxW) / 2;

  return createPortal(<div className="tour-root" role="dialog" aria-modal="true" aria-label="Tour guiado">
    <div className="tour-blocker" onClick={(e) => e.stopPropagation()} />
    <div className="tour-spotlight" style={rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : { top: vh / 2, left: vw / 2, width: 0, height: 0 }} />
    <div className="tour-bubble" style={{ top, left, width: boxW }}>
      <p className="tour-count">Passo {index + 1} de {STEPS.length}</p>
      <h3 className="tour-title">{step.title}</h3>
      <p className="tour-text">{step.text}</p>
      <div className="tour-dots" aria-hidden="true">{STEPS.map((_, i) => <span key={i} className={i === index ? "on" : ""} />)}</div>
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground"><X className="h-4 w-4" />Pular Tutorial</Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={prev} disabled={index === 0}><ChevronLeft className="h-4 w-4" />Anterior</Button>
          <Button type="button" size="sm" onClick={next}>{index === STEPS.length - 1 ? "Concluir" : "Próximo"}<ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  </div>, document.body);
}
