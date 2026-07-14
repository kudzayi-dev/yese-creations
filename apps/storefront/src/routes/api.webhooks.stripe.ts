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
            // TODO: this is the real hook point for order persistence —
            // create the order record (using intent.metadata.items /
            // shippingMethod / subtotal / shipping set in
            // lib/checkout.ts's createPaymentIntent), send the confirmation
            // email, and trigger fulfillment. No orders table exists yet
            // (out of scope for Stage 17 per its task list), so this is
            // logged rather than persisted — flagged in the stage's
            // Status/outcome section.
            console.log("[stripe webhook] payment_intent.succeeded", {
              id: intent.id,
              amount: intent.amount,
              metadata: intent.metadata,
            });
            break;
          }
          case "payment_intent.payment_failed": {
            const intent = event.data.object;
            console.log("[stripe webhook] payment_intent.payment_failed", {
              id: intent.id,
              lastError: intent.last_payment_error?.message,
            });
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
