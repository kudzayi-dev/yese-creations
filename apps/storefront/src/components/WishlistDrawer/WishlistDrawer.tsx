import { useEffect } from "react";
import { PHGradient } from "@yese/ui";
import { PALETTES } from "@yese/product-data";
import type { StorefrontProduct } from "@yese/product-data";
import { useCart } from "~/hooks/useCart";
import { formatGBP } from "~/lib/format";
import { IconBag, IconClose, IconHeartOutline } from "../icons";
import styles from "./WishlistDrawer.module.css";

export interface WishlistDrawerProps {
  /** Full product catalog (already loaded by the page's route loader) —
   * needed because favorites are stored as bare ids (see useCart's favIds
   * doc comment), so this cross-references ids against real product data
   * to render name/price/photo. */
  products: StorefrontProduct[];
}

// Companion to CartDrawer, added because the nav wishlist icon's
// badge count (a gap-fill for the original static prototype nav) needed
// somewhere to actually take the person when clicked — a badge with no
// destination is half a feature. Same slide-in-drawer visual pattern as
// CartDrawer; unlike the cart, there's no qty/checkout, just remove-from-
// wishlist and add-to-basket per item.
export function WishlistDrawer({ products }: WishlistDrawerProps) {
  const { favIds, favDrawerOpen, closeFavDrawer, toggleFav, addToCart, pruneFavs } = useCart();
  const favorited = products.filter((p) => favIds.includes(p.id));

  // Self-heals a stale favIds entry that no longer matches any real product
  // (e.g. a CMS reseed reassigned ids) — otherwise the Nav badge shows a
  // phantom count forever since it's just favs.size, not cross-referenced
  // against the product list the way this drawer's own `favorited` is.
  // Depends on favIds too (not just products): on first mount favs hasn't
  // hydrated from localStorage yet (CartProvider's own hydration effect
  // fires after this one, since child effects run before parent effects),
  // so pruning against an empty favIds would silently miss anything to
  // prune — this re-runs once hydration actually populates favIds.
  useEffect(() => {
    pruneFavs(products.map((p) => p.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, favIds]);

  return (
    <>
      <div
        className={`${styles.drawerBg} ${favDrawerOpen ? styles.open : ""}`}
        onClick={closeFavDrawer}
        aria-hidden="true"
      />
      <aside
        className={`${styles.drawer} ${favDrawerOpen ? styles.open : ""}`}
        aria-hidden={!favDrawerOpen}
      >
        <div className={styles.head}>
          <h3>Your wishlist</h3>
          <button className="icon-btn" onClick={closeFavDrawer} aria-label="Close wishlist">
            <IconClose />
          </button>
        </div>

        {favorited.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <IconHeartOutline size={28} />
            </div>
            <strong className={styles.emptyTitle}>Nothing saved yet</strong>
            <p>Tap the heart on anything you love to keep it here.</p>
            <button
              className="btn btn-ghost"
              onClick={() => {
                closeFavDrawer();
                // WishlistDrawer only ever mounts on the homepage route ("/")
                // — see routes/index.tsx — so #shop is always in the DOM here,
                // unlike SearchOverlay which is global. No navigation needed,
                // just close the drawer and scroll to it (this button had no
                // destination at all before — closeFavDrawer() alone just
                // closed the drawer over whatever was already showing).
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Browse the collection
            </button>
          </div>
        ) : (
          <div className={styles.body}>
            {favorited.map((p) => (
              <div className={styles.item} key={p.id}>
                <div className={styles.thumb}>
                  {p.photos[0] ? (
                    <img className="prod-photo" src={p.photos[0].sizes.card.url} alt={p.name} />
                  ) : (
                    <PHGradient palette={PALETTES[p.palette]!} motif={p.motif} />
                  )}
                </div>

                <div>
                  <h5 className={styles.itemName}>{p.name}</h5>
                  <div className={styles.itemPrice}>{formatGBP(p.price)}</div>
                  <div className={styles.actions}>
                    <button className={styles.addBtn} onClick={() => addToCart(p)}>
                      <IconBag size={13} /> Add
                    </button>
                    <button className={styles.remove} onClick={() => toggleFav(p.id)}>
                      remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}
