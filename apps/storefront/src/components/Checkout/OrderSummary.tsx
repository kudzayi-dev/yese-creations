import { PHGradient } from "@yese/ui";
import { PALETTES } from "@yese/product-data";
import type { CartLine } from "~/hooks/useCart";
import { formatGBP } from "~/lib/format";
import styles from "./Checkout.module.css";

export interface OrderSummaryProps {
  cart: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
}

// Sticky order-summary card (checkout.html's .co-summary) — line items from
// the shared cart (hooks/useCart), a UI-only discount input, and the live
// totals Checkout.tsx recomputes on every shipping-method change.
export function OrderSummary({ cart, subtotal, shipping, total }: OrderSummaryProps) {
  return (
    <aside className={styles.summary}>
      <h3>Order summary</h3>
      <div>
        {cart.map((item) => (
          <div className={styles.line} key={item.id}>
            <div className={styles.thumb}>
              {item.img ? (
                <img className="prod-photo" src={item.img} alt={item.name} />
              ) : (
                <PHGradient palette={PALETTES[item.palette]!} motif={item.motif} />
              )}
            </div>
            <div>
              <div className={styles.lineName}>{item.name}</div>
              <div className={styles.lineQty}>Qty {item.qty}</div>
            </div>
            <div className={styles.linePrice}>{formatGBP(item.price * item.qty)}</div>
          </div>
        ))}
      </div>
      <div className={styles.promo}>
        <input type="text" placeholder="Discount code" disabled />
        <button type="button" disabled>
          Apply
        </button>
      </div>
      <div className={styles.totals}>
        <div className={styles.totalsRow}>
          <span>Subtotal</span>
          <span>{formatGBP(subtotal)}</span>
        </div>
        <div className={styles.totalsRow}>
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : formatGBP(shipping)}</span>
        </div>
        <div className={`${styles.totalsRow} ${styles.totalsGrand}`}>
          <span>Total</span>
          <strong>{formatGBP(total)}</strong>
        </div>
      </div>
    </aside>
  );
}
