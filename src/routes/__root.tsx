import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { ChartSpline, MoveHorizontal, TrendingUp, Sigma, BookOpen, GraduationCap, ArrowUpRight, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HelpButton } from "@/components/GuidedTour";
import { AiMaintenanceDialog } from "@/components/AiMaintenance";
import { AI_MAINTENANCE } from "@/lib/ai-maintenance";
import chalkDust from "@/assets/chalk-dust.png.asset.json";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <div className="mt-6">
          <Link to="/" className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">A página não carregou</h1>
        <Button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CalculusLab" },
      { name: "description", content: "Laboratório interativo de Cálculo 1 e 2." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Space+Grotesk:wght@500;700&family=DM+Sans:wght@400;500;600&family=Roboto+Mono:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

const nav = [
  { to: "/", label: "Funções", icon: ChartSpline },
  { to: "/limites", label: "Limites", icon: MoveHorizontal },
  { to: "/derivadas", label: "Derivadas", icon: TrendingUp },
  { to: "/integrais", label: "Integrais", icon: Sigma },
  { to: "/aprenda", label: "Aprenda", icon: BookOpen },
  { to: "/ia", label: "IA", icon: BrainCircuit },
  { to: "/creditos", label: "Créditos", icon: GraduationCap },
] as const;

function RootComponent() {
  const [maintenance, setMaintenance] = useState(false);
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-shell min-h-screen bg-background">
        <img className="chalk-surface" src={chalkDust.url} alt="" aria-hidden="true" />
        <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 font-display text-2xl font-bold">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary font-mono text-2xl text-primary-foreground">∫</span>
              <span>Calculus<span className="text-primary">Lab</span></span>
            </Link>
            <HelpButton />
            </div>
            <span className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex"><GraduationCap className="h-4 w-4" />Cálculo Diferencial e Integral</span>
          </div>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center px-4 sm:px-7">
          <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto" aria-label="Módulos">
            {nav.map((n) => (
              <Button key={n.to} asChild variant="ghost" className="h-12 shrink-0 rounded-none border-b-2 border-transparent px-4 text-muted-foreground hover:bg-muted/60 hover:text-foreground">
                <Link to={n.to} onClick={(event) => { if (n.to === "/ia" && AI_MAINTENANCE) { event.preventDefault(); setMaintenance(true); } }} activeOptions={{ exact: true }} activeProps={{ className: "border-primary bg-primary/5 !text-primary" }}><n.icon className="h-4 w-4" />{n.label}</Link>
              </Button>
            ))}
          </nav>
          <ThemeToggle />
          </div>
        </header>
        <AiMaintenanceDialog open={maintenance} onOpenChange={setMaintenance} />
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 md:py-10">
          <div key={pathname} className="module-enter"><Outlet /></div>
        </main>
        <footer className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-6 text-xs text-muted-foreground sm:px-8">
          <span className="font-display font-medium">CalculusLab <span className="mx-2 text-border">/</span> Cálculo 1 e 2</span>
          <Link to="/creditos" className="inline-flex items-center gap-1.5 transition hover:text-primary">UniCatólica do RN<ArrowUpRight className="h-3 w-3" /></Link>
        </footer>
        <div className="chalk-tray" aria-hidden="true"><span className="chalk-eraser" /><span className="chalk-piece chalk-piece-white" /><span className="chalk-piece chalk-piece-blue" /><span className="chalk-piece chalk-piece-yellow" /><span className="chalk-piece chalk-piece-pink" /><span className="chalk-piece chalk-piece-green" /></div>
      </div>
    </QueryClientProvider>
  );
}
