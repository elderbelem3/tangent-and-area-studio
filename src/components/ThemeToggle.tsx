import { useEffect, useState } from "react";
import { Presentation, Flashlight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { readTheme, saveTheme, readBlacklight, saveBlacklight, type LabTheme } from "@/lib/theme";
export function ThemeToggle() {
  const [theme, setTheme] = useState<LabTheme>("standard");
  const [uv, setUv] = useState(false);
  useEffect(() => {
    try { setTheme(readTheme(window.localStorage)); setUv(readBlacklight(window.localStorage)); } catch { /* Storage may be blocked. */ }
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("chalkboard", theme === "chalkboard");
    root.classList.toggle("dark", theme === "chalkboard");
    root.classList.toggle("blacklight", theme === "chalkboard" && uv);
  }, [theme, uv]);
  function toggleTheme() {
    const next = theme === "standard" ? "chalkboard" : "standard";
    setTheme(next);
    try { saveTheme(window.localStorage, next); } catch { /* Keep the current preference. */ }
  }
  function toggleUv() {
    setUv(!uv);
    try { saveBlacklight(window.localStorage, !uv); } catch { /* ignore */ }
  }
  return <TooltipProvider delayDuration={200}><div className="flex shrink-0 items-center">
    <Tooltip><TooltipTrigger asChild>
      <Button type="button" variant="ghost" aria-label="Modo Quadro Negro" aria-pressed={theme === "chalkboard"} onClick={toggleTheme} className="h-12 shrink-0 rounded-none border-b-2 border-transparent px-3 text-muted-foreground aria-pressed:border-primary aria-pressed:text-primary">
        <Presentation className="h-4 w-4" /><span className="hidden lg:inline">Modo Quadro Negro</span>
      </Button>
    </TooltipTrigger><TooltipContent>Modo Quadro Negro</TooltipContent></Tooltip>
    {theme === "chalkboard" && <Tooltip><TooltipTrigger asChild>
      <Button type="button" variant="ghost" size="sm" aria-label="Luz Negra" aria-pressed={uv} onClick={toggleUv} className="uv-toggle h-9 w-9 shrink-0 rounded-full p-0 text-muted-foreground">
        <Flashlight className="h-4 w-4" />
      </Button>
    </TooltipTrigger><TooltipContent>Luz Negra (visão analítica)</TooltipContent></Tooltip>}
  </div></TooltipProvider>;
}
