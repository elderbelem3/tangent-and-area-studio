export type MathSuggestion = { label: string; expression: string; latex: string; argument: boolean };
export type SuggestionContext = { start: number; token: string; suggestions: MathSuggestion[] };
const functions: MathSuggestion[] = ["sin", "cos", "tan", "sqrt", "exp", "abs", "ln", "log10"].map((name) => ({
  label: `${name}(x)`, expression: `${name}(x)`, latex: `\\operatorname{${name}}\\left(x\\right)`, argument: true,
}));
const baseTwo: MathSuggestion = { label: "log_2(x)", expression: "log(x, 2)", latex: "\\operatorname{log}_{2}\\left(x\\right)", argument: true };

export function mathSuggestions(prefix: string): SuggestionContext | null {
  const power = prefix.match(/x\s*\^\s*(?:\(\s*\))?$/);
  if (power && power.index !== undefined) return { start: power.index, token: power[0], suggestions: [2, 3].map((n) => ({ label: `x^${n}`, expression: `x^${n}`, latex: `x^{${n}}`, argument: false })) };
  const match = prefix.match(/([a-zA-Z][a-zA-Z0-9]*)$/);
  if (!match || match.index === undefined) return null;
  const token = match[1] ?? "";
  const suggestions = token.toLowerCase().startsWith("log")
    ? [baseTwo, ...functions.filter((f) => f.label.startsWith("log10") || f.label.startsWith("ln"))]
    : functions.filter((f) => f.label.startsWith(token.toLowerCase()));
  return suggestions.length ? { start: match.index, token, suggestions } : null;
}