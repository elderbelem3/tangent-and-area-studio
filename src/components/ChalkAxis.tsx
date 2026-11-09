export function ChalkAxis({ x1, y1, x2, y2, color = "var(--axis)" }: { x1?: number; y1?: number; x2?: number; y2?: number; color?: string }) {
  if (x1 === undefined || x2 === undefined || y1 === undefined || y2 === undefined) return null;
  const horizontal = Math.abs(y1 - y2) < 1;
  return <g className="chalk-axis-drawing" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round">
    <line x1={x1} y1={y1} x2={x2} y2={y2} />
    {horizontal ? <>
      <path className="chalk-axis-arrow" d={`M${x1 + 8},${y1 - 5} L${x1},${y1} L${x1 + 8},${y1 + 5} M${x2 - 8},${y2 - 5} L${x2},${y2} L${x2 - 8},${y2 + 5}`} />
      <text className="chalk-axis-arrow chalk-label" x={x2 - 14} y={y2 - 10} fill={color} stroke="none">x</text>
    </> : <>
      <path className="chalk-axis-arrow" d={`M${x1 - 5},${y1 + 8} L${x1},${y1} L${x1 + 5},${y1 + 8} M${x2 - 5},${y2 - 8} L${x2},${y2} L${x2 + 5},${y2 - 8}`} />
      <text className="chalk-axis-arrow chalk-label" x={x1 + 10} y={y1 + 16} fill={color} stroke="none">y</text>
    </>}
  </g>;
}