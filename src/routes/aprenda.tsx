import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BookOpen, CheckCircle2, Lightbulb, Sigma, Bookmark, ArrowUpRight, AlertCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/Lab";
import { MathFormula } from "@/components/MathFormula";
import { LEARN } from "@/lib/learn-content";

export const Route = createFileRoute("/aprenda")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Aprenda · Manual de Cálculo 1 e 2 · CalculusLab" },
      { name: "description", content: "Manual avançado de Cálculo 1 e 2: funções, limites, derivadas, integrais, séries e várias variáveis, com teoremas e exemplos resolvidos." },
      { property: "og:title", content: "Aprenda · Manual de Cálculo 1 e 2 · CalculusLab" },
      { property: "og:description", content: "33 tópicos de cálculo com definições rigorosas, fórmulas e exemplos detalhados passo a passo." },
    ],
  }),
  component: Aprenda,
});

function Aprenda() {
  const [active, setActive] = useState(LEARN[0]?.id ?? "");
  const [opened, setOpened] = useState<string[]>(LEARN[0]?.topics[0] ? [LEARN[0].topics[0].id] : []);
  const mod = LEARN.find((m) => m.id === active) ?? LEARN[0];
  if (!mod) return null;

  const selectModule = (id: string) => {
    const next = LEARN.find((unit) => unit.id === id);
    if (!next) return;
    setActive(id);
    setOpened(next.topics[0] ? [next.topics[0].id] : []);
  };
  const selectTopic = (id: string) => {
    setOpened((current) => current.includes(id) ? current : [...current, id]);
    requestAnimationFrame(() => document.getElementById(`topic-${id}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }));
  };

  return (
    <>
      <PageHeader tag="Manual de estudos" title="Aprenda" desc="Cálculo 1 e 2: fundamentos, teoremas e aplicações." />
      <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-36 lg:max-h-[calc(100dvh-10rem)] lg:self-start lg:overflow-y-auto">
          <nav aria-label="Índice do manual" className="space-y-5">
            {(["Cálculo 1", "Cálculo 2"] as const).map((course) => (
              <div key={course}>
                <h2 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-primary"><BookOpen className="h-4 w-4" />{course}</h2>
                <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
                  {LEARN.filter((m) => m.course === course).map((m) => (
                    <Button variant="ghost" aria-pressed={m.id === active} key={m.id} onClick={() => selectModule(m.id)}
                      className={`h-auto min-w-52 shrink-0 flex-col items-start gap-1 whitespace-normal rounded-xl border px-3 py-3 text-left lg:min-w-0 ${m.id === active ? "border-primary bg-card shadow-soft" : "border-border bg-background hover:border-primary/50"}`}>
                      <span className="font-mono text-xs text-muted-foreground">{m.tag} · {m.topics.length} tópicos</span>
                      <span className="font-display text-sm font-semibold">{m.title}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <nav aria-label="Tópicos da unidade" className="mt-4 hidden border-t border-border pt-4 lg:block">
            {mod.topics.map((t, i) => <Button key={t.id} variant="ghost" onClick={() => selectTopic(t.id)} className="h-auto w-full justify-start gap-2 whitespace-normal px-2 py-2 text-left text-xs text-muted-foreground"><span className="shrink-0 font-mono text-primary">{String(i+1).padStart(2,"0")}</span>{t.title}</Button>)}
          </nav>
        </aside>

        <section key={mod.id} className="module-enter min-w-0" aria-label={mod.title}>
          <header className="mb-4 border-b border-border pb-5">
            <p className="mb-2 font-mono text-xs text-primary">{mod.course} / {mod.tag}</p>
            <h2 className="font-display text-2xl font-bold">{mod.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{mod.subtitle}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{mod.topics.length} tópicos · Teoria e exemplos</span>
              <Button variant="ghost" size="sm" onClick={() => setOpened(opened.length === mod.topics.length ? [] : mod.topics.map(t => t.id))}><BookOpen className="h-4 w-4" />{opened.length === mod.topics.length ? "Recolher todos" : "Expandir todos"}</Button>
            </div>
          </header>
          <Accordion type="multiple" value={opened} onValueChange={setOpened}>
            {mod.topics.map((t, i) => (
              <AccordionItem id={`topic-${t.id}`} key={t.id} value={t.id} className="scroll-mt-40">
                <AccordionTrigger className="font-display text-lg hover:no-underline">
                  <span className="flex items-start gap-3 text-left"><span className="mt-1 shrink-0 font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</span><span>{t.title}</span></span>
                </AccordionTrigger>
                <AccordionContent className="min-w-0 space-y-6 break-words pb-8 text-base leading-relaxed">
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Definição e fundamentos</h3>
                    {t.theory.map((p, k) => <p key={k}>{p}</p>)}
                  </div>
                  {t.theorem && <aside className="border-l-4 border-primary bg-primary/5 p-4">
                    <h3 className="mb-2 flex items-center gap-2 font-display font-semibold text-primary"><Bookmark className="h-4 w-4 shrink-0" />{t.theorem.title}</h3>
                    <p className="text-sm leading-relaxed">{t.theorem.text}</p>
                  </aside>}
                  <div className="min-w-0 rounded-xl bg-secondary p-4 md:p-5">
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><Sigma className="h-4 w-4" />Fórmulas essenciais</h3>
                    {t.formulas.map((f) => <MathFormula key={f} formula={f} />)}
                  </div>
                  <div className="border-y border-border py-5">
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-primary"><CheckCircle2 className="h-4 w-4" />Exemplo resolvido</h3>
                    <p className="mb-4 font-medium">{t.example.problem}</p>
                    <ol className="space-y-3">
                      {t.example.steps.map((s, k) => (
                        <li key={k} className="flex gap-3 text-sm leading-relaxed">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">{k + 1}</span>
                          <span className="min-w-0 pt-0.5">{s}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-4 min-w-0 rounded-lg bg-primary/5 px-4 py-3 text-primary"><p className="text-xs font-semibold">Resultado</p><MathFormula formula={t.example.answer} /></div>
                  </div>
                  {t.warning && <p className="flex items-start gap-2 text-sm text-muted-foreground"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{t.warning}</span></p>}
                  <aside className="border-l-4 border-accent-strong bg-accent-strong/5 p-4 text-sm">
                    <h3 className="mb-2 flex items-center gap-2 font-semibold text-accent-strong"><Lightbulb className="h-4 w-4" />Conexão com {t.tip.module}</h3>
                    <p className="leading-relaxed">{t.tip.text}</p>
                    <Button variant="link" asChild className="mt-2 h-auto px-0 text-accent-strong"><a href={{"Funções":"/","Limites":"/limites","Derivadas":"/derivadas","Integrais":"/integrais"}[t.tip.module]}>Ir para {t.tip.module}<ArrowUpRight className="h-4 w-4" /></a></Button>
                  </aside>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </>
  );
}
