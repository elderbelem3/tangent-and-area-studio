import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Field, MathToolbar } from "@/components/Lab";

afterEach(cleanup);

describe("Native mobile input interaction", () => {
  it("focuses a plain math field synchronously when inserting from the scientific keyboard", () => {
    const input = createRef<HTMLInputElement>();
    const update = vi.fn();
    render(<><Field ref={input} label="f(x) =" value="x" onChange={update} /><MathToolbar inputRef={input} value="x" onChange={update} /></>);
    const key = screen.getByRole("button", { name: "+", exact: true });
    key.focus();
    fireEvent.click(key);
    expect(document.activeElement).toBe(input.current);
    expect(update).toHaveBeenCalledWith("x+");
  });
  it("does not cancel a touch on a plain text field", () => {
    render(<Field label="f(x) =" value="" onChange={() => {}} />);
    const event = new Event("touchstart", { bubbles: true, cancelable: true });
    screen.getByRole("textbox").dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});