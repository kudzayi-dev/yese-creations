import { useCart } from "~/hooks/useCart";
import styles from "./Toast.module.css";

// Ported from Toast in app.jsx. Shows/hides based on the shared toast message
// in cart context; addToCart sets it and clears it again after ~1.8s.
export function Toast() {
  const { toast } = useCart();
  return (
    <div className={`${styles.toast} ${toast ? styles.show : ""}`} role="status" aria-live="polite">
      <span className={styles.dot} /> {toast}
    </div>
  );
}
