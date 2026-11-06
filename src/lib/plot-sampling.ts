import type { Fn } from "./calc";

const BASE_SEGMENTS = 600;
const MAX_SEGMENTS = 2_400;

/** Maintain the initial x resolution on zoom out, with a bounded work budget. */
export function plotSampleCount(span: number, initialSpan: number, curveCount = 1): number {
  const budget = Math.max(300, Math.floor(MAX_SEGMENTS / Math.max(1, curveCount)));
  if (!Number.isFinite(span) || span <= 0 || !Number.isFinite(initialSpan) || initialSpan <= 0) return Math.min(budget, BASE_SEGMENTS);
  return Math.min(budget, Math.ceil(BASE_SEGMENTS * Math.max(1, span / initialSpan)));
}

export function plotSamples(xMin: number, xMax: number, initialSpan: number, curveCount = 1): number[] {
  const count = plotSampleCount(xMax - xMin, initialSpan, curveCount);
  return Array.from({ length: count + 1 }, (_, i) => xMin + (xMax - xMin) * i / count);
}

/** A sign change alone is not a discontinuity: continuous roots must stay joined.
 * Probe towards the crossing; a pole grows rather than converging to zero.
 */
function crossesPole(fn: Fn, left: number, right: number, a: number, b: number): boolean {
  if (a === 0 || b === 0 || Math.sign(a) === Math.sign(b)) return false;
  const growth = Math.max(Math.abs(a), Math.abs(b), 1e-12) * 4;
  for (let i = 0; i < 16; i++) {
    const mid = left + (right - left) / 2;
    const value = fn(mid);
    if (!Number.isFinite(value) || Math.abs(value) > growth) return true;
    if (value === 0) return false;
    if (Math.sign(value) === Math.sign(a)) { left = mid; a = value; }
    else right = mid;
  }
  return false;
}

export type CurveSample = { x: number; y: number | null; breakBefore: boolean };
export type CurvePoint = { x: number; y: number };

/** Independent subpaths: a rejected edge never survives into rendering. */
export function curveSegments(points: CurveSample[]): CurvePoint[][] {
  const segments: CurvePoint[][] = [];
  let current: CurvePoint[] = [];
  for (const point of points) {
    if (point.y === null || point.breakBefore) {
      if (current.length) segments.push(current);
      current = [];
    }
    if (point.y !== null) current.push({ x: point.x, y: point.y });
  }
  if (current.length) segments.push(current);
  return segments;
}

/** Null separator rows create distinct Recharts subpaths without losing restart points.
 * Only the broken curve is interrupted; other curves and tangents stay continuous.
 */
export function curveChartRows(xs: number[], curves: { key: string; points: CurveSample[] }[]): Record<string, number | null>[] {
  const rows: Record<string, number | null>[] = [];
  xs.forEach((x, index) => {
    const row: Record<string, number | null> = { x };
    let hasBreak = false;
    for (const curve of curves) {
      row[curve.key] = curve.points[index]?.y ?? null;
      hasBreak ||= curve.points[index]?.breakBefore ?? false;
    }
    if (hasBreak) {
      const separator = { ...row };
      for (const curve of curves) {
        if (curve.points[index]?.breakBefore) separator[curve.key] = null;
      }
      rows.push(separator);
    }
    rows.push(row);
  });
  return rows;
}

/** Shared discontinuity handling for both 2D renderers; never alters fn itself. */
export function sampleCurve(fn: Fn, xs: number[], yMin: number, yMax: number): CurveSample[] {
  const span = Math.max(yMax - yMin, Number.EPSILON);
  let previousX = 0, previousY = NaN;
  return xs.map((x, index) => {
    const value = fn(x);
    const finite = Number.isFinite(value);
    let breakBefore = index > 0 && (!finite || !Number.isFinite(previousY));
    if (index > 0 && finite && Number.isFinite(previousY)) {
      // Reject unsafe jumps before spending work probing the interval.
      breakBefore = Math.abs(value - previousY) > span * 3;
      if (!breakBefore) {
        const mid = fn(previousX + (x - previousX) / 2);
        breakBefore = !Number.isFinite(mid)
          || Math.abs(mid - (value + previousY) / 2) > span * 2
          || crossesPole(fn, previousX, x, previousY, value);
      }
    }
    previousX = x; previousY = value;
    return { x, y: finite && value >= yMin - span * 3 && value <= yMax + span * 3 ? value : null, breakBefore };
  });
}