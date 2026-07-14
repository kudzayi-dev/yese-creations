import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";

// Stage 20 — prerender every PDP + the homepage at build time, and emit
// sitemap.xml (TanStack Start's native `pages`/`sitemap` config — see
// node_modules/@tanstack/start-plugin-core/dist/esm/build-sitemap.js: the
// sitemap is built ONLY from the `pages` array below, so anything not
// listed here (checkout, confirmation, the Stripe webhook) is simply never
// in it — no explicit exclude needed).
//
// The product slug list comes from the CMS at build time (getAllProducts's
// underlying REST call, done directly here since this runs in plain Node,
// outside the app's createServerFn boundary). Per the stage's gotcha note:
// if the CMS isn't reachable at build time, we log a warning and fall back
// to an empty product page list rather than failing the whole build — the
// PDPs still work fine, just SSR'd at request time (as they were before
// this stage) instead of prerendered/listed in the sitemap for that build.
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const cmsUrl = env["CMS_URL"] || "http://localhost:3001";
  const siteUrl = env["SITE_URL"] || "http://localhost:3000";

  let productSlugs: string[] = [];
  try {
    const res = await fetch(`${cmsUrl}/api/products?limit=100&depth=0`);
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const data = (await res.json()) as { docs: Array<{ slug: string }> };
    productSlugs = data.docs.map((d) => d.slug);
  } catch (err) {
    console.warn(
      `[vite.config] Could not reach CMS at ${cmsUrl} to list products for prerender/sitemap ` +
        `(${err instanceof Error ? err.message : String(err)}). Building without prerendered ` +
        `PDPs or product sitemap entries — they'll still render fine via SSR at request time.`,
    );
  }

  const pages = [
    { path: "/", sitemap: { changefreq: "weekly" as const, priority: 1 } },
    ...productSlugs.map((slug) => ({
      path: `/product/${slug}`,
      sitemap: { changefreq: "weekly" as const, priority: 0.8 },
    })),
  ];

  return {
    plugins: [
      viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        srcDirectory: "src",
        pages,
        sitemap: {
          enabled: true,
          host: siteUrl,
        },
        prerender: {
          enabled: true,
          // Rely solely on the explicit `pages` list above (home + every
          // PDP) rather than crawling links discovered in prerendered HTML
          // — crawling would otherwise follow the cart drawer's Checkout
          // link and prerender /checkout, which must stay a live SSR route
          // (it creates a real Stripe PaymentIntent per request).
          crawlLinks: false,
          autoStaticPathsDiscovery: false,
          // A transient CMS hiccup on one product shouldn't fail the whole
          // build — that page just stays SSR'd at runtime instead.
          failOnError: false,
        },
      }),
      viteReact(),
    ],
    server: {
      port: 3000,
    },
  };
});
