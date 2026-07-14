/**
 * /docs/[[...slug]] — serves the static Docusaurus handover site, gated
 * behind a real, logged-in Payload admin session.
 *
 * This is a Route Handler (not a page), so it isn't wrapped by the
 * (payload) route group's admin layout — it reads and returns the static
 * files built by `apps/docs` (docusaurus build) directly, after checking
 * `payload.auth()` against the request's own cookies. There's no separate
 * password or login for the docs site: if you're logged into /admin, you
 * can see /docs; if you're not, you're redirected to the same admin login
 * everyone already uses.
 *
 * `apps/docs`'s static build output lives at ../docs/build (a sibling app
 * in this monorepo) — this assumes both apps are deployed together from
 * the same checkout, which holds for this project's current single-host
 * deployment model. If the CMS is ever deployed independently of the rest
 * of the monorepo, this path (and the build step that produces it) needs
 * to move with it.
 */
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import config from "@payload-config";
import { getPayload } from "payload";

const DOCS_BUILD_DIR = path.resolve(process.cwd(), "..", "docs", "build");

const CONTENT_TYPES: Record<string, string> = {
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
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

function contentTypeFor(filePath: string): string {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

// Resolves a requested /docs/<slug...> path to a real file inside the
// Docusaurus build output. Docusaurus (trailingSlash: false) emits clean
// URLs as top-level *.html files (e.g. managing-products.html) rather than
// managing-products/index.html, so that's tried first; a couple of other
// shapes are tried as a fallback for safety (static assets, index files).
async function resolveFile(slugParts: string[]): Promise<string | null> {
  const relPath = slugParts.join("/");
  const candidates = relPath
    ? [
        path.join(DOCS_BUILD_DIR, relPath),
        path.join(DOCS_BUILD_DIR, `${relPath}.html`),
        path.join(DOCS_BUILD_DIR, relPath, "index.html"),
      ]
    : [path.join(DOCS_BUILD_DIR, "index.html")];

  for (const candidate of candidates) {
    // path.join collapses "..", but guard anyway against ever escaping the
    // build directory before touching the filesystem.
    if (!candidate.startsWith(DOCS_BUILD_DIR)) continue;
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

async function isLoggedIntoAdmin(req: NextRequest): Promise<boolean> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  return Boolean(user);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
): Promise<NextResponse> {
  if (!(await isLoggedIntoAdmin(req))) {
    // Payload's stock login page doesn't support a "redirect back here"
    // param out of the box, so this just lands on /admin after signing in —
    // one extra click back to /docs, not a broken flow.
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const { slug } = await params;
  const filePath = await resolveFile(slug ?? []);
  if (!filePath) {
    const notFoundPath = path.join(DOCS_BUILD_DIR, "404.html");
    try {
      const body = await readFile(notFoundPath);
      return new NextResponse(body, {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const body = await readFile(filePath);
  return new NextResponse(body, {
    headers: { "content-type": contentTypeFor(filePath) },
  });
}
