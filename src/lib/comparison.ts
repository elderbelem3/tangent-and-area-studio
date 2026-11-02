export const FUNCTION_SLOTS = ["f", "g", "h", "p", "q"] as const;
export const MAX_FUNCTIONS = 5;
export type ComparisonFunction = { slot: number; expression: string };

export function addComparisonFunction(functions: ComparisonFunction[]): ComparisonFunction[] {
  if (functions.length >= MAX_FUNCTIONS) return functions;
  const slot = FUNCTION_SLOTS.findIndex((_, index) => !functions.some((item) => item.slot === index));
  if (slot < 0) return functions;
  return [...functions, { slot, expression: "" }];
}

export function removeComparisonFunction(functions: ComparisonFunction[], slot: number): ComparisonFunction[] {
  return slot === 0 ? functions : functions.filter((item) => item.slot !== slot);
}

export const FUNCTION_TEXT_COLORS = ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4", "text-chart-5"];
export const FUNCTION_BG_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];