import { useCart } from "~/hooks/useCart";
import { useReveal } from "~/hooks/useReveal";
import { AboutContent } from "~/components/Story/AboutContent";
import { IconArrowLeft, IconBag } from "~/components/icons";
// Reuses the PDP's page-chrome classes (nav/back/brand/cart/crumb/foot) —
// same standalone-page layout as /feedback, not product-specific.
import pdpStyles from "~/components/Pdp/Pdp.module.css";
import styles from "./AboutPage.module.css";

// The standalone, real-route twin of the homepage's inline Story section and
// the AboutOverlay — same AboutContent, three views. This is the one that's
// real, crawlable HTML: shareable link, search-indexable, works with JS off.
export function AboutPage() {
  useReveal();
  const { cartCount, openDrawer } = useCart();

  return (
    <div className={pdpStyles.body}>
      <nav className={pdpStyles.nav}>
        <a className={pdpStyles.back} href="/">
          <IconArrowLeft size={18} />
          Back to shop
        </a>
        <a className={pdpStyles.brand} href="/" aria-label="Yese Creations home">
          <img src="/assets/yese-logo-cutout.png" alt="" />
          <span>
            <span className={pdpStyles.brandName}>Yese</span>{" "}
            <span className={pdpStyles.brandTag}>creations</span>
          </span>
        </a>
        <button className={pdpStyles.cart} onClick={openDrawer}>
          <IconBag size={18} />
          Basket {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </nav>

      <nav className={pdpStyles.crumb} aria-label="Breadcrumb">
        <a href="/">Home</a> · <span>My Story</span>
      </nav>

      <main className={styles.main}>
        <AboutContent />
      </main>

      <footer className={pdpStyles.foot}>
        <div>© 2026 Yese Creations · run, made &amp; loved by Yese in London</div>
        <div>
          <a href="/">Back to the shop →</a>
        </div>
      </footer>
    </div>
  );
}
