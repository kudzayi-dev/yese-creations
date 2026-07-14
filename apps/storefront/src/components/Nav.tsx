import { IconBag, IconHeartOutline, IconSearch } from "./icons";
import styles from "./Nav.module.css";

export interface NavProps {
  /** From useCart() (Stage 14) — cartCount, opens the CartDrawer on click. */
  cartCount?: number;
  onCartClick?: () => void;
}

export function Nav({ cartCount = 0, onCartClick }: NavProps) {
  return (
    <nav className={styles.nav}>
      <div className={styles.navLogo}>
        <img src="/assets/yese-logo-cutout.png" alt="Yese Creations" />
        <div>
          <div className={styles.name}>Yese</div>
          <div className={styles.tagline}>creations</div>
        </div>
      </div>
      <div className={styles.navLinks}>
        <a href="#shop">Shop</a>
        <a href="#gallery">Gallery</a>
        <a href="#story">Our Story</a>
        <a href="#process">Process</a>
        <a href="#bespoke">Bespoke</a>
      </div>
      <div className={styles.navRight}>
        <button className="icon-btn" aria-label="Search">
          <IconSearch />
        </button>
        <button className="icon-btn" aria-label="Wishlist">
          <IconHeartOutline />
        </button>
        <button className="icon-btn" aria-label="Cart" onClick={onCartClick}>
          <IconBag />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>
    </nav>
  );
}
