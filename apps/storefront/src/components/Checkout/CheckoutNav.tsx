import { IconArrowLeft, IconLock } from "../icons";
import styles from "./Checkout.module.css";

// Nav bar for both the empty-cart and populated states of /checkout — ported
// from checkout.html's .co-nav (back-to-shop, brand mark, "Secure checkout"
// lock badge).
export function CheckoutNav() {
  return (
    <nav className={styles.nav}>
      <a className={styles.back} href="/">
        <IconArrowLeft size={18} />
        Back to shop
      </a>
      <a className={styles.brand} href="/" aria-label="Yese Creations home">
        <img src="/assets/yese-logo-cutout.png" alt="" />
        <span>
          <span className={styles.brandName}>Yese</span> <span className={styles.brandTag}>creations</span>
        </span>
      </a>
      <span className={styles.lock}>
        <IconLock />
        Secure checkout
      </span>
    </nav>
  );
}
