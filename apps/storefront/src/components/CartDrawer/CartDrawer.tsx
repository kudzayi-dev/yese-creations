import { Link, useLocation } from "@tanstack/react-router";
import { PHGradient } from "@yese/ui";
import { PALETTES } from "@yese/product-data";
import { useCart } from "~/hooks/useCart";
import { formatGBP } from "~/lib/format";
import { scrollToSection } from "~/lib/scrollToSection";
import { trackCartRemoveItem, trackCheckoutStart } from "~/lib/analytics";
import { IconBag, IconClose } from "../icons";
import styles from "./CartDrawer.module.css";

// Ported from CartDrawer in app.jsx. Backdrop (.drawer-bg equivalent) closes
// on click; qty steppers inc/dec (min 1); remove drops the line entirely;
// subtotal recomputed from cart; empty state offers a way back to the grid.
export function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, incQty, decQty, removeItem } = useCart();
  const isHome = useLocation({ select: (l) => l.pathname === "/" });
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  return (
    <>
      <div
        className={`${styles.drawerBg} ${drawerOpen ? styles.open : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside className={`${styles.drawer} ${drawerOpen ? styles.open : ""}`} aria-hidden={!drawerOpen}>
        <div className={styles.head}>
          <h3>Your basket</h3>
          <button className="icon-btn" onClick={closeDrawer} aria-label="Close basket">
            <IconClose />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <IconBag size={28} />
            </div>
            <strong className={styles.emptyTitle}>Your basket is empty</strong>
            <p>Start adding a little handmade magic.</p>
            {/* CartDrawer is mounted globally (__root.tsx), so unlike
                WishlistDrawer (homepage-only) it can be open on any route.
                On the homepage, #shop is right there — close + scroll in
                place. Anywhere else there's nothing to scrollIntoView, so
                fall through to the real href="/" navigation (the homepage's
                useScrollToShopFromReferrer picks up the checkout/
                confirmation/PDP cases automatically on arrival). */}
            <a
              href="/"
              className="btn btn-ghost"
              onClick={(e) => {
                closeDrawer();
                if (isHome) scrollToSection(e, "shop");
              }}
            >
              Browse the collection
            </a>
          </div>
        ) : (
          <>
            <div className={styles.body}>
              {cart.map((item) => (
                <div className={styles.item} key={item.id}>
                  <div className={styles.thumb}>
                    {item.img ? (
                      <img className="prod-photo" src={item.img} alt={item.name} />
                    ) : (
                      <PHGradient palette={PALETTES[item.palette]!} motif={item.motif} />
                    )}
                  </div>

                  <div>
                    <h5 className={styles.itemName}>{item.name}</h5>
                    <div className={styles.itemPrice}>{formatGBP(item.price)}</div>
                    <div className={styles.qty}>
                      <button
                        onClick={() => decQty(item.id)}
                        disabled={item.qty <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => incQty(item.id)} aria-label="Increase quantity">
                        +
                      </button>
                      <button
                        className={styles.remove}
                        onClick={() => {
                          trackCartRemoveItem(item.name);
                          removeItem(item.id);
                        }}
                      >
                        remove
                      </button>
                    </div>
                  </div>
                  <div className={styles.linePrice}>{formatGBP(item.price * item.qty)}</div>
                </div>
              ))}
            </div>

            <div className={styles.foot}>
              <div className={styles.total}>
                <span>Subtotal</span>
                <strong>{formatGBP(total)}</strong>
              </div>
              <Link
                to="/checkout"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => {
                  trackCheckoutStart(cart.reduce((s, c) => s + c.qty, 0), total);
                  closeDrawer();
                }}
              >
                Checkout
              </Link>
              <div className={styles.reassure}>Free UK shipping over £80 · Wrapped &amp; posted by me ✦</div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
