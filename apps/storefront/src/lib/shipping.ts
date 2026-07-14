/**
 * shipping.ts — shipping rate constants + totals math shared by client and
 * server. No Stripe/CMS import here on purpose: this file is safe to import
 * from the client Checkout component (for the live totals display) AND from
 * the server-only pricing in lib/stripe-server.ts (so the two can never
 * disagree about a rate).
 *
 * Ported verbatim from design_handoff_yese_checkout/checkout.js.
 */

export type ShippingMethod = "standard" | "express" | "nextday";

export const SHIPPING_RATES: Record<ShippingMethod, number> = {
  standard: 0,
  express: 6.5,
  nextday: 12,
};

export const FREE_SHIP_THRESHOLD = 80;

export const SHIPPING_OPTIONS: Array<{
  value: ShippingMethod;
  label: string;
  sub: string;
  amountLabel: string;
}> = [
  { value: "standard", label: "Standard", sub: "5–7 working days", amountLabel: "Free over £80" },
  { value: "express", label: "Express", sub: "2–3 working days", amountLabel: "£6.50" },
  { value: "nextday", label: "Next day", sub: "Order before 2pm", amountLabel: "£12.00" },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function shippingCost(subtotal: number, method: ShippingMethod): number {
  return subtotal >= FREE_SHIP_THRESHOLD ? 0 : (SHIPPING_RATES[method] ?? 0);
}

export function computeTotals(subtotal: number, method: ShippingMethod) {
  const shipping = shippingCost(subtotal, method);
  return { subtotal: round2(subtotal), shipping: round2(shipping), total: round2(subtotal + shipping) };
}
