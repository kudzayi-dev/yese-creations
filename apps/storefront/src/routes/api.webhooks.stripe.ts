/**
 * api.webhooks.stripe.ts — Stripe webhook endpoint. `/api/webhooks/stripe`.
 *
 * Stage 17. This — NOT the browser's post-payment redirect read on
 * /confirmation — is the trustworthy signal that a payment actually
 * succeeded (per the handoff's Backend Requirements section). Verifies the
 * Stripe-Signature header against STRIPE_WEBHOOK_SECRET before trusting the
 * payload at all.
 *
 * Order persistence is stubbed (logged) rather than fully implemented — see
 * the TODO below and Stage 17's Status/outcome note. Wiring this to a real
 * orders table/email send is a reasonable follow-up once one exists.
 */
import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";
import { getStripe } from "~/lib/stripe-server";
import { markOrderFailed, markOrderPaid } from "~/lib/orders";

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("stripe-signature");
        const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];

        if (!signature || !webhookSecret) {
          return Response.json(
            { error: "Missing Stripe signature or STRIPE_WEBHOOK_SECRET" },
            { status: 400 },
          );
        }

        // Signature verification needs the RAW body — do not JSON.parse
        // before this, and do not let any middleware touch the body first.
        const rawBody = await request.text();

        let event: Stripe.Event;
        try {
          event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown signature error";
          return Response.json({ error: `Webhook signature verification failed: ${message}` }, {
            status: 400,
          });
        }

        switch (event.type) {
          case "payment_intent.succeeded": {
            const intent = event.data.object;
            // The Order (customer contact/shipping details, CMS-owned) was
            // already created as "pending" by lib/orders.ts's createOrder,
            // called from CheckoutForm.tsx before this PaymentIntent was
            // confirmed. This — the verified, signed webhook event, not the
            // client-side redirect — is what flips it to "paid".
            console.log("[stripe webhook] payment_intent.succeeded", {
              id: intent.id,
              amount: intent.amount,
              metadata: intent.metadata,
            });
            await markOrderPaid(intent.id);
            break;
          }
          case "payment_intent.payment_failed": {
            const intent = event.data.object;
            console.log("[stripe webhook] payment_intent.payment_failed", {
              id: intent.id,
              lastError: intent.last_payment_error?.message,
            });
            await markOrderFailed(intent.id);
            break;
          }
          default:
            // Unhandled event types are fine to ignore — Stripe sends many
            // more than checkout needs to react to.
            break;
        }

        return Response.json({ received: true });
      },
    },
  },
});
