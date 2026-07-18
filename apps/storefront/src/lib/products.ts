/**
 * products.ts — createServerFn wrappers for product data.
 *
 * The handler bodies run on the SERVER only. TanStack Start's plugin strips the
 * body (and its `./cms` import, and therefore CMS_URL) out of the client bundle,
 * leaving a callable RPC stub — so route loaders can import this file freely.
 *
 * IMPORTANT — do NOT rename this back to `products.server.ts`. TanStack Start's
 * import-protection treats a `*.server.ts` module as strictly server-only and
 * swaps it for a throwing mock in the dev client. That breaks the RPC bridge:
 * the loader re-runs on the client after hydration, calls the mock, and blows up
 * with "[import-protection] Mocked import used in dev client" — which manifests as
 * the page rendering fine from SSR but going blank/inert once React hydrates.
 * A createServerFn module is meant to be imported from client code; the `.server`
 * suffix is for modules that must never be.
 *
 * Usage in a route loader:
 *   import { getAllProducts, getProductBySlug } from "~/lib/products";
 *   export const Route = createFileRoute("/")({
 *     loader: () => getAllProducts(),
 *   });
 */

import { createServerFn } from "@tanstack/react-start";
import {
  fetchAllProducts,
  fetchProductBySlug,
  fetchHomepageSectionFlags,
  fetchFeaturedFeedback,
  fetchAllFeedback,
  fetchFooterContent,
  fetchCategories,
  fetchPageBySlug,
  fetchAboutContent,
} from "./cms";

export const getAllProducts = createServerFn().handler(async () => {
  return fetchAllProducts();
});

// CMS-driven feature flags for homepage sections that aren't ready for real
// customers yet (Original Artworks / How I make each piece / Studio
// Journal). Same createServerFn pattern as getAllProducts — see the module
// doc comment above for why this can't just be a bare cms.ts import.
export const getHomepageSectionFlags = createServerFn().handler(async () => {
  return fetchHomepageSectionFlags();
});

export const getProductBySlug = createServerFn()
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return fetchProductBySlug(slug);
  });

// Homepage highlight row (2-3 "featured" entries).
export const getFeaturedFeedback = createServerFn().handler(async () => {
  return fetchFeaturedFeedback();
});

// Full list for the standalone /feedback page.
export const getAllFeedback = createServerFn().handler(async () => {
  return fetchAllFeedback();
});

// CMS-driven footer links (social/studio/legal) — same createServerFn
// pattern as getHomepageSectionFlags.
export const getFooterContent = createServerFn().handler(async () => {
  return fetchFooterContent();
});

// CMS-editable category taxonomy — powers the Shop filter chips, footer
// Shop column, and /feedback + search category chips.
export const getCategories = createServerFn().handler(async () => {
  return fetchCategories();
});

// Homepage's composable block layout (Pages collection, slug "home").
export const getHomepageLayout = createServerFn().handler(async () => {
  return fetchPageBySlug("home");
});

// Theresa's bio content (About global) — shared by Story.tsx, /about, and
// AboutOverlay.
export const getAboutContent = createServerFn().handler(async () => {
  return fetchAboutContent();
});
