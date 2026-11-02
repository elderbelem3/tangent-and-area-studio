import { describe, expect, it } from "vitest";
import { readTheme, saveTheme, THEME_STORAGE_KEY } from "@/lib/theme";
describe("Chalkboard preference", () => {
  function storage() {
    const values = new Map<string, string>();
    return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  }
  it("starts in standard mode without a saved choice", () => { expect(readTheme(storage())).toBe("standard"); });
  it("retains chalkboard mode for subsequent reads", () => {
    const store = storage(); saveTheme(store, "chalkboard");
    expect(store.getItem(THEME_STORAGE_KEY)).toBe("chalkboard"); expect(readTheme(store)).toBe("chalkboard");
  });
  it("retains standard mode after disabling the chalkboard", () => {
    const store = storage(); saveTheme(store, "chalkboard"); saveTheme(store, "standard"); expect(readTheme(store)).toBe("standard");
  });
  it("handles blocked storage without breaking the theme", () => {
    const store = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
    expect(readTheme(store)).toBe("standard"); expect(() => saveTheme(store, "chalkboard")).not.toThrow();
  });
});import { readBlacklight, saveBlacklight } from "@/lib/theme";
describe("Blacklight preference", () => {
  it("starts off and retains on", () => {
    const values = new Map<string, string>();
    const store = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
    expect(readBlacklight(store)).toBe(false); saveBlacklight(store, true); expect(readBlacklight(store)).toBe(true);
  });
});
