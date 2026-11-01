import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, CheckCircle2, Lightbulb, Sigma } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/Lab";
import { LEARN } from "@/lib/learn-content";

export const Route = createFileRoute("/aprenda")({
  head: () => ({
    meta: [
      { title: "Aprenda · CalculusLab" },
      { name: "description", content: "Centro de estudos de Cálculo 1 e 2: teoria, fórmulas e exemplos resolvidos passo a passo." },
      { property: "og:title", content: "Aprenda · CalculusLab" },
      { property: "og:description", content: "Teoria e exemplos resolvidos de Cálculo 1 e 2." },
    ],
  }),
  component: Aprenda,
});

function Aprenda() {
  const [active, setActive] = useState(LEARN[0]?.id ?? "");
  const mod = LEARN.find((m) => m.id === active)!;

  return (
    <>
      <PageHeader tag="Centro de estudos" title="Aprenda" desc="Teoria, fórmulas e exemplos resolvidos de Cálculo 1 e 2. Abra cada tópico e teste os exercícios nos outros módulos." />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Índice">
            {LEARN.map((m) => (
              <button
                key={m.id}
                onClick={() => setActive(m.id)}
                className={`min-w-52 rounded-xl border p-3 text-left transition lg:min-w-0 ${m.id === active ? "border-primary bg-card shadow-soft" : "border-border bg-background hover:border-primary/50"}`}
              >
                <p className="font-mono text-xs uppercase tracking-widest text-primary">{m.tag}</p>
                <p className="font-display font-semibold">{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.subtitle}</p>
              </button>
            ))}
          </nav>
          <ul className="mt-4 hidden space-y-1 border-l border-border pl-3 text-sm text-muted-foreground lg:block">
            {mod.topics.map((t) => <li key={t.id}>{t.title}</li>)}
          </ul>
        </aside>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft md:p-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary"><BookOpen className="h-5 w-5" /></span>
            <div>
              <h2 className="font-display text-2xl font-bold">{mod.title}</h2>
              <p className="text-sm text-muted-foreground">{mod.subtitle}</p>
            </div>
          </div>
          <Accordion key={mod.id} type="multiple" defaultValue={mod.topics[0] ? [mod.topics[0].id] : []}>
            {mod.topics.map((t, i) => (
              <AccordionItem key={t.id} value={t.id}>
                <AccordionTrigger className="font-display text-lg hover:no-underline">
                  <span><span className="mr-2 font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>{t.title}</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-5 text-base leading-relaxed">
                  {t.theory.map((p, k) => <p key={k} className="max-w-prose">{p}</p>)}

                  <div className="rounded-xl bg-secondary p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Sigma className="h-4 w-4" />Fórmulas</p>
                    <ul className="space-y-1.5">
                      {t.formulas.map((f) => <li key={f} className="font-mono text-sm text-foreground">{f}</li>)}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border p-4">
                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary"><CheckCircle2 className="h-4 w-4" />Exemplo resolvido</p>
                    <p className="mb-3 font-medium">{t.example.problem}</p>
                    <ol className="space-y-2">
                      {t.example.steps.map((s, k) => (
                        <li key={k} className="flex gap-3 text-sm">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs text-primary-foreground">{k + 1}</span>
                          <span className="pt-0.5">{s}</span>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 font-mono text-sm font-semibold text-primary">Resposta: {t.example.answer}</p>
                  </div>

                  <div className="flex gap-3 rounded-xl border border-accent-strong/30 bg-accent-strong/10 p-4 text-sm">
                    <Lightbulb className="h-5 w-5 shrink-0 text-accent-strong" />
                    <p><strong>Teste no módulo {t.tip.module}:</strong> {t.tip.text}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </>
  );
}
