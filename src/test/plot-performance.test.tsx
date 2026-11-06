import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Plot } from "@/components/Plot";

vi.mock("@/lib/use-plot-viewport", () => ({
  usePlotViewport: (base: { xMin: number; xMax: number; yMin: number; yMax: number }) => ({
    ref: { current: null }, domain: base, cursor: null, changeScale: () => {}, reset: () => {},
  }),
}));

afterEach(cleanup);

describe("2D plot render work", () => {
  it("does not resample the curve or initial range when only the surrounding render changes", () => {
    const fn = vi.fn((x: number) => x * x);
    const view = render(<Plot fn={fn} xMin={-3} xMax={3} />);
    expect(fn.mock.calls.length).toBeGreaterThan(600);
    fn.mockClear();
    view.rerender(<Plot fn={fn} xMin={-3} xMax={3} />);
    // Only the exact crosshair readout evaluates f; cached samples are untouched.
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(0);
  });
});