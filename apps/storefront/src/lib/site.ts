/**
 * site.ts — createServerFn wrapper for SITE_URL.
 *
 * SITE_URL is a plain (non-VITE_) env var — server-only in Vite/TanStack Start,
 * same reasoning as CMS_URL (lib/cms.ts) and STRIPE_SECRET_KEY
 * (lib/stripe-server.ts). Reading it via createServerFn (rather than a bare
 * process.env reference in route code) keeps it out of the client bundle and
 * safe to call from a route's loader, same pattern as lib/products.ts.
 *
 * Used by product.$slug.tsx's head() to build canonical/OG URLs.
 */
import { createServerFn } from "@tanstack/react-start";

export const getSiteUrl = createServerFn().handler(async () => {
  return process.env["SITE_URL"] ?? "http://localhost:3000";
});
