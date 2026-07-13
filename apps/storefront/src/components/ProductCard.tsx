import { PHGradient } from "@yese/ui";
import { PALETTES } from "@yese/product-data";
import type { StorefrontProduct } from "@yese/product-data";
import { IconBag, IconCheck, IconHeart, IconHeartOutline } from "./icons";
import styles from "./ProductCard.module.css";

export interface ProductCardProps {
  product: StorefrontProduct;
  faved: boolean;
  addedFlash: boolean;
  onAdd: (p: StorefrontProduct) => void;
  onFav: (id: number) => void;
  onOpen: (p: StorefrontProduct) => void;
}

// Ported from ProductCard in app.jsx. The key interaction to preserve: a
// plain click on the image/title intercepts navigation and opens the fast
// in-app overlay (onOpen — real overlay lands in Stage 15); a modifier/middle
// click or a crawler follows the real `href` to the PDP (Stage 16). The heart
// and Add buttons stopPropagation so they never trigger onOpen/navigation.
export function ProductCard({ product: p, faved, addedFlash, onAdd, onFav, onOpen }: ProductCardProps) {
  const href = `/product/${p.slug}`;
  const cardPhoto = p.photos[0]?.sizes.card.url;

  const intercept = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
    e.preventDefault();
    onOpen(p);
  };

  return (
    <article className={`${styles.card} reveal`}>
      <a className={styles.imgWrap} href={href} onClick={intercept} aria-label={p.name}>
        {p.tag && <span className="tag">{p.tag}</span>}
        <button
          className={`${styles.fav} ${faved ? styles.favOn : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFav(p.id);
          }}
          aria-label="Save"
        >
          {faved ? <IconHeart size={16} /> : <IconHeartOutline size={16} />}
        </button>
        {cardPhoto ? (
          <img className={`prod-photo ${styles.prodPhoto}`} src={cardPhoto} alt={p.name} loading="lazy" />
        ) : (
          <PHGradient palette={PALETTES[p.palette]!} motif={p.motif} />
        )}
        <span className={styles.viewHint}>View details</span>
      </a>
      <div className={styles.body}>
        <h3 className={styles.name}>
          <a className={styles.titleLink} href={href} onClick={intercept}>
            {p.name}
          </a>
        </h3>
        <div className={styles.meta}>{p.meta}</div>
        <div className={styles.row}>
          <div className={styles.price}>£{p.price}</div>
          <button
            className={`${styles.add} ${addedFlash ? styles.added : ""}`}
            onClick={() => onAdd(p)}
          >
            {addedFlash ? (
              <>
                <IconCheck size={13} /> Added
              </>
            ) : (
              <>
                <IconBag size={14} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
