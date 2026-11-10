import { describe, expect, it } from "vitest";
import { inspectParsing, tracePoints } from "@/lib/code-inspection";

describe("read-only code inspection", () => {
  it("exposes the same normalization and mathjs node structure as the engine", () => {
    const result = inspectParsing("2x + log_10(x)");
    expect(result.normalized).toBe("2*x + log10(x)");
    expect(result.error).toBeNull();
    expect(result.nodes.some((node) => node.type === "FunctionNode" && node.expression === "log10(x)")).toBe(true);
  });
  it("reports incomplete syntax without throwing during typing", () => {
    expect(inspectParsing("sin(").error).not.toBeNull();
    expect(inspectParsing("sin(").nodes).toEqual([]);
  });
  it("previews actual samples without changing values or discontinuity flags", () => {
    const points = [{ x: -1, y: -1, breakBefore: false }, { x: 0, y: null, breakBefore: true }, { x: 1, y: 1, breakBefore: true }];
    const before = JSON.stringify(points);
    expect(tracePoints(points, 2)).toEqual(points.slice(0, 2));
    expect(JSON.stringify(points)).toBe(before);
    expect(tracePoints(points)[2]).toEqual({ x: 1, y: 1, breakBefore: true });
  });
});