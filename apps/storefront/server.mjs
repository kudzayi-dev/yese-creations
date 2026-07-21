// server.mjs — production entrypoint for the storefront.
//
// WHY THIS FILE EXISTS: this pinned TanStack Start version (1.168.27)
// does not auto-bundle a self-starting Nitro server. `vite build` instead
// emits `dist/server/server.js`, which exports a bare
// `{ fetch(request): Response }` handler — there is no listener, so
// `node dist/server/server.js` alone does nothing. This file is the
// missing piece: serve `dist/client` as static files (prerendered
// homepage/PDP HTML, hashed JS/CSS, sitemap.xml, images) and forward
// everything else to the SSR fetch handler for real routes (checkout,
// confirmation, the Stripe webhook, non-prerendered pages like /feedback).
//
// Deliberately fetch-native throughout (Response/ReadableStream), not a
// Node-stream static-file library — a first attempt using `sirv`'s
// Node-middleware API (req/res/next) failed because sirv internally does
// `stream.pipe(res)`, which needs a real EventEmitter-based Writable, not
// a hand-rolled req/res bridge object. Verified against a real
// `pnpm build` output (both static and SSR paths) before being relied on.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { Readable } from "node:stream";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServerAdapter } from "@whatwg-node/server";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(dirname, "dist", "client");
const port = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function tryServeStatic(pathname) {
  const safe = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const candidates =
    safe === "/" || safe === ""
      ? [path.join(clientDir, "index.html")]
      : [path.join(clientDir, safe), path.join(clientDir, safe, "index.html")];

  for (const filePath of candidates) {
    if (!filePath.startsWith(clientDir)) continue; // path-traversal guard
    try {
      const stats = await stat(filePath);
      if (!stats.isFile()) continue;
      const ext = path.extname(filePath);
      const body = Readable.toWeb(createReadStream(filePath));
      return new Response(body, {
        headers: {
          "content-type": MIME[ext] || "application/octet-stream",
          "content-length": String(stats.size),
        },
      });
    } catch {
      // not found at this candidate — try the next one
    }
  }
  return null;
}

const { default: ssrHandler } = await import("./dist/server/server.js");

const adapter = createServerAdapter(async (request) => {
  const url = new URL(request.url);
  const staticResponse = await tryServeStatic(url.pathname);
  if (staticResponse) return staticResponse;
  return ssrHandler.fetch(request);
});

createServer(adapter).listen(port, () => {
  console.log(`[storefront] listening on :${port}`);
});
