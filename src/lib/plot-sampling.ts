import type { Fn } from "./calc";

const BASE_SEGMENTS = 600;
const MAX_SEGMENTS = 12_000;

/** Maintain the initial x resolution on zoom out, with a bounded work budget. */
export function plotSampleCount(span: number, initialSpan: number): number {
  if (!Number.isFinite(span) || span <= 0 || !Number.isFinite(initialSpan) || initialSpan <= 0) return BASE_SEGMENTS;
  return Math.min(MAX_SEGMENTS, Math.ceil(BASE_SEGMENTS * Math.max(1, span / initialSpan)));
}

export function plotSamples(xMin: number, xMax: number, initialSpan: number): number[] {
  const count = plotSampleCount(xMax - xMin, initialSpan);
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

/** Shared discontinuity handling for both 2D renderers; never alters fn itself. */
export function sampleCurve(fn: Fn, xs: number[], yMin: number, yMax: number): CurveSample[] {
  const span = Math.max(yMax - yMin, Number.EPSILON);
  let previousX = 0, previousY = NaN;
  return xs.map((x, index) => {
    const value = fn(x);
    const finite = Number.isFinite(value);
    let breakBefore = index > 0 && (!finite || !Number.isFinite(previousY));
    if (index > 0 && finite && Number.isFinite(previousY)) {
      const mid = fn(previousX + (x - previousX) / 2);
      breakBefore = Math.abs(value - previousY) > span * 2
        || !Number.isFinite(mid)
        || Math.abs(mid - (value + previousY) / 2) > span * 2
        || crossesPole(fn, previousX, x, previousY, value);
    }
    previousX = x; previousY = value;
    return { x, y: finite && value >= yMin - span * 3 && value <= yMax + span * 3 ? value : null, breakBefore };
  });
}