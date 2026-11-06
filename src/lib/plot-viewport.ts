export type PlotDomain = { xMin: number; xMax: number; yMin: number; yMax: number };
export type PlotRect = { left: number; top: number; width: number; height: number };
export function transformedDomain(base: PlotDomain, rect: PlotRect, transform: { k: number; x: number; y: number }): PlotDomain {
  const { k, x, y } = transform;
  const dx = base.xMax - base.xMin, dy = base.yMax - base.yMin;
  return {
    xMin: base.xMin + ((rect.left - x) / k - rect.left) / rect.width * dx,
    xMax: base.xMin + ((rect.left + rect.width - x) / k - rect.left) / rect.width * dx,
    yMin: base.yMax - ((rect.top + rect.height - y) / k - rect.top) / rect.height * dy,
    yMax: base.yMax - ((rect.top - y) / k - rect.top) / rect.height * dy,
  };
}
export function plotCoordinate(domain: PlotDomain, rect: PlotRect, x: number, y: number) {
  return { x: domain.xMin + (x - rect.left) / rect.width * (domain.xMax - domain.xMin), y: domain.yMax - (y - rect.top) / rect.height * (domain.yMax - domain.yMin) };
}
export function axisTicks(min: number, max: number, count = 6): number[] {
  const raw = (max - min) / count;
  if (!Number.isFinite(raw) || raw <= 0) return [];
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((v) => v * power >= raw) ?? 10) * power;
  const start = Math.ceil(min / step);
  return Array.from({ length: Math.min(30, Math.max(0, Math.floor(max / step) - start + 1)) }, (_, i) => Number(((start + i) * step).toPrecision(12)));
}
export function axisLabel(value: number, span: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) >= 1e6 || span < 1e-4) return value.toExponential(2);
  return String(Number(value.toFixed(Math.min(10, Math.max(0, 2 - Math.floor(Math.log10(span / 6)))))));
}