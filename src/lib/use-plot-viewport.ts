import { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { plotCoordinate, transformedDomain, type PlotDomain, type PlotRect } from "./plot-viewport";

export function usePlotViewport(base: PlotDomain, resetKey: string) {
  const ref = useRef<HTMLDivElement>(null);
  const behavior = useRef<ZoomBehavior<HTMLDivElement, unknown> | null>(null);
  const baseRef = useRef(base); baseRef.current = base;
  const [view, setView] = useState<PlotDomain | null>(null);
  const viewRef = useRef<PlotDomain | null>(null);
  const [cursor, setCursor] = useState<{ px: number; py: number; x: number; y: number; rect: PlotRect } | null>(null);
  function rect(): PlotRect | null {
    const el = ref.current;
    const area = el?.querySelector("[data-plot-area], .recharts-cartesian-grid");
    if (!el || !area) return null;
    const outer = el.getBoundingClientRect(), inner = area.getBoundingClientRect();
    return inner.width > 0 && inner.height > 0 ? { left: inner.left - outer.left, top: inner.top - outer.top, width: inner.width, height: inner.height } : null;
  }
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const selection = select<HTMLDivElement, unknown>(el);
    const controller = zoom<HTMLDivElement, unknown>().scaleExtent([0.02, 10000])
      .extent(() => [[0, 0], [el.clientWidth, el.clientHeight]])
      .touchable(() => true)
      .filter((event) => {
        if (event.type === "wheel") return true;
        const bounds = rect();
        if (!bounds || event.button) return false;
        if (event.type.startsWith("touch")) return true;
        const outer = el.getBoundingClientRect(), x = event.clientX - outer.left, y = event.clientY - outer.top;
        return x >= bounds.left && x <= bounds.left + bounds.width && y >= bounds.top && y <= bounds.top + bounds.height;
      })
      .on("zoom", (event) => {
        const bounds = rect();
        if (!bounds) return;
        const next = transformedDomain(baseRef.current, bounds, event.transform);
        viewRef.current = next; setView(next); setCursor(null);
      });
    behavior.current = controller;
    selection.call(controller).on("dblclick.zoom", null);
    const move = (event: PointerEvent) => {
      if (event.buttons || event.pointerType === "touch") { setCursor(null); return; }
      const bounds = rect();
      if (!bounds) return;
      const outer = el.getBoundingClientRect(), px = event.clientX - outer.left, py = event.clientY - outer.top;
      if (px < bounds.left || px > bounds.left + bounds.width || py < bounds.top || py > bounds.top + bounds.height) { setCursor(null); return; }
      setCursor({ px, py, ...plotCoordinate(viewRef.current ?? baseRef.current, bounds, px, py), rect: bounds });
    };
    const leave = () => setCursor(null);
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    const observer = new ResizeObserver(() => { selection.call(controller.transform, zoomIdentity); });
    observer.observe(el);
    return () => { observer.disconnect(); selection.on(".zoom", null); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); behavior.current = null; };
  }, []);
  useEffect(() => {
    if (ref.current && behavior.current) select<HTMLDivElement, unknown>(ref.current).call(behavior.current.transform, zoomIdentity);
    setView(null); viewRef.current = null; setCursor(null);
  }, [resetKey, base.xMin, base.xMax, base.yMin, base.yMax]);
  function changeScale(factor: number) {
    const bounds = rect();
    if (ref.current && behavior.current && bounds) select<HTMLDivElement, unknown>(ref.current).call(behavior.current.scaleBy, factor, [bounds.left + bounds.width / 2, bounds.top + bounds.height / 2]);
  }
  function reset() {
    if (ref.current && behavior.current) select<HTMLDivElement, unknown>(ref.current).call(behavior.current.transform, zoomIdentity);
  }
  return { ref, domain: view ?? base, cursor, changeScale, reset };
}