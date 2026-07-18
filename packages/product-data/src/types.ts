// Yese Creations — shared product types.
// Ported from products-data.js; these shapes are the contract shared by the
// storefront (overlay + PDP) and the Payload CMS seed, so copy never drifts.
//
// The enum VALUES live here as runtime `as const` arrays and the TS unions are
// derived from them. Payload's collection config imports these same arrays to
// build its select-field options, so the CMS and the shared types cannot drift
// apart — adding a category in one place adds it in both.

// The six real categories. NOTE: this is distinct from CATEGORIES in products.ts,
// which is the homepage filter-chip list and prepends the pseudo-category "All".
// That list is derived from this one, so they cannot drift.
export const PRODUCT_CATEGORIES = [
  "Bouquets",
  "Art",
  "Soft Toys",
  "Accessories",
  "Hats",
  "Prints",
] as const;
export type Category = (typeof PRODUCT_CATEGORIES)[number];

// "" = no tag. Kept as a real member of the union (the prototype uses "" not
// undefined), but note Payload stores "no tag" as a missing/empty select value.
export const TAGS = ["bestseller", "new", "limited", "popular", ""] as const;
export type Tag = (typeof TAGS)[number];

export const MOTIFS = [
  "heart",
  "cushion",
  "bag",
  "flower",
  "bunny",
  "loop",
  "tassel",
  "ball",
  "abstract",
  "canvas",
  "portrait",
] as const;
export type Motif = (typeof MOTIFS)[number];

// PALETTES has 8 entries (indices 0–7); `palette` is an index into it.
export const PALETTE_MIN = 0;
export const PALETTE_MAX = 7;

export interface Product {
  id: string;
  name: string;
  cat: Category;
  /** Price in pence (GBP). Divide by 100 for display. e.g. 2499 = £24.99 */
  price: number;
  /** index into PALETTES */
  palette: number;
  motif: Motif;
  tag: Tag;
  meta: string;
  /** primary real photo (relative path), when one exists */
  img?: string;
  /** all real photos, when supplied */
  imgs?: string[];
}

export interface ProductDetail {
  story: string;
  specs: string[];
  care: string;
  madeIn: string;
}

export type GalleryView =
  | { type: "photo"; src: string; label: string }
  | { type: "ph"; palette: number; motif: Motif; label: string };

// Storefront-side gallery view — same shape as GalleryView, but a "photo"
// entry carries both the thumb-sized and stage-sized CMS crops (the seed-data
// GalleryView only has one `src` since the prototype had no responsive image
// sizes). Built by galleryForStorefront() from a StorefrontProduct's `photos`.
export type StorefrontGalleryView =
  | { type: "photo"; thumbUrl: string; stageUrl: string; label: string }
  | { type: "ph"; palette: number; motif: Motif; label: string };

export interface Palette {
  from: string;
  via: string;
  to: string;
  stripe: string;
}

// ---------------------------------------------------------------------------
// Storefront DTO — the normalised shape the storefront consumes after fetching
// from the CMS REST API. The storefront data layer (apps/storefront/src/lib)
// maps raw Payload responses into this shape; everything above this line is
// the CMS-side contract.
// ---------------------------------------------------------------------------

/** A single photo as returned by the CMS (depth=1 expansion of the Media doc). */
export interface CmsPhoto {
  url: string;
  sizes: {
    thumb: { url: string };
    card: { url: string };
    stage: { url: string };
  };
}

// A CMS-editable category (apps/cms/src/collections/Categories.ts). Fetched
// via fetchCategories()/getCategories() — drives the Shop filter chips, the
// footer's Shop column, and the /feedback + search category chips.
export interface StorefrontCategory {
  id: number;
  name: string;
  slug: string;
}

/**
 * The normalised product shape the storefront works with.
 *
 * Key differences from the raw Payload response:
 * - `price` is in POUNDS (number, e.g. 24.99) — the CMS afterRead hook divides pence÷100
 * - `specs` is `string[]` — Payload's `{ id, spec }[]` array rows are stripped to values only
 * - `tag` is `Tag` (never null) — CMS null is normalised to `""`
 * - `photos` is the typed CmsPhoto array (depth=1 expanded), never undefined
 * - `slug` is always present (the stable public key for PDP URLs)
 */
export interface StorefrontProduct {
  id: number;
  slug: string;
  name: string;
  /**
   * Category NAME (not the compile-time `Category` union) — categories are
   * now a CMS-editable collection (apps/cms/src/collections/Categories.ts),
   * so this can't be a fixed union anymore. Comparisons/filtering still
   * work as plain string equality against the live category list fetched
   * via fetchCategories()/getCategories().
   */
  cat: string;
  /** Price in pounds (GBP). e.g. 24.99 = £24.99. Display as `£${price.toFixed(2)}`. */
  price: number;
  meta: string;
  tag: Tag;
  palette: number;
  motif: Motif;
  photos: CmsPhoto[];
  // Detail copy — all optional; fall back to detailFor() if absent
  story?: string;
  specs: string[];
  care?: string;
  madeIn?: string;
  // SEO — fall back to name / story if absent
  metaTitle?: string;
  metaDescription?: string;
}
