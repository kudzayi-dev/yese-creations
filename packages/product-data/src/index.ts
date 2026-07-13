export * from "./types";
export * from "./palettes";
export * from "./products";
export * from "./details";
export * from "./slug";

import { PRODUCTS } from "./products";
import { productSlug } from "./slug";
import type { Product } from "./types";

// Convenience lookups used by both apps.
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => productSlug(p) === slug);
}

export function getRelatedProducts(p: Product, limit = 4): Product[] {
  const sameCat = PRODUCTS.filter((x) => x.id !== p.id && x.cat === p.cat);
  const others = PRODUCTS.filter((x) => x.id !== p.id && x.cat !== p.cat);
  return [...sameCat, ...others].slice(0, limit);
}
