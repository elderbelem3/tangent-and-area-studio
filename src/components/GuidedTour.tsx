import { EV_THEME } from "@/lib/copilot-actions";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { CircleHelp, ChevronDown, ChevronLeft, ChevronRight, Sparkles, Route as RouteIcon, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HelpChat } from "@/components/HelpChat";
import { Button } from "@/components/ui/button";

type Step = { selector: string; title: string; text: string; route?: "/" | "/limites" | "/derivadas" | "/integrais" | "/ia"; before?: () => void };

/** Each module step declares its route; the tour switches tabs before showing the bubble. */
export const STEPS: Step[] = [
  { selector: 'nav[aria-label="Módulos"]', title: "Abas Principais", text: "Navegue pelos módulos de Funções, Limites, Derivadas e Integrais de acordo com a sua necessidade." },
  {
    route: "/", selector: "main .grid.gap-6 > :first-child", title: "Múltiplas Funções 2D/3D",
    text: "Digite equações, adicione várias funções simultaneamente e misture gráficos 2D com superfícies 3D no mesmo espaço.",
  },
  { selector: 'button[aria-label="Tema"]', title: "Seletor de Temas", text: "Personalize o seu ambiente de estudo com o Modo Claro, o Modo Escuro moderno ou o imersivo Modo Quadro Negro." },
  {
    selector: ".uv-toggle", title: "Luz Negra e IA", text: "Ative a Luz Negra para revelar segredos na lousa e acesse a aba de IA para tirar dúvidas com o nosso assistente inteligente.",
    // The UV button only exists in chalkboard mode: switch it on so it can be shown.
    before: () => { if (!document.querySelector(".uv-toggle")) window.dispatchEvent(new CustomEvent(EV_THEME, { detail: { chalkboard: true } })); },
  },
  { route: "/ia", selector: '[data-tour="attach-buttons"]', title: "Upload Multimodal na IA", text: "Envie PDFs, listas de exercícios ou fotos de rascunhos de provas diretamente no chat para a IA analisar e resolver passo a passo." },
  { route: "/ia", selector: 'button[aria-label="Gerar Questão do ENADE"]', title: "Simulador ENADE", text: "Treine para o exame! Clique em 'Questões do ENADE' para gerar e resolver simulados de nível universitário adaptados para a sua faculdade." },
];

type Rect = { top: number; left: number; width: number; height: number };
const PAD = 8;

export function HelpButton() {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(false);
  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="sm" className="help-pulse h-9 gap-1.5 rounded-full px-3.5" aria-label="Como usar o CalculusLab">
          <CircleHelp className="h-4 w-4" /><span>Como Usar</span><ChevronDown className="h-3.5 w-3.5 opacity-80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-1.5">
        <DropdownMenuItem onSelect={() => { setChat(false); setOpen(true); }} className="items-start gap-3 p-2.5">
          <RouteIcon className="mt-0.5 h-4 w-4 text-primary" /><span><span className="block font-semibold">Tour Guiado</span><span className="block text-xs text-muted-foreground">Passo a passo iluminando cada ferramenta</span></span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setChat(true)} className="items-start gap-3 p-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 text-primary" /><span><span className="block font-semibold">Ajuda com IA</span><span className="block text-xs text-muted-foreground">Copiloto que explica e demonstra ao vivo</span></span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    {open && <GuidedTour onClose={() => setOpen(false)} onAskAi={() => { setOpen(false); setChat(true); }} />}
    {chat && <HelpChat onClose={() => setChat(false)} />}
  </>;
}

function GuidedTour({ onClose, onAskAi }: { onClose: () => void; onAskAi: () => void }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const step = STEPS[index]!;

  // Auto-navigate to the step's module tab before measuring its target.
  useEffect(() => { if (step.route && pathname !== step.route) void navigate({ to: step.route }); }, [step.route, pathname, navigate]);

  const measure = useCallback(() => {
    const el = document.querySelector(step.selector);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
  }, [step.selector]);

  useLayoutEffect(() => {
    if (step.route && pathname !== step.route) { setRect(null); return; }
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
      {index === STEPS.length - 1 && <Button type="button" onClick={onAskAi} className="tour-ai mb-3 w-full gap-2"><Sparkles className="h-4 w-4" />Ainda com dúvidas? Pergunte à IA</Button>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground"><X className="h-4 w-4" />Pular Tutorial</Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={prev} disabled={index === 0}><ChevronLeft className="h-4 w-4" />Anterior</Button>
          <Button type="button" size="sm" onClick={next}>{index === STEPS.length - 1 ? "Concluir" : "Próximo"}<ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  </div>, document.body);
}
