import { useState, type FormEvent } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { SHIPPING_OPTIONS, type ShippingMethod } from "~/lib/shipping";
import { createOrder, type CreateOrderItem } from "~/lib/orders";
import { useCart } from "~/hooks/useCart";
import { IconLock } from "../icons";
import styles from "./Checkout.module.css";

export interface CheckoutFormProps {
  email: string;
  setEmail: (v: string) => void;
  shippingMethod: ShippingMethod;
  setShippingMethod: (m: ShippingMethod) => void;
  paymentIntentId: string | null;
}

interface ContactDetails {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
}

const EMPTY_CONTACT: ContactDetails = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  phone: "",
};

// The actual <form> — address fields, shipping-method radios, and the
// mounted Stripe Payment Element. Must render inside an <Elements> provider
// (Checkout.tsx only mounts this once a real clientSecret exists), since
// useStripe()/useElements() and <PaymentElement /> all need that context.
export function CheckoutForm({
  email,
  setEmail,
  shippingMethod,
  setShippingMethod,
  paymentIntentId,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { cart } = useCart();
  const [contact, setContact] = useState<ContactDetails>(EMPTY_CONTACT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const setField = (field: keyof ContactDetails) => (e: { target: { value: string } }) =>
    setContact((c) => ({ ...c, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!stripe || !elements || !paymentIntentId) return;

    setSubmitting(true);

    // The CMS owns customer contact/shipping details — create the Order
    // record there (status: "pending") BEFORE asking Stripe to confirm the
    // charge. Stripe only ever gets the email (for its own receipt), never
    // the shipping address. The webhook (api.webhooks.stripe.ts) flips this
    // order to "paid" once Stripe's signed event confirms the outcome.
    try {
      const items: CreateOrderItem[] = cart.map((c) => ({ id: c.id, qty: c.qty }));
      await createOrder({
        data: {
          paymentIntentId,
          email,
          shippingMethod,
          items,
          ...contact,
        },
      });
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Couldn't save your order — please try again.");
      return;
    }

    const returnUrl = `${window.location.origin}/confirmation`;
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
        payment_method_data: {
          billing_details: {
            email,
            name: `${contact.firstName} ${contact.lastName}`.trim(),
            phone: contact.phone || undefined,
            address: {
              line1: contact.address1,
              line2: contact.address2 || undefined,
              city: contact.city,
              postal_code: contact.postcode,
              country: contact.country,
            },
          },
        },
      },
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
              <input
                id="fname"
                name="firstName"
                type="text"
                required
                value={contact.firstName}
                onChange={setField("firstName")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="lname">Last name</label>
              <input
                id="lname"
                name="lastName"
                type="text"
                required
                value={contact.lastName}
                onChange={setField("lastName")}
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="addr1">Address</label>
              <input
                id="addr1"
                name="address1"
                type="text"
                required
                placeholder="Street address"
                value={contact.address1}
                onChange={setField("address1")}
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="addr2">Apartment, suite, etc. (optional)</label>
              <input
                id="addr2"
                name="address2"
                type="text"
                value={contact.address2}
                onChange={setField("address2")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                required
                value={contact.city}
                onChange={setField("city")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="postcode">Postcode</label>
              <input
                id="postcode"
                name="postcode"
                type="text"
                required
                value={contact.postcode}
                onChange={setField("postcode")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="country">Country</label>
              <select id="country" name="country" required value={contact.country} onChange={setField("country")}>
                <option>United Kingdom</option>
                <option>Ireland</option>
                <option>United States</option>
                <option>Other</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="phone">Phone (optional)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={contact.phone}
                onChange={setField("phone")}
              />
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
