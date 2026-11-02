import { fmt } from "@/lib/calc";
import type { PlotAnnotation } from "@/lib/plot-annotations";
export function ChalkAnnotation({ cx, cy, point, color = "var(--primary)" }: {
  cx?: number; cy?: number; point: PlotAnnotation; color?: string;
}) {
  if (cx === undefined || cy === undefined) return null;
  return <g className="chalk-annotation" stroke={color} fill="none" strokeWidth={1.6}>
    <title>{point.kind} ≈ ({fmt(point.x, 3)}, {fmt(point.y, 3)})</title>
    <ellipse cx={cx} cy={cy} rx={7} ry={6} transform={`rotate(-12 ${cx} ${cy})`} />
    <path d={`M${cx + 8},${cy - 7} Q${cx + 17},${cy - 23} ${cx + 30},${cy - 21} M${cx + 8},${cy - 7} l1,-7 m-1,7 l7,-2`} strokeLinecap="round" />
    <text x={cx + 31} y={cy - 19} fill={color} stroke="none" className="chalk-label">{point.kind}</text>
  </g>;
}