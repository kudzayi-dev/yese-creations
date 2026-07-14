/**
 * format.ts — the ONE GBP display formatter. Every price shown anywhere in
 * the storefront (ProductCard, ProductOverlay, Pdp, CartDrawer, Checkout,
 * Confirmation, Gallery) goes through this — no component defines its own
 * `£${n}` interpolation or a local copy of this function. If a new place
 * needs to show a price, import this rather than writing another one.
 *
 * Ported from the toFixed(2)/strip-trailing-".00" logic in
 * design_handoff_yese_checkout/checkout.js + confirmation.js (£24.99, £80,
 * £6.50 — two decimals only when they're non-zero).
 */
export function formatGBP(amount: number): string {
  return `£${amount.toFixed(2).replace(/\.00$/, "")}`;
}
