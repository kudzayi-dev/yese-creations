import { useEffect } from "react";

// Same-origin paths that, when they're where the visitor is arriving FROM,
// mean "take them straight to the shop section" — these are exactly the
// routes whose own "back to shop"/"continue shopping" links point at "/"
// (Checkout.tsx, CheckoutNav.tsx, Confirmation.tsx, Pdp.tsx) now that those
// links no longer carry a "#shop" hash (per user request: avoid the
// address bar showing "/#shop" after a real cross-page navigation).
const SHOP_RETURN_PATHS = ["/checkout", "/confirmation"] as const;

function cameFromShopFlow(referrer: string): boolean {
  if (!referrer) return false;
  let ref: URL;
  try {
    ref = new URL(referrer);
  } catch {
    return false;
  }
  if (ref.origin !== window.location.origin) return false;
  return (
    (SHOP_RETURN_PATHS as readonly string[]).includes(ref.pathname) ||
    ref.pathname.startsWith("/product/")
  );
}

/**
 * Reads document.referrer once on mount and, if the visitor just navigated
 * here from checkout/confirmation/a PDP, smooth-scrolls straight to the
 * #shop section — the same destination those pages' "back to shop" links
 * used to reach via a "/#shop" URL hash, now reached without ever putting
 * the hash in the address bar. Real cross-page navigation still has to
 * happen (those routes don't render the shop section themselves), this
 * just replaces the hash-based landing with a referrer check + scrollIntoView
 * on the page that DOES have #shop in its DOM.
 */
export function useScrollToShopFromReferrer(): void {
  useEffect(() => {
    if (!cameFromShopFlow(document.referrer)) return;
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
}
