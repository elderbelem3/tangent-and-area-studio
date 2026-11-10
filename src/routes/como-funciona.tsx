import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Code2, FileCode2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/Lab";
import { CODE_GUIDE } from "@/lib/code-guide";
import { useModuleState } from "@/lib/module-state";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({ meta: [
    { title: "Como o código funciona · CalculusLab" },
    { name: "description", content: "Guia do código do CalculusLab: arquitetura, funcionalidades de cada aba, motor matemático, gráficos, temas e ligações entre módulos." },
    { property: "og:title", content: "Como o código funciona · CalculusLab" },
    { property: "og:description", content: "Entenda o caminho da digitação ao cálculo e ao gráfico, com explicações por aba e trechos reais de código." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CodeGuidePage,
});

function CodeGuidePage() {
  const [selected, setSelected] = useModuleState("code-guide.selected", "arquitetura");
  const [query, setQuery] = useModuleState("code-guide.query", "");
  const section = CODE_GUIDE.find((item) => item.id === selected) ?? CODE_GUIDE[0];
  if (!section) return null;
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  const visible = CODE_GUIDE.filter((item) => [item.title, item.summary, ...item.files.flatMap((file) => [file.path, file.role]), ...item.topics.flatMap((topic) => [topic.title, topic.text])].join(" ").toLocaleLowerCase("pt-BR").includes(normalized));
  const index = CODE_GUIDE.indexOf(section);
  const previous = CODE_GUIDE[index - 1];
  const next = CODE_GUIDE[index + 1];
  const select = (id: string) => {
    setSelected(id);
    requestAnimationFrame(() => document.getElementById("guide-content")?.scrollIntoView({ block: "start", behavior: "instant" }));
  };

  return <>
    <Button asChild variant="ghost" size="sm" className="mb-4 px-0 text-muted-foreground"><Link to="/"><ArrowLeft className="h-4 w-4" />Voltar às Funções</Link></Button>
    <PageHeader tag="Como Usar · Guia do projeto" title="Como o código funciona" desc="Da expressão ao resultado: entenda cada aba, os arquivos envolvidos e como as funcionalidades se conectam." />
    <div className="grid min-w-0 gap-8 lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-40 lg:max-h-[calc(100dvh-11rem)] lg:self-start lg:overflow-y-auto">
        <label htmlFor="guide-search" className="mb-2 block text-sm font-medium">Buscar no guia</label>
        <div className="relative mb-4"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="guide-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Aba, recurso ou arquivo…" className="h-11 pl-9" /></div>
        <nav aria-label="Índice do código" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {visible.map((item) => <Button key={item.id} type="button" variant="ghost" aria-pressed={selected === item.id} onClick={() => select(item.id)} className={`h-auto min-h-11 w-56 shrink-0 justify-start gap-3 whitespace-normal px-3 py-3 text-left lg:w-full ${selected === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><span className="shrink-0 font-mono text-xs">{String(CODE_GUIDE.indexOf(item) + 1).padStart(2, "0")}</span><span>{item.title}</span></Button>)}
        </nav>
        {visible.length === 0 && <p role="status" className="py-3 text-sm text-muted-foreground">Nenhum tópico encontrado.</p>}
        <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">{CODE_GUIDE.length} capítulos · Abas, ferramentas e conexões</p>
      </aside>

      <article id="guide-content" aria-label={section.title} className="min-w-0 scroll-mt-72 sm:scroll-mt-44">
        <header className="border-b border-border pb-5">
          <p className="mb-2 flex items-center gap-2 font-mono text-xs text-primary"><Code2 className="h-4 w-4" />CAPÍTULO {String(index + 1).padStart(2, "0")} / {CODE_GUIDE.length}</p>
          <h2 className="font-display text-2xl font-bold">{section.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.summary}</p>
        </header>
        <section className="border-b border-border py-6" aria-label="Fluxo da funcionalidade">
          <h3 className="mb-4 text-sm font-semibold">Caminho dos dados</h3>
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{section.flow.map((step, i) => <li key={step} className="flex min-w-0 items-start gap-2 border-l-2 border-primary/40 pl-3"><span className="font-mono text-xs text-primary">{i + 1}</span><span className="min-w-0 text-sm leading-relaxed">{step}</span></li>)}</ol>
        </section>
        <div className="space-y-6 py-6">{section.topics.map((topic) => <section key={topic.title}><h3 className="mb-2 flex items-start gap-2 font-display text-lg font-semibold"><BookOpen aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-primary" />{topic.title}</h3><p className="text-sm leading-7 text-muted-foreground">{topic.text}</p></section>)}</div>
        <section className="border-y border-border py-6" aria-label="Arquivos envolvidos">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold"><FileCode2 className="h-5 w-5 text-primary" />Onde isso está no código</h3>
          <dl className="space-y-4">{section.files.map((file) => <div key={file.path}><dt className="break-words font-mono text-xs font-semibold leading-6 text-primary">{file.path}</dt><dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{file.role}</dd></div>)}</dl>
        </section>
        <Accordion key={section.id} type="single" collapsible defaultValue="code" className="mt-3">
          <AccordionItem value="code"><AccordionTrigger className="text-left font-semibold"><span className="flex items-center gap-2"><Code2 className="h-4 w-4 text-primary" />Trecho de código explicado</span></AccordionTrigger><AccordionContent>
            <p className="mb-3 break-words font-mono text-xs leading-relaxed text-muted-foreground">{section.code.path}</p>
            <pre className="max-w-full overflow-x-auto rounded-lg border border-border bg-secondary p-4 text-xs leading-6 text-foreground" tabIndex={0} aria-label="Trecho de código"><code>{section.code.source}</code></pre>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{section.code.explanation}</p>
          </AccordionContent></AccordionItem>
        </Accordion>
        <nav aria-label="Navegação dos capítulos" className="mt-6 flex flex-wrap justify-between gap-3 border-t border-border pt-5">
          <Button type="button" variant="outline" disabled={!previous} onClick={() => previous && select(previous.id)}><ArrowLeft className="h-4 w-4" />Anterior</Button>
          <Button type="button" disabled={!next} onClick={() => next && select(next.id)}>Próximo capítulo<ArrowRight className="h-4 w-4" /></Button>
        </nav>
      </article>
    </div>
  </>;
}