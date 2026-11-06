import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ inputValidator: () => ({ handler: (fn: (input: unknown) => unknown) => fn }) }),
}));
vi.mock("@lovable.dev/ai-gateway", () => ({ generateResponse: vi.fn(), GatewayError: class extends Error {} }));

import { generateResponse } from "@lovable.dev/ai-gateway";
import { askTutor } from "@/lib/tutor.functions";
import { generateEnade, evaluateEnade } from "@/lib/enade.functions";
import { askHelpdesk } from "@/lib/helpdesk.functions";

describe("Temporary AI suspension", () => {
  it.each([
    ["tutor", askTutor],
    ["ENADE generation", generateEnade],
    ["ENADE evaluation", evaluateEnade],
    ["help copilot", askHelpdesk],
  ])("blocks %s without contacting AI", async (_, handler) => {
    vi.mocked(generateResponse).mockClear();
    const result = await handler({ data: {} } as never);
    expect(result.error).toBeTruthy();
    expect(generateResponse).not.toHaveBeenCalled();
  });
});