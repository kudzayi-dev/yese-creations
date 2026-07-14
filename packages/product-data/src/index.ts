export * from "./types";
export * from "./palettes";
export * from "./products";
export * from "./details";
export * from "./slug";

import { PRODUCTS } from "./products";
import { productSlug } from "./slug";
import type { Product, StorefrontProduct } from "./types";

// Convenience lookups used by both apps.
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => productSlug(p) === slug);
}

export function getRelatedProducts(p: Product, limit = 4): Product[] {
  const sameCat = PRODUCTS.filter((x) => x.id !== p.id && x.cat === p.cat);
  const others = PRODUCTS.filter((x) => x.id !== p.id && x.cat !== p.cat);
  return [...sameCat, ...others].slice(0, limit);
}

// Storefront (CMS-backed) counterpart to getRelatedProducts() — same
// same-category-first-then-pad logic, but operating on a list of
// StorefrontProduct already fetched from the CMS (Stage 16's PDP loader
// fetches all products once and passes them in here, rather than this
// package reaching back out to the CMS itself).
export function getRelatedStorefrontProducts(
  all: StorefrontProduct[],
  current: StorefrontProduct,
  limit = 4,
): StorefrontProduct[] {
  const sameCat = all.filter((x) => x.id !== current.id && x.cat === current.cat);
  const others = all.filter((x) => x.id !== current.id && x.cat !== current.cat);
  return [...sameCat, ...others].slice(0, limit);
}
