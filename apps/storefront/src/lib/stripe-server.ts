/**
 * stripe-server.ts — server-only Stripe client + price re-derivation.
 *
 * SERVER-ONLY. Never import this from client components — import the thin
 * createServerFn wrappers in lib/checkout.ts instead (same split as
 * cms.ts → lib/products.ts). Keeping the `stripe` package and the CMS fetch
 * out of any module the client imports is what keeps STRIPE_SECRET_KEY (and
 * the whole `stripe` Node SDK) out of the browser bundle.
 *
 * Architecture boundary (load-bearing, per the checkout design handoff):
 * creating a Stripe PaymentIntent requires the SECRET key and must happen
 * server-side only. The client only ever sends { id, qty } pairs — never
 * prices. Every line price is re-derived here from the CMS
 * (fetchAllProducts(), the same data the storefront's own product pages
 * read), so a tampered client request can only ever charge the real catalog
 * price, never a client-submitted one.
 */

import Stripe from "stripe";
import { fetchAllProducts } from "./cms";
import { computeTotals, type ShippingMethod } from "./shipping";

export interface PricedLine {
  id: number;
  name: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface PricedCart {
  lines: PricedLine[];
  subtotal: number;
  shippingMethod: ShippingMethod;
  shipping: number;
  total: number;
}

/**
 * Re-derives prices from the CMS for a client-submitted cart (id/qty pairs
 * only). Throws if a submitted id doesn't exist in the catalog — never
 * silently drop or trust an unknown line.
 */
export async function priceCart(
  items: Array<{ id: number; qty: number }>,
  shippingMethod: ShippingMethod,
): Promise<PricedCart> {
  const products = await fetchAllProducts();
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: PricedLine[] = items.map((item) => {
    const product = byId.get(item.id);
    if (!product) throw new Error(`Unknown product id in cart: ${item.id}`);
    const qty = Math.max(1, Math.floor(item.qty));
    return {
      id: product.id,
      name: product.name,
      unitPrice: product.price,
      qty,
      lineTotal: Math.round(product.price * qty * 100) / 100,
    };
  });

  const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
  const totals = computeTotals(subtotal, shippingMethod);

  return { lines, subtotal: totals.subtotal, shippingMethod, shipping: totals.shipping, total: totals.total };
}

let stripeClient: Stripe | undefined;
export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set (server env only)");
  stripeClient = new Stripe(key);
  return stripeClient;
}
