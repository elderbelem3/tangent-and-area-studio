import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { Route as legacyAiRoute } from "@/routes/ia";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("redirects the removed AI page to local Functions without a page component", async () => {
    const beforeLoad = legacyAiRoute.options.beforeLoad;
    if (typeof beforeLoad !== "function") throw new Error("Missing legacy redirect");
    let redirected: unknown;
    try { await Reflect.apply(beforeLoad, undefined, [{}]); }
    catch (error) { redirected = error; }
    expect(redirected).toMatchObject({ options: { to: "/", statusCode: 301 } });
    expect(legacyAiRoute.options.component).toBeUndefined();
  });
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
