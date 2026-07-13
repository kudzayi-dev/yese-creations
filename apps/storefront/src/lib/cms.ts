/**
 * cms.ts — raw fetch helpers for the Payload CMS REST API.
 *
 * SERVER-ONLY. Never import this from client components.
 * All calls go through createServerFn in products.server.ts.
 *
 * Endpoints (Stage 07):
 *   GET /api/products?limit=100&depth=1          → list all
 *   GET /api/products?where[slug][equals]=<s>&depth=1&limit=1  → by slug
 */

import type { StorefrontProduct, Tag, CmsPhoto } from "@yese/product-data";

const CMS_URL = process.env["CMS_URL"] ?? "http://localhost:3001";

// ---------------------------------------------------------------------------
// Raw Payload response types (before normalisation)
// ---------------------------------------------------------------------------

interface RawPhoto {
  url: string;
  sizes: {
    thumb: { url: string };
    card: { url: string };
    stage: { url: string };
  };
}

interface RawProduct {
  id: number;
  slug: string;
  name: string;
  cat: StorefrontProduct["cat"];
  price: number;
  meta: string;
  tag: Tag | null;
  palette: number;
  motif: StorefrontProduct["motif"];
  photos: RawPhoto[] | null;
  story: string | null;
  specs: Array<{ id: string; spec: string }>;
  care: string | null;
  madeIn: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface PayloadListResponse {
  docs: RawProduct[];
  totalDocs: number;
}

// ---------------------------------------------------------------------------
// Normalisation: RawProduct → StorefrontProduct
// ---------------------------------------------------------------------------

function normalise(raw: RawProduct): StorefrontProduct {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    cat: raw.cat,
    price: raw.price, // already pounds — afterRead hook divided pence÷100
    meta: raw.meta,
    tag: raw.tag ?? "",
    palette: raw.palette,
    motif: raw.motif,
    photos: (raw.photos ?? []) as CmsPhoto[],
    story: raw.story ?? undefined,
    specs: (raw.specs ?? []).map((s) => s.spec),
    care: raw.care ?? undefined,
    madeIn: raw.madeIn ?? undefined,
    metaTitle: raw.metaTitle ?? undefined,
    metaDescription: raw.metaDescription ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchProducts(query: string): Promise<PayloadListResponse> {
  const url = `${CMS_URL}/api/products?${query}`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`CMS fetch failed: ${res.status} ${res.statusText} — ${url}`);
  return res.json() as Promise<PayloadListResponse>;
}

export async function fetchAllProducts(): Promise<StorefrontProduct[]> {
  const data = await fetchProducts("limit=100&depth=1");
  return data.docs.map(normalise);
}

export async function fetchProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  const data = await fetchProducts(
    `where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
  );
  const raw = data.docs[0];
  return raw ? normalise(raw) : null;
}
