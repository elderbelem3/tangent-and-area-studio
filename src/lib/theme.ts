export type LabTheme = "standard" | "chalkboard";
export const THEME_STORAGE_KEY = "calculuslab-theme";
type ThemeStorage = Pick<Storage, "getItem" | "setItem">;
export function readTheme(storage: ThemeStorage): LabTheme {
  try { return storage.getItem(THEME_STORAGE_KEY) === "chalkboard" ? "chalkboard" : "standard"; }
  catch { return "standard"; }
}
export function saveTheme(storage: ThemeStorage, theme: LabTheme) {
  try { storage.setItem(THEME_STORAGE_KEY, theme); } catch { /* Keep the in-memory preference. */ }
}