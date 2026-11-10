import { createFileRoute, redirect } from "@tanstack/react-router";

/** Preserve old bookmarks without retaining any AI feature or handler. */
export const Route = createFileRoute("/ia")({
  beforeLoad: () => { throw redirect({ to: "/", statusCode: 301 }); },
});
