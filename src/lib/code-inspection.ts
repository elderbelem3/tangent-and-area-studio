import { parse } from "mathjs";
import { normalize } from "./calc";
import type { CurveSample } from "./plot-sampling";

export type RenderTrace = {
  expression: string;
  renderer: string;
  count: number;
  points: { x: number; y: number | null; z?: number | null; breakBefore?: boolean }[];
  status: string;
};

/** A bounded preview of the actual renderer input, not a second sampling pass. */
export function tracePoints(points: CurveSample[], limit = 12) {
  return points.slice(0, limit).map(({ x, y, breakBefore }) => ({ x, y, breakBefore }));
}

export function inspectParsing(expression: string) {
  const normalized = normalize(expression);
  try {
    const tree = parse(normalized);
    const nodes: { type: string; expression: string }[] = [];
    tree.traverse((node) => { if (nodes.length < 80) nodes.push({ type: node.type, expression: node.toString() }); });
    return { normalized, nodes, error: null };
  } catch (error) {
    return { normalized, nodes: [], error: error instanceof Error ? error.message : "Expressão incompleta" };
  }
}