export type LabTheme = "standard" | "chalkboard";
export const THEME_STORAGE_KEY = "calculuslab-theme";
type ThemeStorage = Pick<Storage, "getItem" | "setItem">;
export function readTheme(storage: ThemeStorage): LabTheme {
  try { return storage.getItem(THEME_STORAGE_KEY) === "chalkboard" ? "chalkboard" : "standard"; }
  catch { return "standard"; }
}
export function saveTheme(storage: ThemeStorage, theme: LabTheme) {
  try { storage.setItem(THEME_STORAGE_KEY, theme); } catch { /* Keep the in-memory preference. */ }
}export const UV_STORAGE_KEY = "calculuslab-blacklight";
export function readBlacklight(storage: ThemeStorage): boolean {
  try { return storage.getItem(UV_STORAGE_KEY) === "on"; } catch { return false; }
}
export function saveBlacklight(storage: ThemeStorage, on: boolean) {
  try { storage.setItem(UV_STORAGE_KEY, on ? "on" : "off"); } catch { /* ignore */ }
}
