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

import type { StorefrontProduct, Tag, CmsPhoto, StorefrontCategory } from "@yese/product-data";

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
  // depth=1 expands the relationship to the full Category doc; a bare
  // number would only show up at depth=0, which this app never requests.
  cat: { id: number; name: string; slug: string } | number;
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

function categoryName(cat: { id: number; name: string; slug: string } | number): string {
  return typeof cat === "object" ? cat.name : String(cat);
}

function normalise(raw: RawProduct): StorefrontProduct {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    cat: categoryName(raw.cat),
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
// Categories — CMS-editable taxonomy (apps/cms/src/collections/Categories.ts).
// Powers the Shop filter chips, the footer's Shop column, and the
// /feedback + search category chips. Replaces the old hardcoded
// PRODUCT_CATEGORIES/CATEGORIES export from @yese/product-data for anything
// user-facing — that export still exists for the dev seed-data package, but
// the live storefront should always read from here.
// ---------------------------------------------------------------------------

interface RawCategory {
  id: number;
  name: string;
  slug: string;
}

interface PayloadCategoryListResponse {
  docs: RawCategory[];
}

// Fails to an empty list (not a throw) if the CMS is briefly unreachable —
// an empty filter-chip row is a much smaller failure than taking the
// homepage/feedback/search down with it.
export async function fetchCategories(): Promise<StorefrontCategory[]> {
  const url = `${CMS_URL}/api/categories?sort=sortOrder&limit=0`;
  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) {
      console.error(`Categories fetch failed: ${res.status} ${res.statusText} — ${url}`);
      return [];
    }
    const data = (await res.json()) as PayloadCategoryListResponse;
    return data.docs;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Pages / homepage layout — CMS-composable blocks (apps/cms/src/collections/
// Pages.ts + blocks/homepage.ts). Adding, removing, or reordering a
// homepage section is now a CMS edit; the storefront just renders whatever
// `layout` comes back, in order.
// ---------------------------------------------------------------------------

export interface HeroBlockData {
  blockType: "hero";
  id?: string;
  heading?: string | null;
  leadCopy?: string | null;
}

export interface PromoBannerBlockData {
  blockType: "promoBanner";
  id?: string;
  heading: string;
  copy: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  theme?: "coral" | "gold" | "teal" | null;
  activeFrom?: string | null;
  activeTo?: string | null;
}

export interface ProductGridBlockData {
  blockType: "productGrid";
  id?: string;
  kicker?: string | null;
  heading?: string | null;
}

export interface ProcessStepData {
  title: string;
  detail: string;
}

export interface ProcessBlockData {
  blockType: "process";
  id?: string;
  steps?: ProcessStepData[] | null;
}

export interface PresenceBlockData {
  blockType: "trustBand" | "story" | "gallery" | "moodboard" | "bespoke" | "testimonials";
  id?: string;
}

export type HomepageBlock =
  | HeroBlockData
  | PromoBannerBlockData
  | ProductGridBlockData
  | ProcessBlockData
  | PresenceBlockData;

interface RawPage {
  id: number;
  title: string;
  slug: string;
  layout: HomepageBlock[];
}

interface PayloadPageListResponse {
  docs: RawPage[];
}

// Fails to an empty layout (not a throw) if the CMS is briefly unreachable —
// an empty homepage is a visible, obvious failure an editor/dev would
// notice immediately, which is preferable to a 500.
export async function fetchPageBySlug(slug: string): Promise<HomepageBlock[]> {
  const url = `${CMS_URL}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`;
  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) {
      console.error(`Page fetch failed: ${res.status} ${res.statusText} — ${url}`);
      return [];
    }
    const data = (await res.json()) as PayloadPageListResponse;
    return data.docs[0]?.layout ?? [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// About / My Story — CMS-driven bio content (apps/cms/src/globals/About.ts).
// Shared by three consumers (Story.tsx on the homepage, /about, and
// AboutOverlay) so nothing can drift out of sync.
// ---------------------------------------------------------------------------

export interface AboutContentData {
  kicker: string;
  heading: string;
  paragraphs: string[];
  signatureName: string;
  signatureSubtitle: string;
  marginNote: string;
}

interface RawAbout {
  kicker?: string | null;
  heading?: string | null;
  paragraphs?: Array<{ text: string }> | null;
  signatureName?: string | null;
  signatureSubtitle?: string | null;
  marginNote?: string | null;
}

// Mirrors the CMS field defaultValues — used both as the fallback if the
// CMS is briefly unreachable AND as the shape AboutContent.tsx was already
// hardcoded to, so a fetch failure here degrades to exactly what shipped
// before this was CMS-driven, not a broken/empty section.
const DEFAULT_ABOUT_CONTENT: AboutContentData = {
  kicker: "My Story",
  heading: "One woman, *one* very colourful studio.",
  paragraphs: [
    "I'm Theresa — a freehand crochet artist and maker behind Yese Creations. There's no pattern, no machine, just yarn, paint, and a lot of patience: every piece starts as an idea and gets worked out stitch by stitch until it feels right.",
    "What began with cozy hats and decorative garlands has grown into a full little studio of handmade treasures — amigurumi dolls, plushies, painted prints, and home pieces, alongside the crochet you'll still find at the heart of it. Nothing here is mass-produced. Each item is made one at a time, which means small variations, real texture, and the kind of detail you only get from something made by hand rather than a machine.",
    "Whether you're after a gift that feels personal or something to make your own space a little warmer, I hope you find a piece that feels like it was made for you — because in a way, it was. Every order is wrapped, signed & posted by me.",
  ],
  signatureName: "Yese",
  signatureSubtitle: "— maker, painter & resident tea-drinker",
  marginNote: 'this is the only "team page"\nyou\'ll find on the site!',
};

export async function fetchAboutContent(): Promise<AboutContentData> {
  const url = `${CMS_URL}/api/globals/about`;
  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) {
      console.error(`About content fetch failed: ${res.status} ${res.statusText} — ${url}`);
      return DEFAULT_ABOUT_CONTENT;
    }
    const raw = (await res.json()) as RawAbout;
    return {
      kicker: raw.kicker || DEFAULT_ABOUT_CONTENT.kicker,
      heading: raw.heading || DEFAULT_ABOUT_CONTENT.heading,
      paragraphs:
        raw.paragraphs && raw.paragraphs.length > 0
          ? raw.paragraphs.map((p) => p.text)
          : DEFAULT_ABOUT_CONTENT.paragraphs,
      signatureName: raw.signatureName || DEFAULT_ABOUT_CONTENT.signatureName,
      signatureSubtitle: raw.signatureSubtitle || DEFAULT_ABOUT_CONTENT.signatureSubtitle,
      marginNote: raw.marginNote || DEFAULT_ABOUT_CONTENT.marginNote,
    };
  } catch (err) {
    console.error(err);
    return DEFAULT_ABOUT_CONTENT;
  }
}

// ---------------------------------------------------------------------------
// Legal pages (Privacy Policy / Terms & Conditions) — CMS-driven
// (apps/cms/src/globals/LegalPages.ts). DRAFT content grounded in what
// this app actually does, not legal advice — see that file's header
// comment. Modelled as sections (heading + body), same plain-text
// convention as the About global.
// ---------------------------------------------------------------------------

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalPageData {
  lastUpdated: string | null;
  sections: LegalSection[];
}

export interface LegalPagesData {
  privacy: LegalPageData;
  terms: LegalPageData;
}

interface RawLegalPage {
  lastUpdated?: string | null;
  sections?: LegalSection[] | null;
}

interface RawLegalPages {
  privacy?: RawLegalPage | null;
  terms?: RawLegalPage | null;
}

const EMPTY_LEGAL_PAGE: LegalPageData = { lastUpdated: null, sections: [] };

// Fails to empty sections (not a throw) if the CMS is briefly unreachable
// — an empty legal page is still a real failure worth noticing, but
// shouldn't take the whole route down with it.
export async function fetchLegalPages(): Promise<LegalPagesData> {
  const url = `${CMS_URL}/api/globals/legal-pages`;
  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) {
      console.error(`Legal pages fetch failed: ${res.status} ${res.statusText} — ${url}`);
      return { privacy: EMPTY_LEGAL_PAGE, terms: EMPTY_LEGAL_PAGE };
    }
    const raw = (await res.json()) as RawLegalPages;
    return {
      privacy: {
        lastUpdated: raw.privacy?.lastUpdated ?? null,
        sections: raw.privacy?.sections ?? [],
      },
      terms: {
        lastUpdated: raw.terms?.lastUpdated ?? null,
        sections: raw.terms?.sections ?? [],
      },
    };
  } catch (err) {
    console.error(err);
    return { privacy: EMPTY_LEGAL_PAGE, terms: EMPTY_LEGAL_PAGE };
  }
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
// Footer content (social/studio/legal links) — CMS-driven so adding or
// removing a link never needs a code deploy. Same shape/access pattern as
// site-settings.
// ---------------------------------------------------------------------------

