import { AlertCircle, BookOpen, ChartSpline, Infinity, Sigma, TrendingUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MathFormula } from "@/components/MathFormula";
import { RULE_PILLARS } from "@/lib/learn-rules";
import { useModuleState } from "@/lib/module-state";

const PILLAR_ICONS = [ChartSpline, Infinity, TrendingUp, Sigma];

export function LearnRules() {
  const [active, setActive] = useModuleState("aprenda.rules.active", "funcoes");
  const [opened, setOpened] = useModuleState<string[]>("aprenda.rules.opened", ["funcoes-dominio-imagem"]);

  return (
    <section aria-labelledby="learn-rules-title" className="mb-10 min-w-0 border-b border-border pb-8">
      <header className="mb-5">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-primary"><BookOpen className="h-4 w-4" />Os quatro pilares do cálculo</p>
        <h2 id="learn-rules-title" className="font-display text-2xl font-bold">Regras e Propriedades</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Fundamentos, fórmulas e condições de aplicação de Cálculo 1 e 2.</p>
      </header>
      <Tabs value={active} onValueChange={setActive}>
        <TabsList aria-label="Pilares do cálculo" className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
          {RULE_PILLARS.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index] ?? BookOpen;
            return <TabsTrigger key={pillar.id} value={pillar.id} className="min-h-11 gap-2 px-2"><Icon aria-hidden="true" className="h-4 w-4 shrink-0" />{pillar.title}</TabsTrigger>;
          })}
        </TabsList>
        {RULE_PILLARS.map((pillar) => (
          <TabsContent key={pillar.id} value={pillar.id} className="mt-6 min-w-0">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-semibold">{pillar.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pillar.subtitle}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{pillar.rules.length} tópicos</span>
            </div>
            <Accordion type="multiple" value={opened} onValueChange={setOpened}>
              {pillar.rules.map((rule, index) => {
                const value = `${pillar.id}-${rule.id}`;
                return (
                  <AccordionItem key={value} value={value}>
                    <AccordionTrigger className="min-h-12 text-left hover:no-underline">
                      <span className="flex min-w-0 items-start gap-3"><span className="mt-0.5 shrink-0 font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span><span>{rule.title}</span></span>
                    </AccordionTrigger>
                    <AccordionContent className="min-w-0 space-y-4 break-words pb-6 text-sm leading-relaxed">
                      <p>{rule.explanation}</p>
                      <div className="min-w-0 border-y border-border bg-secondary/50 px-3 py-2 sm:px-5">
                        {rule.formulas.map((formula) => <MathFormula key={formula} formula={formula} />)}
                      </div>
                      <aside className="flex items-start gap-2 border-l-2 border-accent-strong pl-3 text-muted-foreground">
                        <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong" />
                        <div className="min-w-0"><h4 className="mb-1 font-semibold text-foreground">Condições de aplicação</h4><p>{rule.condition}</p></div>
                      </aside>
                      <div className="min-w-0 border-l-2 border-primary pl-3 sm:pl-5">
                        <h4 className="mb-1 font-semibold text-primary">Exemplo</h4>
                        <p>{rule.example.text}</p>
                        <MathFormula formula={rule.example.formula} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}