/**
 * orders.ts — CMS-owned Order creation/updates.
 *
 * Architecture boundary (load-bearing, per the "CMS owns customer contact
 * details, Stripe only processes payment" requirement): the CMS's `orders`
 * collection (apps/cms/src/collections/Orders.ts) is the single system of
 * record for a customer's name/address/phone/email. Stripe's PaymentIntent
 * only ever receives an email (for its own receipt) — never the shipping
 * address — see CheckoutForm.tsx's confirmPayment call.
 *
 * `createOrder` runs server-side only (createServerFn) and is called from
 * CheckoutForm.tsx BEFORE stripe.confirmPayment(), writing a "pending" Order
 * to the CMS keyed by the PaymentIntent id. `markOrderPaid`/`markOrderFailed`
 * are plain async helpers (not createServerFn — they're already only ever
 * called from another server-only module, the webhook route) that flip that
 * Order's status once Stripe's signed webhook event confirms the outcome.
 *
 * Both talk to the CMS's REST API over HTTP (separate process/port) using the
 * shared CMS_SERVICE_TOKEN secret as the `x-service-token` header — see the
 * access-control comment in Orders.ts for why this is safe: the token only
 * ever grants create/update, never read, and never leaves the server.
 *
 * Prices are re-derived server-side via priceCart() (the same re-derivation
 * used for the PaymentIntent itself) rather than trusted from the client, so
 * a tampered request can only ever record the real catalog price.
 */

import { createServerFn } from "@tanstack/react-start";
import { priceCart } from "./stripe-server";
import type { ShippingMethod } from "./shipping";

export interface CreateOrderItem {
  id: number;
  qty: number;
}

export interface CreateOrderInput {
  paymentIntentId: string;
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  shippingMethod: ShippingMethod;
  items: CreateOrderItem[];
}

function cmsUrl(): string {
  const url = process.env["CMS_URL"];
  if (!url) throw new Error("CMS_URL is not set (server env only)");
  return url;
}

function serviceToken(): string {
  const token = process.env["CMS_SERVICE_TOKEN"];
  if (!token) throw new Error("CMS_SERVICE_TOKEN is not set (server env only)");
  return token;
}

// Called from CheckoutForm.tsx right before confirming payment with Stripe.
// Creates a "pending" Order in the CMS — the CMS's copy of the customer's
// contact/shipping details, independent of whatever Stripe ends up storing.
export const createOrder = createServerFn({ method: "POST" })
  .validator((data: CreateOrderInput) => data)
  .handler(async ({ data }): Promise<{ id: string | number }> => {
    if (!data.items.length) {
      throw new Error("Cannot create an order for an empty cart");
    }
    // Re-derive prices from the CMS catalog — never trust client-submitted
    // amounts, same rule as createPaymentIntent in checkout.ts.
    const priced = await priceCart(data.items, data.shippingMethod);

    const res = await fetch(`${cmsUrl()}/api/orders`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-service-token": serviceToken(),
      },
      body: JSON.stringify({
        status: "pending",
        stripePaymentIntentId: data.paymentIntentId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        address1: data.address1,
        address2: data.address2 || undefined,
        city: data.city,
        postcode: data.postcode,
        country: data.country,
        phone: data.phone || undefined,
        shippingMethod: priced.shippingMethod,
        items: priced.lines.map((l) => ({
          productId: l.id,
          name: l.name,
          unitPrice: l.unitPrice,
          qty: l.qty,
          lineTotal: l.lineTotal,
        })),
        subtotal: priced.subtotal,
        shipping: priced.shipping,
        total: priced.total,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Failed to create order in CMS (${res.status}): ${body}`);
    }

    const json = (await res.json()) as { doc: { id: string | number } };
    return { id: json.doc.id };
  });

// Called from the Stripe webhook route (api.webhooks.stripe.ts) — a
// server-only module, so this is a plain function, not a createServerFn.
// Finds the Order by its stripePaymentIntentId and flips its status.
async function updateOrderStatusByPaymentIntent(
  paymentIntentId: string,
  status: "paid" | "payment_failed",
): Promise<void> {
  const findRes = await fetch(
    `${cmsUrl()}/api/orders?where[stripePaymentIntentId][equals]=${encodeURIComponent(paymentIntentId)}&limit=1`,
    { headers: { "x-service-token": serviceToken() } },
  );
  if (!findRes.ok) {
    console.error(`[orders] Failed to look up order for PaymentIntent ${paymentIntentId}: ${findRes.status}`);
    return;
  }
  const found = (await findRes.json()) as { docs: Array<{ id: string | number }> };
  const order = found.docs[0];
  if (!order) {
    console.error(`[orders] No order found for PaymentIntent ${paymentIntentId} — cannot mark ${status}`);
    return;
  }

  const updateRes = await fetch(`${cmsUrl()}/api/orders/${order.id}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-service-token": serviceToken(),
    },
    body: JSON.stringify({ status }),
  });
  if (!updateRes.ok) {
    const body = await updateRes.text().catch(() => "");
    console.error(`[orders] Failed to mark order ${order.id} as ${status} (${updateRes.status}): ${body}`);
  }
}

export async function markOrderPaid(paymentIntentId: string): Promise<void> {
  await updateOrderStatusByPaymentIntent(paymentIntentId, "paid");
}

export async function markOrderFailed(paymentIntentId: string): Promise<void> {
  await updateOrderStatusByPaymentIntent(paymentIntentId, "payment_failed");
}
