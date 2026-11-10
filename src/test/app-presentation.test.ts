import { describe, expect, it } from "vitest";
import { APP_SLIDES, movePresentationSlide, presentationSlide } from "@/lib/app-presentation";

describe("presentation navigation", () => {
  it("keeps the requested five-slide sequence bounded", () => {
    expect(APP_SLIDES).toHaveLength(5);
    expect(movePresentationSlide(1, -1)).toBe(1);
    expect(movePresentationSlide(4, 1)).toBe(5);
    expect(movePresentationSlide(5, 1)).toBe(5);
  });
  it("restores valid URL coordinates and rejects invalid ones", () => {
    expect(presentationSlide("3")).toBe(3);
    expect(presentationSlide(5)).toBe(5);
    expect(presentationSlide(6)).toBeUndefined();
    expect(presentationSlide(1.5)).toBeUndefined();
    expect(presentationSlide(undefined)).toBeUndefined();
  });
});