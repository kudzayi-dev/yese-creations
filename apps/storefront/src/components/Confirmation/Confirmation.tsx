import { useEffect, useRef, useState } from "react";
import { PHGradient } from "@yese/ui";
import { PALETTES } from "@yese/product-data";
import { useCart, type CartLine } from "~/hooks/useCart";
import { formatGBP } from "~/lib/format";
import { IconArrowLeft, IconCheck } from "../icons";
import checkoutStyles from "../Checkout/Checkout.module.css";
import styles from "./Confirmation.module.css";

export type RedirectStatus = "succeeded" | "processing" | "requires_payment_method" | undefined;

export interface ConfirmationProps {
  redirectStatus: RedirectStatus;
}

const ORDER_STORAGE_KEY = "yese_last_order";

function readOrGenerateOrderNumber(): string {
  if (typeof window === "undefined") return "";
  const stored = window.sessionStorage.getItem(ORDER_STORAGE_KEY);
  if (stored) return stored;
  const n = `YC-${Math.floor(100000 + Math.random() * 900000)}`;
  window.sessionStorage.setItem(ORDER_STORAGE_KEY, n);
  return n;
}

// Order confirmation, state-driven by Stripe's redirect_status
// query param (see routes/confirmation.tsx's validateSearch). Per the
// handoff: this browser-side read is provisional UI only — the webhook
// (api.webhooks.stripe.ts) is the trustworthy signal a payment succeeded,
// used for real order creation/fulfillment. This page just clears the
// shared cart on succeeded and shows the right message.
export function Confirmation({ redirectStatus }: ConfirmationProps) {
  const { cart, clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState("");

  // The cart gets cleared on success — snapshot it once hydrated so the
  // "what you ordered" recap still has something to render after clearCart()
  // empties the live cart out from under it.
  const [orderCart, setOrderCart] = useState<CartLine[]>([]);
  const capturedRef = useRef(false);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!capturedRef.current && cart.length > 0) {
      capturedRef.current = true;
      setOrderCart(cart);
    }
  }, [cart]);

  useEffect(() => {
    setOrderNumber(readOrGenerateOrderNumber());
  }, []);

  useEffect(() => {
    const isSuccess = redirectStatus === "succeeded" || redirectStatus === undefined;
    if (isSuccess && !clearedRef.current) {
      clearedRef.current = true;
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectStatus]);

  const subtotal = orderCart.reduce((s, c) => s + c.price * c.qty, 0);

  let title: string;
  let sub: string;
  let showOrderNumber = true;

  if (redirectStatus === "requires_payment_method") {
    title = "Payment didn't go through";
    sub = "No charge was made — please try again from checkout.";
    showOrderNumber = false;
  } else if (redirectStatus === "processing") {
    title = "Payment processing";
    sub = "We'll email you as soon as it's confirmed — this page can be closed safely.";
  } else {
    // succeeded, or no Stripe redirect param at all
    title = "Thank you for your order!";
    sub = "A confirmation email is on its way. Every piece is wrapped and posted by hand within 2–3 days.";
  }

  return (
    <>
      <nav className={styles.nav}>
        <a className={styles.back} href="/">
          <IconArrowLeft size={18} />
          Home
        </a>
        <a className={styles.brand} href="/" aria-label="Yese Creations home">
          <img src="/assets/yese-logo-cutout.png" alt="" />
          <span>
            <span className={styles.brandName}>Yese</span> <span className={styles.brandTag}>creations</span>
          </span>
        </a>
      </nav>

      <main className={styles.main}>
        <div className={styles.check}>
          <IconCheck size={34} />
        </div>
        <h1 className={styles.h1}>{title}</h1>
        <p className={styles.sub}>{sub}</p>
        {showOrderNumber && orderNumber && <div className={styles.orderNo}>Order {orderNumber}</div>}

        {orderCart.length > 0 && (
          <div className={styles.summary}>
            <h3>What you ordered</h3>
            <div>
              {orderCart.map((item) => (
                <div className={checkoutStyles.line} key={item.id}>
                  <div className={checkoutStyles.thumb}>
                    {item.img ? (
                      <img className="prod-photo" src={item.img} alt={item.name} />
                    ) : (
                      <PHGradient palette={PALETTES[item.palette]!} motif={item.motif} />
                    )}
                  </div>
                  <div>
                    <div className={checkoutStyles.lineName}>{item.name}</div>
                    <div className={checkoutStyles.lineQty}>Qty {item.qty}</div>
                  </div>
                  <div className={checkoutStyles.linePrice}>{formatGBP(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            <div className={checkoutStyles.totals}>
              <div className={`${checkoutStyles.totalsRow} ${checkoutStyles.totalsGrand}`}>
                <span>Total paid</span>
                <strong>{formatGBP(subtotal)}</strong>
              </div>
            </div>
          </div>
        )}

        <p className={styles.next}>
          You&apos;ll get an email once your order ships, with tracking if the courier provides it. Questions in
          the meantime? <a href="mailto:hello@yesecreations.com">hello@yesecreations.com</a>
        </p>

        <div className={styles.actions}>
          <a className="btn btn-primary" href="/">
            Continue shopping
          </a>
        </div>
      </main>
    </>
  );
}
