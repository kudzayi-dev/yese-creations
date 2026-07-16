/**
 * cms.ts — raw fetch helpers for the Payload CMS REST API.
 *
 * SERVER-ONLY. Never import this from client components.
 * All calls go through createServerFn in lib/products.ts.
 *
 * Endpoints:
 *   GET /api/products?limit=100&depth=1          → list all
 *   GET /api/products?where[slug][equals]=<s>&depth=1&limit=1  → by slug
 */

import type { StorefrontProduct, Tag, CmsPhoto, Category } from "@yese/product-data";

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
  // limit=0 means "no limit" in Payload's REST API. The catalog is 186
  // products post-migration (was 10 in the dev-placeholder era, when a
  // hardcoded 100 was harmless) — a fixed cap here silently drops products
  // from the grid and 404s their PDPs.
  const data = await fetchProducts("limit=0&depth=1");
  return data.docs.map(normalise);
}

export async function fetchProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  const data = await fetchProducts(
    `where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
  );
  const raw = data.docs[0];
  return raw ? normalise(raw) : null;
}

// ---------------------------------------------------------------------------
// Site settings (feature flags for homepage sections that aren't ready yet)
// ---------------------------------------------------------------------------

export interface HomepageSectionFlags {
  originalArtworks: boolean;
  process: boolean;
  studioJournal: boolean;
  bespoke: boolean;
}

export interface FeedbackSettings {
  showEbaySourced: boolean;
}

interface RawSiteSettings {
  homepageSections?: Partial<HomepageSectionFlags>;
  feedback?: Partial<FeedbackSettings>;
}

// Matches the Payload global's field defaultValues (apps/cms/src/globals/
// SiteSettings.ts) — these sections start hidden until explicitly turned on.
const DEFAULT_SECTION_FLAGS: HomepageSectionFlags = {
  originalArtworks: false,
  process: false,
  studioJournal: false,
  bespoke: false,
};

// eBay-sourced feedback is all we have at launch, so it defaults to shown —
// the mirror image of DEFAULT_SECTION_FLAGS above (those default hidden
// until ready; this defaults shown until there's enough organic feedback to
// replace it).
const DEFAULT_FEEDBACK_SETTINGS: FeedbackSettings = {
  showEbaySourced: true,
};

// Both flag groups live on the same Payload global. Deliberately NOT cached
// across calls/requests — this is a live server process, and a CMS-driven
// toggle that only takes effect after a server restart defeats the entire
// point of "flip a switch in /admin instead of shipping code". Fetching the
// global twice per page load (once for homepageSections, once for feedback)
// is cheap; a stale flag is not.
async function fetchRawSiteSettings(): Promise<RawSiteSettings | null> {
  const url = `${CMS_URL}/api/globals/site-settings`;
  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) {
      console.error(`Site settings fetch failed: ${res.status} ${res.statusText} — ${url}`);
      return null;
    }
    return (await res.json()) as RawSiteSettings;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchHomepageSectionFlags(): Promise<HomepageSectionFlags> {
  const raw = await fetchRawSiteSettings();
  // Fail closed (sections hidden) rather than risk showing an unfinished
  // section if the CMS is briefly unreachable — a missing feature-flag
  // fetch shouldn't surface half-built content.
  if (!raw) return DEFAULT_SECTION_FLAGS;
  return { ...DEFAULT_SECTION_FLAGS, ...raw.homepageSections };
}

export async function fetchFeedbackSettings(): Promise<FeedbackSettings> {
  const raw = await fetchRawSiteSettings();
  // Fail OPEN here (still show eBay-sourced) — unlike the homepage sections,
  // hiding all feedback because of a transient CMS blip is worse than
  // occasionally showing eBay-sourced reviews a moment longer than intended.
  if (!raw) return DEFAULT_FEEDBACK_SETTINGS;
  return { ...DEFAULT_FEEDBACK_SETTINGS, ...raw.feedback };
}

// ---------------------------------------------------------------------------
// Feedback (customer testimonials — sourced eBay feedback + future in-app
// named reviews)
// ---------------------------------------------------------------------------

export interface FeedbackEntry {
  id: number;
  source: "ebay" | "app";
  quote: string;
  rating: number;
  productName: string;
  cat: Category;
  buyerHandle?: string;
  customerName?: string;
  verified: boolean;
  featured: boolean;
}

interface RawFeedback {
  id: number;
  source: "ebay" | "app";
  quote: string;
  rating: number;
  productName: string;
  cat: Category;
  buyerHandle: string | null;
  customerName: string | null;
  verified: boolean;
  featured: boolean;
}

interface PayloadFeedbackListResponse {
  docs: RawFeedback[];
  totalDocs: number;
}

function normaliseFeedback(raw: RawFeedback): FeedbackEntry {
  return {
    id: raw.id,
    source: raw.source,
    quote: raw.quote,
    rating: raw.rating,
    productName: raw.productName,
    cat: raw.cat,
    buyerHandle: raw.buyerHandle ?? undefined,
    customerName: raw.customerName ?? undefined,
    verified: raw.verified,
    featured: raw.featured,
  };
}

async function fetchFeedback(query: string): Promise<PayloadFeedbackListResponse> {
  const url = `${CMS_URL}/api/feedback?${query}`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`CMS fetch failed: ${res.status} ${res.statusText} — ${url}`);
  return res.json() as Promise<PayloadFeedbackListResponse>;
}

// "where[source][not_equals]=ebay" filters down to app-sourced (named)
// reviews only — applied when the "Show eBay-sourced reviews" toggle in
// /admin > Site Settings > Feedback is switched off. Empty string means no
// filter (show everything), which is also correct when there are zero app
// reviews yet and the flag is somehow off — an editor turning this off
// before there's real organic feedback to replace it with is a mistake on
// their end, not something to silently work around here.
function sourceFilter(settings: FeedbackSettings): string {
  return settings.showEbaySourced ? "" : "&where[source][not_equals]=ebay";
}

// Homepage highlight row — the 2-3 entries an editor has marked "featured" in
// /admin. Fails to an empty array rather than throwing: a broken feedback
// fetch shouldn't take down the whole homepage render.
export async function fetchFeaturedFeedback(): Promise<FeedbackEntry[]> {
  try {
    const settings = await fetchFeedbackSettings();
    const data = await fetchFeedback(`where[featured][equals]=true&limit=0${sourceFilter(settings)}`);
    return data.docs.map(normaliseFeedback);
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Full list for the standalone /feedback page — real route, real SEO
// content, not paginated client-side for now since the volume (dozens, not
// thousands) doesn't need it yet.
export async function fetchAllFeedback(): Promise<FeedbackEntry[]> {
  const settings = await fetchFeedbackSettings();
  const data = await fetchFeedback(`limit=0${sourceFilter(settings)}`);
  return data.docs.map(normaliseFeedback);
}
