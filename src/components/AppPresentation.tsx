import { useEffect, useRef, useState, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Presentation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_SLIDES, movePresentationSlide } from "@/lib/app-presentation";
import logo from "@/assets/unicatolica-logo.png.asset.json";

function ScaledSlide({ children }: { children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(Math.min(entry.contentRect.width / 1920, entry.contentRect.height / 1080));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className="presentation-stage"><div className="presentation-slide" style={{ transform: `scale(${scale})` }}>{children}</div></div>;
}

export function AppPresentation({ slideNumber, onChange }: { slideNumber: number | undefined; onChange: (slide?: number) => void }) {
  const slide = slideNumber === undefined ? undefined : APP_SLIDES[slideNumber - 1];
  const touch = useRef<{ x: number; y: number } | null>(null);
  const move = (delta: number) => {
    if (slideNumber !== undefined) onChange(movePresentationSlide(slideNumber, delta));
  };
  useEffect(() => {
    if (slideNumber === undefined || !slide) return;
    const original = document.title;
    document.title = `${slideNumber}/${APP_SLIDES.length} — ${slide.title} · CalculusLab`;
    return () => { document.title = original; };
  }, [slideNumber, slide]);

  return <DialogPrimitive.Root open={Boolean(slide)} onOpenChange={(open) => onChange(open ? 1 : undefined)}>
    <DialogPrimitive.Trigger asChild><Button className="mb-6 min-h-11 h-auto whitespace-normal text-left" onClick={() => onChange(1)}><Presentation className="h-5 w-5 shrink-0" />Iniciar Apresentação do App</Button></DialogPrimitive.Trigger>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background" />
      <DialogPrimitive.Content className="app-presentation fixed inset-0 z-50 flex flex-col bg-background text-foreground outline-none" aria-describedby="presentation-description"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || (event.key === " " && event.target === event.currentTarget)) { event.preventDefault(); move(1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        }}
        onTouchStart={(event) => { const point = event.touches[0]; if (point) touch.current = { x: point.clientX, y: point.clientY }; }}
        onTouchEnd={(event) => {
          const point = event.changedTouches[0], start = touch.current;
          touch.current = null;
          if (point && start && Math.abs(point.clientX - start.x) > 60 && Math.abs(point.clientY - start.y) < 50) move(point.clientX < start.x ? 1 : -1);
        }}>
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-8">
          <div className="min-w-0"><DialogPrimitive.Title className="font-display text-base font-bold sm:text-lg">CalculusLab · Apresentação do App</DialogPrimitive.Title><DialogPrimitive.Description id="presentation-description" className="text-xs text-muted-foreground">Arquitetura e funcionamento · Cálculo 1 e 2</DialogPrimitive.Description></div>
          <DialogPrimitive.Close asChild><Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label="Fechar apresentação" title="Fechar apresentação"><X className="h-5 w-5" /></Button></DialogPrimitive.Close>
        </header>
        {slide && <div className="presentation-body min-h-0 flex-1 overflow-y-auto">
          <ScaledSlide>
            <div className="slide-kicker">COMO O CÓDIGO FUNCIONA / {String(slideNumber).padStart(2, "0")}</div>
            <h2 className="slide-title">{slide.title}</h2>
            <p className="slide-subtitle">{slide.subtitle}</p>
            <ol className="slide-flow">{slide.stages.map((stage, i) => <li key={stage}><span className="slide-step">0{i + 1}</span><span>{stage}</span>{i < 2 && <ArrowRight aria-hidden="true" />}</li>)}</ol>
            <div className="slide-columns">{slide.points.map((point) => <section key={point.title}><h3>{point.title}</h3><p>{point.text}</p></section>)}</div>
            <div className="slide-example"><pre>{slide.code}</pre>{slideNumber === 5 && <img src={logo.url} alt="UniCatólica do RN" />}</div>
            <footer className="slide-footer"><span>{slide.source}</span><span>CalculusLab / {slideNumber} de {APP_SLIDES.length}</span></footer>
          </ScaledSlide>
          <article className="presentation-mobile px-5 pb-5" aria-label="Conteúdo do slide">
            <h2 className="font-display text-xl font-bold">{slide.title}</h2><p className="mt-1 text-sm text-primary">{slide.subtitle}</p>
            {slide.points.map((point) => <section className="mt-5" key={point.title}><h3 className="font-semibold">{point.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{point.text}</p></section>)}
          </article>
        </div>}
        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-card px-3 py-3 sm:px-8">
          <Button variant="outline" className="min-h-11" disabled={slideNumber === 1} onClick={() => move(-1)}><ArrowLeft className="h-4 w-4" />Anterior</Button>
          <span role="status" aria-live="polite" className="shrink-0 font-mono text-sm">{slideNumber} / {APP_SLIDES.length}</span>
          {slideNumber === APP_SLIDES.length ? <Button className="min-h-11" onClick={() => onChange(undefined)}>Concluir<X className="h-4 w-4" /></Button> : <Button className="min-h-11" onClick={() => move(1)}>Próximo<ArrowRight className="h-4 w-4" /></Button>}
        </footer>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}