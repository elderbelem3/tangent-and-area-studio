import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { clearModuleState, setModuleState, useModuleState } from "@/lib/module-state";

function ModuleInput({ module }: { module: string }) {
  const [value, setValue] = useModuleState(`${module}.value`, "");
  return <input aria-label="module value" value={value} onChange={(event) => setValue(event.target.value)} />;
}

function ParameterModule() {
  const [expression, setExpression] = useModuleState("report.expression", "x^2");
  const [point, setPoint] = useModuleState("report.point", "1");
  return <><input aria-label="expression" value={expression} onChange={(e) => setExpression(e.target.value)} /><input aria-label="point" value={point} onChange={(e) => setPoint(e.target.value)} /></>;
}

afterEach(() => { cleanup(); clearModuleState(); });

describe("Tab state preservation", () => {
  it("preserves the chosen point when the expression changes", () => {
    render(<ParameterModule />);
    fireEvent.change(screen.getByLabelText("point"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("expression"), { target: { value: "x^3-3x" } });
    expect(screen.getByLabelText("point")).toHaveValue("2");
  });
  it("keeps a typed expression across tab remounts", () => {
    const first = render(<ModuleInput module="functions" />);
    fireEvent.change(screen.getByLabelText("module value"), { target: { value: "x^2 - 4x - 5" } });
    first.unmount();
    const other = render(<ModuleInput module="limits" />);
    expect(screen.getByLabelText("module value")).toHaveValue("");
    other.unmount();
    render(<ModuleInput module="functions" />);
    expect(screen.getByLabelText("module value")).toHaveValue("x^2 - 4x - 5");
  });
  it("reads a study-example transfer on the next visit", () => {
    const first = render(<ModuleInput module="functions" />);
    fireEvent.change(screen.getByLabelText("module value"), { target: { value: "sin(x)" } });
    first.unmount();
    setModuleState("functions.value", "sqrt(x-1)");
    render(<ModuleInput module="functions" />);
    expect(screen.getByLabelText("module value")).toHaveValue("sqrt(x-1)");
  });
});