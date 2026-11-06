import { useEffect, useState } from "react";

/** Keep expensive visual analysis off the gesture path; settle on the exact domain. */
export function useSettledPlotDomain(xMin: number, xMax: number) {
  const [domain, setDomain] = useState({ xMin, xMax });
  useEffect(() => {
    const timer = setTimeout(() => setDomain({ xMin, xMax }), 120);
    return () => clearTimeout(timer);
  }, [xMin, xMax]);
  return domain;
}