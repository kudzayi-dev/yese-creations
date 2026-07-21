// lib/analytics.ts — thin, safe wrapper around Umami's client script.
//
// Every call here is a no-op if window.umami isn't present (script not
// configured in this environment, blocked by an ad-blocker, or hasn't
// finished loading yet) — analytics must NEVER be able to throw and break
// a real user interaction. Named helper functions (not a bare `track()`
// call scattered everywhere) so event names/payload shapes stay
// consistent across every place they're called from — see each
// component wiring one of these in for the actual instrumentation.
//
// Covers the interactions explicitly asked for: search, navigation,
// category filtering, PLP (product grid) click interactions, PDP
// interactions, favourites/wishlist, and cart — see the individual
// functions below for exactly what's tracked. This is not literally
// "every possible user action" (e.g. individual scroll position, mouse
// movement) — it's every MEANINGFUL interaction in the shopping journey.

interface UmamiGlobal {
  track: (eventName: string, eventData?: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    umami?: UmamiGlobal;
  }
}

function track(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return; // SSR — never runs there
  try {
    window.umami?.track(eventName, data);
  } catch {
    // Analytics failing must never break the actual user interaction it's
    // attached to.
  }
}

// ---- Search ----
export function trackSearchQuery(query: string, resultCount: number) {
  track("search_query", { query, resultCount });
}
export function trackSearchResultClick(productSlug: string, query: string) {
  track("search_result_click", { productSlug, query });
}
export function trackSearchPopularCategoryClick(category: string) {
  track("search_popular_category_click", { category });
}

// ---- Navigation ----
export function trackNavClick(label: string) {
  track("nav_click", { label });
}

// ---- Category filtering (Shop grid / /feedback chips) ----
export function trackCategoryFilter(category: string, context: "shop" | "feedback") {
  track("category_filter", { category, context });
}

// ---- PLP (product grid card) interactions ----
export function trackProductCardClick(productSlug: string, source: "grid" | "search" | "related") {
  track("product_card_click", { productSlug, source });
}
export function trackProductCardAddToCart(productSlug: string, source: "grid" | "overlay" | "pdp") {
  track("add_to_cart", { productSlug, source });
}

// ---- PDP / overlay interactions ----
export function trackProductViewed(productSlug: string, view: "overlay" | "pdp") {
  track("product_viewed", { productSlug, view });
}
export function trackGalleryThumbClick(productSlug: string, index: number, view: "overlay" | "pdp") {
  track("gallery_thumb_click", { productSlug, index, view });
}
export function trackQuantityChange(productSlug: string, quantity: number, view: "overlay" | "pdp") {
  track("quantity_change", { productSlug, quantity, view });
}

// ---- Favourites / wishlist ----
export function trackWishlistToggle(productSlug: string, added: boolean, source: "grid" | "overlay" | "pdp") {
  track("wishlist_toggle", { productSlug, added, source });
}

// ---- Cart ----
export function trackCartOpen() {
  track("cart_open");
}
export function trackCartRemoveItem(productName: string) {
  track("cart_remove_item", { productName });
}
export function trackCheckoutStart(itemCount: number, subtotal: number) {
  track("checkout_start", { itemCount, subtotal });
}

// ---- Newsletter ----
export function trackNewsletterSignup() {
  track("newsletter_signup");
}
