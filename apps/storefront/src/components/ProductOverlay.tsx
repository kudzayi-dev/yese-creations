import { useEffect, useState } from "react";
import { PHGradient } from "@yese/ui";
import { PALETTES, detailForStorefront, galleryForStorefront } from "@yese/product-data";
import type { StorefrontProduct } from "@yese/product-data";
import { useCart } from "~/hooks/useCart";
import { IconArrowLeft, IconBag, IconCheck, IconClose, IconHeart, IconHeartOutline } from "./icons";
import styles from "./ProductOverlay.module.css";

export interface ProductOverlayProps {
  product: StorefrontProduct | null;
  onClose: () => void;
}

// Ported from ProductOverlay in app.jsx — the fast, full-screen in-app detail
// view opened by a plain click on a ProductCard (Stage 13). Same content as
// the PDP (Stage 16): both read detailForStorefront()/galleryForStorefront()
// off the same StorefrontProduct so copy can't drift between the two views
// (load-bearing constraint #2 from the design handoff). Esc, the Back button,
// the close (X) button, and Add-to-basket all close it — there's no separate
// backdrop element to click, since the overlay itself is a full-screen
// takeover (this matches the source app.jsx exactly; it never had one either).
export function ProductOverlay({ product, onClose }: ProductOverlayProps) {
  const { isFav, toggleFav, addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const open = !!product;

  useEffect(() => {
    if (product) {
      setQty(1);
      setActive(0);
    }
  }, [product]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  const detail = product ? detailForStorefront(product) : null;
  const gallery = product ? galleryForStorefront(product) : [];
  const view = gallery[active] || gallery[0];

  return (
    <div className={`${styles.overlay} ${open ? styles.open : ""}`} aria-hidden={!open}>
      {product && detail && view && (
        <>
          <div className={styles.topbar}>
            <button className={styles.back} onClick={onClose}>
              <IconArrowLeft />
              Back to shop
            </button>
            <div className={styles.brand}>
              <img src="/assets/yese-logo-cutout.png" alt="" />
              <span>Yese Creations</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a className={styles.fullpage} href={`/product/${product.slug}`}>
                Open full page ↗
              </a>
              <button className={`icon-btn ${styles.close}`} onClick={onClose} aria-label="Close">
                <IconClose />
              </button>
            </div>
          </div>

          <div className={styles.scroll}>
            <div className={styles.inner}>
              {/* Gallery */}
              <div className={styles.gallery}>
                <div className={styles.thumbs} role="tablist" aria-label="Product photos">
                  {gallery.map((g, i) => (
                    <button
                      key={i}
                      className={`${styles.thumb} ${i === active ? styles.thumbActive : ""}`}
                      onClick={() => setActive(i)}
                      aria-label={g.label}
                      title={g.label}
                    >
                      {g.type === "photo" ? (
                        <img className="prod-photo" src={g.thumbUrl} alt={g.label} />
                      ) : (
                        <PHGradient palette={PALETTES[g.palette]!} motif={g.motif} />
                      )}
                      <span className={styles.thumbLabel}>{g.label}</span>
                    </button>
                  ))}
                </div>

                <div className={styles.stage}>
                  {product.tag && <span className="tag">{product.tag}</span>}
                  <button
                    className={`${styles.fav} ${isFav(product.id) ? styles.favOn : ""}`}
                    onClick={() => toggleFav(product.id)}
                    aria-label="Save"
                  >
                    {isFav(product.id) ? <IconHeart size={18} /> : <IconHeartOutline size={18} />}
                  </button>
                  <div className={styles.stageImg}>
                    {view.type === "photo" ? (
                      <img
                        className="prod-photo"
                        src={view.stageUrl}
                        alt={`${product.name} — ${view.label}`}
                      />
                    ) : (
                      <PHGradient palette={PALETTES[view.palette]!} motif={view.motif} />
                    )}
                  </div>
                  <span className={styles.viewName}>{view.label}</span>
                </div>
              </div>

              {/* Detail column */}
              <div className={styles.detail}>
                <span className={styles.cat}>
                  {product.cat} · {detail.madeIn}
                </span>
                <h2 className={styles.name}>{product.name}</h2>
                <div className={styles.price}>£{product.price}</div>

                <p className={styles.story}>{detail.story}</p>

                <div className={styles.cols}>
                  <div className={styles.specs}>
                    <span className={styles.label}>The details</span>
                    <ul>
                      {detail.specs.map((s, i) => (
                        <li key={i}>
                          <span className={styles.tick}>
                            <IconCheck size={11} />
                          </span>{" "}
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.care}>
                    <span className={styles.label}>Looking after it</span>
                    <p>{detail.care}</p>
                  </div>
                </div>

                <div className={styles.buy}>
                  <div className={styles.buyRow}>
                    <div className={styles.stepper}>
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{qty}</span>
                      <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                        +
                      </button>
                    </div>
                    <button
                      className={`btn btn-primary ${styles.add}`}
                      onClick={() => {
                        addToCart(product, qty);
                        onClose();
                      }}
                    >
                      <IconBag size={15} /> Add to basket · £{product.price * qty}
                    </button>
                  </div>
                  <div className={styles.reassure}>
                    Wrapped, signed &amp; posted by me ✦ Free UK shipping over £80 ✦ 14-day returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
