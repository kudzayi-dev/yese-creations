/**
 * seo.ts — Pure helpers for building the PDP's server-rendered SEO
 * head: title/description fallbacks, absolute OG image selection, and the
 * JSON-LD Product payload.
 *
 * Source shape: design_handoff_yese_shop/product/goddess-amigurumi-doll.html's
 * <head> (meta/OG/Twitter/JSON-LD block). Ported to real data — title/description
 * prefer the CMS's own metaTitle/metaDescription fields (StorefrontProduct)
 * and fall back to name/story otherwise.
 *
 * Kept as plain functions (no framework imports) so they're usable from the
 * route's head() and easy to unit-test in isolation.
 */
import type { ProductDetail, StorefrontProduct } from "@yese/product-data";

export const META_DESCRIPTION_MAX = 155;

// Truncates to `max` chars at the last word boundary and appends a single
// "…" — matches the prototype's description truncation (e.g. "...then…").
// No-op if the text already fits.
export function truncateDescription(text: string, max = META_DESCRIPTION_MAX): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}…`;
}

export function productMetaTitle(product: StorefrontProduct): string {
  return product.metaTitle && product.metaTitle.trim().length > 0
    ? product.metaTitle
    : `${product.name} — Yese Creations`;
}

export function productMetaDescription(product: StorefrontProduct, detail: ProductDetail): string {
  if (product.metaDescription && product.metaDescription.trim().length > 0) {
    return product.metaDescription;
  }
  return truncateDescription(detail.story);
}

// A sensible default OG image for products that only have synthesized
// placeholder art — never leave social cards blank.
export const DEFAULT_OG_IMAGE_PATH = "/assets/yese-logo.png";

// Payload's Media collection has `serverURL` set (payload.config.ts), so
// photo URLs from the CMS are already absolute — no CMS_URL prefixing needed
// here, only the siteUrl fallback for the default asset.
export function productOgImages(product: StorefrontProduct, siteUrl: string): string[] {
  const real = product.photos.map((p) => p.sizes.stage.url).filter(Boolean);
  return real.length > 0 ? real : [`${siteUrl}${DEFAULT_OG_IMAGE_PATH}`];
}

export interface ProductJsonLdParams {
  product: StorefrontProduct;
  description: string;
  images: string[];
  canonicalUrl: string;
}

// @type Product, per schema.org — shape ported 1:1 from the design handoff's
// inline <script type="application/ld+json">.
export function buildProductJsonLd({ product, description, images, canonicalUrl }: ProductJsonLdParams) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: images,
    description,
    category: product.cat,
    brand: { "@type": "Brand", name: "Yese Creations" },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "GBP",
      price: product.price.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Yese Creations" },
    },
  };
}
