import { useEffect, useState } from "react";
import { Presentation, Flashlight, Sun, Moon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EV_THEME, type ThemeEventDetail } from "@/lib/copilot-actions";
import { readTheme, saveTheme, readBlacklight, saveBlacklight, type LabTheme } from "@/lib/theme";
const THEMES = [
  { value: "standard", label: "Modo Claro", icon: Sun },
  { value: "dark", label: "Modo Escuro", icon: Moon },
  { value: "chalkboard", label: "Modo Quadro Negro", icon: Presentation },
] as const;
export function ThemeToggle() {
  const [theme, setTheme] = useState<LabTheme>("standard");
  const [uv, setUv] = useState(false);
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
  return <TooltipProvider delayDuration={200}><div className="flex shrink-0 items-center">
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
    {theme === "chalkboard" && <Tooltip><TooltipTrigger asChild>
      <Button type="button" variant="ghost" size="sm" aria-label="Luz Negra" aria-pressed={uv} onClick={toggleUv} className="uv-toggle h-9 w-9 shrink-0 rounded-full p-0 text-muted-foreground">
        <Flashlight className="h-4 w-4" />
      </Button>
    </TooltipTrigger><TooltipContent>Luz Negra (visão analítica)</TooltipContent></Tooltip>}
  </div></TooltipProvider>;
}
