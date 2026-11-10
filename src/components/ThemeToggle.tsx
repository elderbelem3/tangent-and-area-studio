import { useEffect, useId, useRef, useState } from "react";
import { Presentation, Flashlight, Sun, Moon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EV_THEME, type ThemeEventDetail } from "@/lib/theme-events";
import { readTheme, saveTheme, readBlacklight, saveBlacklight, type LabTheme } from "@/lib/theme";
const THEMES = [
  { value: "standard", label: "Modo Claro", icon: Sun },
  { value: "dark", label: "Modo Escuro", icon: Moon },
  { value: "chalkboard", label: "Modo Quadro Negro", icon: Presentation },
] as const;
export function ThemeToggle() {
  const [theme, setTheme] = useState<LabTheme>("standard");
  const [uv, setUv] = useState(false);
  const [uvHint, setUvHint] = useState(false);
  const touchHint = useRef(false);
  const descriptionId = useId();
  useEffect(() => {
    if (!uvHint) return;
    const timer = setTimeout(() => { touchHint.current = false; setUvHint(false); }, 15000);
    return () => clearTimeout(timer);
  }, [uvHint]);
  useEffect(() => {
    try { setTheme(readTheme(window.localStorage)); setUv(readBlacklight(window.localStorage)); } catch { /* Storage may be blocked. */ }
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("chalkboard", theme === "chalkboard");
    root.classList.toggle("dark", theme !== "standard");
    root.classList.toggle("blacklight", theme === "chalkboard" && uv);
  }, [theme, uv]);
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<ThemeEventDetail>).detail;
      if (d.chalkboard !== undefined) { const t: LabTheme = d.chalkboard ? "chalkboard" : "standard"; setTheme(t); try { saveTheme(window.localStorage, t); } catch { /* ignore */ } }
      if (d.blacklight !== undefined) { setUv(d.blacklight); try { saveBlacklight(window.localStorage, d.blacklight); } catch { /* ignore */ } }
    };
    window.addEventListener(EV_THEME, on);
    return () => window.removeEventListener(EV_THEME, on);
  }, []);
  function pickTheme(next: LabTheme) {
    setTheme(next);
    try { saveTheme(window.localStorage, next); } catch { /* Keep the current preference. */ }
  }
  function toggleUv() {
    setUv(!uv);
    try { saveBlacklight(window.localStorage, !uv); } catch { /* ignore */ }
  }
  const current = THEMES.find((t) => t.value === theme) ?? THEMES[0];
  const Icon = current.icon;
  return <TooltipProvider delayDuration={200}><div className={`flex shrink-0 items-center gap-2 ${theme === "chalkboard" ? "w-full justify-end border-t border-border py-2 sm:w-auto sm:border-t-0 sm:py-0" : ""}`}>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" aria-label="Tema" className="h-12 shrink-0 rounded-none px-3 text-muted-foreground">
          <Icon className="h-4 w-4" /><span className="hidden lg:inline">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => pickTheme(v as LabTheme)}>
          {THEMES.map((t) => <DropdownMenuRadioItem key={t.value} value={t.value} className="gap-2"><t.icon className="h-4 w-4" />{t.label}</DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    {theme === "chalkboard" && <div className="grid min-w-0 justify-items-end gap-1 py-2">
    <Tooltip open={uvHint} onOpenChange={(open) => { if (open || !touchHint.current) setUvHint(open); }}><TooltipTrigger asChild>
      <Button type="button" variant="outline" size="sm" aria-label="Luz Negra" aria-describedby={descriptionId} aria-pressed={uv} onPointerDown={(event) => { touchHint.current = event.pointerType === "touch"; }} onClick={() => { toggleUv(); if (touchHint.current) setUvHint(true); }} className="uv-toggle h-11 shrink-0 gap-2 rounded-lg px-3 font-semibold">
        <Flashlight className="h-5 w-5" /><span>Luz Negra</span><span className="font-mono text-xs">{uv ? "ON" : "UV"}</span>
      </Button>
    </TooltipTrigger><TooltipContent className="max-w-64 border border-border bg-popover text-popover-foreground text-sm leading-relaxed" side="bottom" sideOffset={48}>
      <p className="font-semibold">{uv ? "Visão Analítica UV ativa · toque para desativar" : "Ativar Visão Analítica UV"}</p>
      <p className="mt-1">Modo de inspeção avançada para o estudo de cálculo: realça informações dos gráficos, dados matemáticos e etapas de resolução com contraste analítico na lousa.</p>
    </TooltipContent></Tooltip>
    <p id={descriptionId} className="max-w-64 text-right text-xs leading-relaxed text-muted-foreground">Visão Analítica UV: inspeção de gráficos e dados na lousa.</p>
    </div>}
  </div></TooltipProvider>;
}
