import type { Product } from "./types";

// URL-safe slug — ported exactly from products-data.js productSlug():
// lowercase, & → and, non-alphanumeric runs → -, trimmed of leading/trailing -.
export function productSlug(p: Pick<Product, "name">): string {
  return p.name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Path to a product's dedicated PDP, relative to the storefront root.
export function productPath(p: Pick<Product, "name">): string {
  return `/product/${productSlug(p)}`;
}
