import { useEffect, useState } from "react";
import { Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { readTheme, saveTheme, type LabTheme } from "@/lib/theme";
export function ThemeToggle() {
  const [theme, setTheme] = useState<LabTheme>("standard");
  useEffect(() => {
    try { setTheme(readTheme(window.localStorage)); } catch { /* Storage may be blocked. */ }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("chalkboard", theme === "chalkboard");
    document.documentElement.classList.toggle("dark", theme === "chalkboard");
  }, [theme]);
  function toggleTheme() {
    const next = theme === "standard" ? "chalkboard" : "standard";
    setTheme(next);
    try { saveTheme(window.localStorage, next); } catch { /* Keep the current preference. */ }
  }
  return <TooltipProvider delayDuration={200}><Tooltip><TooltipTrigger asChild>
    <Button type="button" variant="ghost" aria-label="Modo Quadro Negro" aria-pressed={theme === "chalkboard"} onClick={toggleTheme} className="h-12 shrink-0 rounded-none border-b-2 border-transparent px-3 text-muted-foreground aria-pressed:border-primary aria-pressed:text-primary">
      <Presentation className="h-4 w-4" /><span className="hidden lg:inline">Modo Quadro Negro</span>
    </Button>
  </TooltipTrigger><TooltipContent>Modo Quadro Negro</TooltipContent></Tooltip></TooltipProvider>;
}