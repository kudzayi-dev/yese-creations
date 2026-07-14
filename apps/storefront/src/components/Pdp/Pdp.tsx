import { PHGradient } from "@yese/ui";
import { PALETTES, detailForStorefront, galleryForStorefront } from "@yese/product-data";
import type { StorefrontProduct } from "@yese/product-data";
import { useCart } from "~/hooks/useCart";
import { formatGBP } from "~/lib/format";
import { IconArrowLeft, IconBag, IconCheck, IconHeartOutline } from "../icons";
import styles from "./Pdp.module.css";

export interface PdpProps {
  product: StorefrontProduct;
  related: StorefrontProduct[];
}

// Stage 16 — the standalone, server-rendered twin of ProductOverlay (Stage 15).
// Reads detailForStorefront()/galleryForStorefront() off the SAME product
// object the overlay uses, so copy can never drift between the two views
// (load-bearing constraint #2). Content here renders in the initial HTML —
// no client state yet. Gallery switching, the qty stepper, add-to-basket, and
// the wishlist heart are all static in this stage; Stage 19 wires them up.
// The shared Toast (mounted once in __root.tsx, Stage 14) covers this page
// too — no separate pdp-toast markup needed here.
export function Pdp({ product, related }: PdpProps) {
  const { cartCount, openDrawer } = useCart();
  const detail = detailForStorefront(product);
  const gallery = galleryForStorefront(product);
  const activeView = gallery[0]!;

  return (
    <div className={styles.body}>
      <nav className={styles.nav}>
        <a className={styles.back} href="/#shop">
          <IconArrowLeft size={18} />
          Back to shop
        </a>
        <a className={styles.brand} href="/" aria-label="Yese Creations home">
          <img src="/assets/yese-logo-cutout.png" alt="" />
          <span>
            <span className={styles.brandName}>Yese</span>{" "}
            <span className={styles.brandTag}>creations</span>
          </span>
        </a>
        <button className={styles.cart} onClick={openDrawer}>
          <IconBag size={18} />
          Basket {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </nav>

      <nav className={styles.crumb} aria-label="Breadcrumb">
        <a href="/">Home</a> · <a href="/#shop">{product.cat}</a> ·{" "}
        <span>{product.name}</span>
      </nav>

      <main className={styles.main}>
        <div className={styles.gallery}>
          <div className={styles.thumbs} role="tablist" aria-label="Product photos">
            {gallery.map((g, i) => (
              <button
                key={i}
                className={`${styles.thumb} ${i === 0 ? styles.thumbActive : ""}`}
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
            <button className={styles.fav} aria-label="Save to wishlist">
              <IconHeartOutline size={18} />
            </button>
            <div className={styles.stageImg}>
              {activeView.type === "photo" ? (
                <img
                  className="prod-photo"
                  src={activeView.stageUrl}
                  alt={`${product.name} — ${activeView.label}`}
                />
              ) : (
                <PHGradient palette={PALETTES[activeView.palette]!} motif={activeView.motif} />
              )}
            </div>
            <span className={styles.viewName}>{activeView.label}</span>
          </div>
        </div>

        <div className={styles.detail}>
          <span className={styles.cat}>
            {product.cat} · {detail.madeIn}
          </span>
          <h1 className={styles.name}>{product.name}</h1>
          <div className={styles.price}>{formatGBP(product.price)}</div>
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
                <button aria-label="Decrease quantity">−</button>
                <span>1</span>
                <button aria-label="Increase quantity">+</button>
              </div>
              <button className={`btn btn-primary ${styles.add}`}>
                <IconBag size={15} /> Add to basket · {formatGBP(product.price)}
              </button>
            </div>
            <div className={styles.reassure}>
              Wrapped, signed &amp; posted by me ✦ Free UK shipping over £80 ✦ 14-day returns
            </div>
          </div>
        </div>
      </main>

      <section className={styles.related}>
        <h2>More from the studio</h2>
        <div className={styles.relatedGrid}>
          {related.map((r) => {
            const photo = r.photos[0];
            return (
              <a key={r.id} className={styles.rel} href={`/product/${r.slug}`}>
                <div className={styles.relImg}>
                  {photo ? (
                    <img className="prod-photo" src={photo.sizes.card.url} alt={r.name} />
                  ) : (
                    <PHGradient palette={PALETTES[r.palette]!} motif={r.motif} />
                  )}
                </div>
                <div className={styles.relBody}>
                  <h3>{r.name}</h3>
                  <div className={styles.relPrice}>{formatGBP(r.price)}</div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <footer className={styles.foot}>
        <div>© 2026 Yese Creations · run, made &amp; loved by Yese in London</div>
        <div>
          <a href="/">Back to the shop →</a>
        </div>
      </footer>
    </div>
  );
}
