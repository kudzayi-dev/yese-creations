/**
 * checkout.ts — createServerFn wrappers for checkout pricing + Stripe.
 *
 * The handler bodies run on the SERVER only. TanStack Start's plugin strips
 * the body (and its `./stripe-server` import, and therefore
 * STRIPE_SECRET_KEY + the `stripe` package) out of the client bundle,
 * leaving a callable RPC stub — same pattern as products.ts wrapping cms.ts.
 * Do NOT import stripe-server.ts directly from client components; import the
 * wrappers below instead.
 */

import { createServerFn } from "@tanstack/react-start";
import { getStripe, priceCart, type PricedCart } from "./stripe-server";
import type { ShippingMethod } from "./shipping";

export interface CreatePaymentIntentInput {
  items: Array<{ id: number; qty: number }>;
  shippingMethod: ShippingMethod;
  email?: string;
}

export interface CreatePaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  priced: PricedCart;
}

// Called once from the checkout page as soon as the cart is known to be
// non-empty. Recomputes the total server-side (priceCart, in stripe-server.ts)
// before calling stripe.paymentIntents.create — the amount sent to Stripe is
// never taken from the client payload.
export const createPaymentIntent = createServerFn({ method: "POST" })
  .validator((data: CreatePaymentIntentInput) => data)
  .handler(async ({ data }): Promise<CreatePaymentIntentResult> => {
    if (!data.items.length) {
      throw new Error("Cannot create a PaymentIntent for an empty cart");
    }
    const priced = await priceCart(data.items, data.shippingMethod);
    if (priced.total <= 0) {
      throw new Error("Cart total must be greater than zero");
    }

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(priced.total * 100), // Stripe wants the smallest currency unit (pence)
      currency: "gbp",
      receipt_email: data.email,
      automatic_payment_methods: { enabled: true },
      metadata: {
        // Kept small and structured so the webhook can reconstruct the order
        // from trusted server-side data, not anything the client asserted.
        items: JSON.stringify(priced.lines.map((l) => ({ id: l.id, qty: l.qty }))),
        shippingMethod: priced.shippingMethod,
        subtotal: String(priced.subtotal),
        shipping: String(priced.shipping),
      },
    });

    if (!intent.client_secret) {
      throw new Error("Stripe did not return a client secret for the PaymentIntent");
    }

    return { clientSecret: intent.client_secret, paymentIntentId: intent.id, priced };
  });

export interface UpdatePaymentIntentInput {
  paymentIntentId: string;
  items: Array<{ id: number; qty: number }>;
  shippingMethod: ShippingMethod;
  email?: string;
}

// Called when the customer changes shipping method (or their cart changes)
// after a PaymentIntent already exists, so the amount Stripe will actually
// charge always matches what's on screen — re-priced server-side again, same
// as creation.
export const updatePaymentIntent = createServerFn({ method: "POST" })
  .validator((data: UpdatePaymentIntentInput) => data)
  .handler(async ({ data }): Promise<{ priced: PricedCart }> => {
    if (!data.items.length) {
      throw new Error("Cannot price an empty cart");
    }
    const priced = await priceCart(data.items, data.shippingMethod);
    if (priced.total <= 0) {
      throw new Error("Cart total must be greater than zero");
    }

    const stripe = getStripe();
    await stripe.paymentIntents.update(data.paymentIntentId, {
      amount: Math.round(priced.total * 100),
      receipt_email: data.email,
      metadata: {
        items: JSON.stringify(priced.lines.map((l) => ({ id: l.id, qty: l.qty }))),
        shippingMethod: priced.shippingMethod,
        subtotal: String(priced.subtotal),
        shipping: String(priced.shipping),
      },
    });

    return { priced };
  });
