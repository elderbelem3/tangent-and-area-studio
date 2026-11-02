import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * In-memory store that outlives route unmounts, so each module keeps its inputs
 * while the user navigates between tabs. It starts empty on page load, so the
 * server render and the first client render always match.
 */
const store = new Map<string, unknown>();

export function useModuleState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => store.has(key) ? (store.get(key) as T) : typeof initial === "function" ? (initial as () => T)() : initial);
  useEffect(() => { store.set(key, value); }, [key, value]);
  return [value, setValue];
}

/** Test helper. */
export function clearModuleState() { store.clear(); }
