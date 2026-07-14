import { useState, type FormEvent } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { SHIPPING_OPTIONS, type ShippingMethod } from "~/lib/shipping";
import { IconLock } from "../icons";
import styles from "./Checkout.module.css";

export interface CheckoutFormProps {
  email: string;
  setEmail: (v: string) => void;
  shippingMethod: ShippingMethod;
  setShippingMethod: (m: ShippingMethod) => void;
}

// The actual <form> — address fields, shipping-method radios, and the
// mounted Stripe Payment Element. Must render inside an <Elements> provider
// (Checkout.tsx only mounts this once a real clientSecret exists), since
// useStripe()/useElements() and <PaymentElement /> all need that context.
export function CheckoutForm({ email, setEmail, shippingMethod, setShippingMethod }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!stripe || !elements) return;

    setSubmitting(true);
    const returnUrl = `${window.location.origin}/confirmation`;
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl, payment_method_data: { billing_details: { email } } },
    });
    // On success Stripe redirects the browser to return_url itself — we only
    // ever reach this line on failure.
    if (result.error) {
      setSubmitting(false);
      setError(result.error.message ?? "Something went wrong — please try again.");
    }
  };

  return (
    <form id="co-checkout-form" onSubmit={handleSubmit}>
      <div>
        <div className={styles.section}>
          <h2 className={styles.h2}>Contact &amp; shipping address</h2>
          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="fname">First name</label>
              <input id="fname" type="text" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="lname">Last name</label>
              <input id="lname" type="text" required />
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="addr1">Address</label>
              <input id="addr1" type="text" required placeholder="Street address" />
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="addr2">Apartment, suite, etc. (optional)</label>
              <input id="addr2" type="text" />
            </div>
            <div className={styles.field}>
              <label htmlFor="city">City</label>
              <input id="city" type="text" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="postcode">Postcode</label>
              <input id="postcode" type="text" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="country">Country</label>
              <select id="country" required defaultValue="United Kingdom">
                <option>United Kingdom</option>
                <option>Ireland</option>
                <option>United States</option>
                <option>Other</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="phone">Phone (optional)</label>
              <input id="phone" type="tel" />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.h2}>Shipping method</h2>
          <div className={styles.shipOpts}>
            {SHIPPING_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`${styles.shipOpt} ${shippingMethod === opt.value ? styles.shipOptSelected : ""}`}
              >
                <input
                  type="radio"
                  name="shipping"
                  value={opt.value}
                  checked={shippingMethod === opt.value}
                  onChange={() => setShippingMethod(opt.value)}
                />
                <span className={styles.shipOptLbl}>
                  {opt.label}
                  <span className={styles.shipOptSub}>{opt.sub}</span>
                </span>
                <span className={styles.shipOptAmt}>{opt.amountLabel}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.h2}>Payment</h2>
          <div className={styles.payCard}>
            <div className={styles.payElement}>
              <PaymentElement />
            </div>
          </div>
          <div className={styles.payBadges}>
            <IconLock />
            Payments secured by Stripe · we never see your card details
          </div>
        </div>

        <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={!stripe || submitting}>
          {submitting ? "Processing…" : "Pay & place order"}
        </button>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.reassure}>
          Wrapped, signed &amp; posted by me ✦ 14-day returns ✦ Questions? hello@yesecreations.com
        </div>
      </div>
    </form>
  );
}