export interface FooterSocialLink {
  platform: "instagram" | "pinterest" | "tiktok" | "other";
  url: string;
  label: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterContent {
  socialLinks: FooterSocialLink[];
  studioLinks: FooterLink[];
  legalLinks: FooterLink[];
}

// Empty arrays if the CMS is unreachable — an empty footer column is a much
// smaller failure than throwing and taking the whole homepage down with it.
const DEFAULT_FOOTER_CONTENT: FooterContent = {
  socialLinks: [],
  studioLinks: [],
  legalLinks: [],
};

export async function fetchFooterContent(): Promise<FooterContent> {
  const url = `${CMS_URL}/api/globals/footer-settings`;
  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) {
      console.error(`Footer content fetch failed: ${res.status} ${res.statusText} — ${url}`);
      return DEFAULT_FOOTER_CONTENT;
    }
    const raw = (await res.json()) as Partial<FooterContent>;
    return {
      socialLinks: raw.socialLinks ?? DEFAULT_FOOTER_CONTENT.socialLinks,
      studioLinks: raw.studioLinks ?? DEFAULT_FOOTER_CONTENT.studioLinks,
      legalLinks: raw.legalLinks ?? DEFAULT_FOOTER_CONTENT.legalLinks,
    };
  } catch (err) {
    console.error(err);
    return DEFAULT_FOOTER_CONTENT;
  }
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
  cat: string;
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
  // depth=1 expands the relationship to the full Category doc — same shape
  // as RawProduct.cat.
  cat: { id: number; name: string; slug: string } | number;
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
    cat: categoryName(raw.cat),
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
    const data = await fetchFeedback(`where[featured][equals]=true&limit=0&depth=1${sourceFilter(settings)}`);
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
  const data = await fetchFeedback(`limit=0&depth=1${sourceFilter(settings)}`);
  return data.docs.map(normaliseFeedback);
}
