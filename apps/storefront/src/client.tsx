// Client entry point. Mounts React onto the server-rendered document.
//
// NOTE: `hydrateStart()` alone is NOT enough — it only resolves the router and
// rehydrates its match/loader state. React itself is never mounted by it, so the
// page renders correctly from SSR but no event handler ever fires (silently — no
// error is thrown). `<StartClient />` internally awaits hydrateStart(), so the
// entry point's job is simply to hydrateRoot() it onto `document`.
import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});
