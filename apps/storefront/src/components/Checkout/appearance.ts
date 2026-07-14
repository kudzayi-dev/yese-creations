/**
 * appearance.ts — Stripe Payment Element theming, derived from tokens.css
 * rather than a hardcoded copy of it.
 *
 * Stripe's Appearance API renders inside a sandboxed iframe, so it can't
 * resolve CSS custom properties itself (var(--coral) means nothing to it) —
 * it needs literal values. Rather than hardcoding a second copy of the
 * tokens.css palette here (which is exactly what checkout.js's prototype
 * did, and how a copy silently drifts from the source of truth), read the
 * computed values straight off :root at call time.
 */
import type { Appearance } from "@stripe/stripe-js";

// buildAppearance() is only ever read once clientSecret is set (client-only
// state, never populated during SSR) — but the useMemo that calls it in
// Checkout.tsx still *runs* on every render including the server one, so
// this guards the same way lib/cart-storage.ts guards its localStorage
// access, rather than assuming `document` exists. The fallback values are
// only what render server-side (never shown to a user); the real, current
// tokens.css values are what the browser reads and actually mounts Payment
// Element with.
function cssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

// #rrggbb (as tokens.css declares them) → rgba() string with the given alpha,
// for the checkout form's tinted borders/focus rings. tokens.css only has the
// solid brand colors, not these alpha blends, so this derives them rather
// than hardcoding separate rgba literals that would need updating in lockstep.
function hexToRgba(hex: string, alpha: number): string {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!match) return hex; // already rgba()/hsl()/etc, or an unexpected format — pass through
  const [r, g, b] = match.slice(1).map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function buildAppearance(): Appearance {
  const coral = cssVar("--coral", "#FF6F61");
  const paper = cssVar("--paper", "#FFFAF1");
  const teal = cssVar("--teal", "#0E3B43");
  const tealDeep = cssVar("--teal-deep", "#082329");

  return {
    theme: "flat",
    variables: {
      colorPrimary: coral,
      colorBackground: paper,
      colorText: tealDeep,
      colorDanger: coral,
      fontFamily: cssVar("--font-body", '"DM Sans", system-ui, sans-serif'),
      borderRadius: "12px",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": { border: `1px solid ${hexToRgba(teal, 0.16)}`, boxShadow: "none", padding: "12px 14px" },
      ".Input:focus": { border: `1px solid ${coral}`, boxShadow: `0 0 0 3px ${hexToRgba(coral, 0.15)}` },
      ".Label": { fontSize: "12px", fontWeight: "600", color: teal },
      ".Tab": { border: `1px solid ${hexToRgba(teal, 0.16)}`, borderRadius: "12px" },
      ".Tab--selected": { border: `1px solid ${coral}`, backgroundColor: hexToRgba(coral, 0.06) },
    },
  };
}
