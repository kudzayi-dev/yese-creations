import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCart } from "~/hooks/useCart";
import { createPaymentIntent, updatePaymentIntent } from "~/lib/checkout";
import { computeTotals, type ShippingMethod } from "~/lib/shipping";
import { buildAppearance } from "./appearance";
import { CheckoutNav } from "./CheckoutNav";
import { OrderSummary } from "./OrderSummary";
import { CheckoutForm } from "./CheckoutForm";
import { IconChevronRight } from "../icons";
import styles from "./Checkout.module.css";

// The real checkout, following the shared cart (hooks/useCart). Ports
// checkout.html's layout/copy 1:1 (co-nav, co-steps, address form, shipping
// radios, Stripe Payment Element, sticky order summary) but replaces the
// prototype's STUB_createPaymentIntent()/hardcoded key with a real
// server-created PaymentIntent (~/lib/checkout.ts) and env-sourced keys.
// Split across this directory: CheckoutNav (nav bar), OrderSummary (sticky
// cart recap), CheckoutForm (address/shipping/Stripe form, only ever mounted
// once inside the <Elements> provider below), and appearance.ts (Stripe
// Payment Element theming, derived from tokens.css).

const stripePromise = loadStripe(import.meta.env["VITE_STRIPE_PUBLISHABLE_KEY"] ?? "");

export function Checkout() {
  const { cart } = useCart();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [email, setEmail] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [intentError, setIntentError] = useState("");

  const cartSubtotal = useMemo(
    () => Math.round(cart.reduce((s, c) => s + c.price * c.qty, 0) * 100) / 100,
    [cart],
  );
  const totals = useMemo(() => computeTotals(cartSubtotal, shippingMethod), [cartSubtotal, shippingMethod]);
  const items = useMemo(() => cart.map((c) => ({ id: c.id, qty: c.qty })), [cart]);

  // Computed once, lazily, only once we're actually about to mount <Elements>
  // (i.e. definitely client-side — see appearance.ts's doc comment).
  const appearance = useMemo(() => buildAppearance(), []);

  // Create the PaymentIntent once the (hydrated) cart is known to be
  // non-empty. Re-priced server-side in lib/checkout.ts — see that file for
  // why the client never sends a price.
  useEffect(() => {
    if (cart.length === 0 || clientSecret) return;
    let cancelled = false;
    createPaymentIntent({ data: { items, shippingMethod, email: email || undefined } })
      .then((res) => {
        if (cancelled) return;
        setClientSecret(res.clientSecret);
        setPaymentIntentId(res.paymentIntentId);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setIntentError(err instanceof Error ? err.message : "Couldn't start checkout — please try again.");
      });
    return () => {
      cancelled = true;
    };
    // Only fires once per mount with a non-empty cart — shipping/email
    // changes after that are pushed via the update effect below instead of
    // recreating the PaymentIntent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length > 0]);

  // Keep the PaymentIntent's amount in sync when shipping method changes
  // after it's already been created (e.g. the customer switches from
  // Standard to Next day before paying).
  useEffect(() => {
    if (!paymentIntentId) return;
    updatePaymentIntent({ data: { paymentIntentId, items, shippingMethod, email: email || undefined } }).catch(
      () => {
        // Non-fatal: the displayed total is still correct (computed
        // client-side from the same shipping.ts rates); a failed sync just
        // means the PaymentIntent would be re-verified server-side again on
        // the next update. Surfacing this as a blocking error would be worse
        // than letting the retry happen naturally.
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingMethod]);

  if (cart.length === 0) {
    return (
      <>
        <CheckoutNav />
        <main className={styles.empty}>
          <strong className={styles.emptyTitle}>Your basket is empty</strong>
          <p>
            Nothing to check out yet — <a href="/">head back to the shop</a>.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <CheckoutNav />
      <main className={styles.main}>
        <div>
          <div className={styles.steps}>
            <span className={styles.stepsOn}>1. Shipping</span>
            <IconChevronRight />
            <span className={styles.stepsOn}>2. Payment</span>
            <IconChevronRight />
            <span>3. Confirmation</span>
          </div>

          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
              <CheckoutForm
                email={email}
                setEmail={setEmail}
                shippingMethod={shippingMethod}
                setShippingMethod={setShippingMethod}
                paymentIntentId={paymentIntentId}
              />
            </Elements>
          ) : (
            <div className={styles.payCard}>
              <div className={styles.payPlaceholder}>{intentError || "Preparing secure payment…"}</div>
            </div>
          )}
        </div>

        <OrderSummary cart={cart} subtotal={totals.subtotal} shipping={totals.shipping} total={totals.total} />
      </main>
    </>
  );
}
