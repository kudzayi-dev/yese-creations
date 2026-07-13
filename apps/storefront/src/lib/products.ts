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
import { fetchAllProducts, fetchProductBySlug } from "./cms";

export const getAllProducts = createServerFn().handler(async () => {
  return fetchAllProducts();
});

export const getProductBySlug = createServerFn()
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    return fetchProductBySlug(slug);
  });
