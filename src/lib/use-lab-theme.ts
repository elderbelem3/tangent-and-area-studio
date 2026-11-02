import { useEffect, useState } from "react";

/** Observes the root theme classes set by ThemeToggle (hydration-safe: starts as standard). */
export function useLabTheme() {
  const [state, setState] = useState({ chalkboard: false, blacklight: false });
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setState({ chalkboard: root.classList.contains("chalkboard"), blacklight: root.classList.contains("blacklight") });
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return state;
}
