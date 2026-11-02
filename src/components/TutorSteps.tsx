import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MathFormula } from "@/components/MathFormula";
import type { TutorSolution, TutorStep } from "@/lib/tutor";

export function TutorFormula({ formula }: { formula: string }) {
  if (!formula) return null;
  try { return <MathFormula formula={formula} />; }
  catch { return <p className="break-all font-mono text-sm">{formula}</p>; }
}

export function TutorStepContent({ step }: { step: TutorStep }) {
  return <><p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{step.explanation}</p>{step.formula && <div className="mt-4 min-w-0 border-l-2 border-primary/30 bg-secondary/60 px-4 py-2"><TutorFormula formula={step.formula} /></div>}</>;
}

export function TutorSteps({ solution, onQuestion }: { solution: TutorSolution; onQuestion?: (index: number) => void }) {
  return <div className="space-y-4">
    {[...solution.steps, solution.conclusion].map((step, index) => <article key={index} className="min-w-0 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="mb-1 text-xs font-semibold uppercase text-primary">{index === solution.steps.length ? "Conclusão" : `Passo ${index + 1}`}</p><h3 className="break-words font-display text-base font-semibold">{step.title}</h3></div>
        {onQuestion && <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-primary" title={`Perguntar sobre ${index === solution.steps.length ? "a conclusão" : `o passo ${index + 1}`}`} aria-label={`Perguntar sobre ${index === solution.steps.length ? "a conclusão" : `o passo ${index + 1}`}`} onClick={() => onQuestion(index)}><MessageCircle className="h-4 w-4" /></Button>}
      </div>
      <TutorStepContent step={step} />
      {(step.dica || step.intermediario) && <div className="uv-reveal" aria-label="Anotações em luz negra"><div>
        {step.intermediario && <div className="uv-ink-blue"><p className="uv-reveal-label">Passo intermediário</p><MathFormula formula={step.intermediario} /></div>}
        {step.dica && <p className={index === solution.steps.length ? "uv-ink-green" : "uv-ink-purple"}><span className="uv-reveal-label">{index === solution.steps.length ? "Gabarito detalhado" : "Dica oculta"}</span>{step.dica}</p>}
      </div></div>}
    </article>)}
  </div>;
}