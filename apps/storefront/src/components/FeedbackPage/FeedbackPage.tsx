import { useMemo, useState } from "react";
import { CATEGORIES } from "@yese/product-data";
import type { Category } from "@yese/product-data";
import type { FeedbackEntry } from "~/lib/cms";
import { useCart } from "~/hooks/useCart";
import { useReveal } from "~/hooks/useReveal";
import { FeedbackCard } from "~/components/Reviews/FeedbackCard";
import { IconArrowLeft, IconBag } from "~/components/icons";
// Reuses the PDP's page-chrome classes (nav/back/brand/cart/crumb/foot) —
// same standalone-page layout, not product-specific, so no need to fork a
// second copy of that CSS.
import pdpStyles from "~/components/Pdp/Pdp.module.css";
import styles from "./FeedbackPage.module.css";

export interface FeedbackPageProps {
  feedback: FeedbackEntry[];
}

const STAR_FILTERS = [0, 5, 4, 3] as const;
type SortOrder = "recent" | "highest" | "lowest";

// The standalone, real-route twin of the homepage's featured Reviews strip
// (same design conversation as /about: keep the homepage's curated 2-3
// highlights, but give the full list — which can run to dozens of entries —
// its own indexable page rather than cramming it into the scroll or an
// overlay). Ported from the reviews.html/reviews.js design handoff: category
// chips + star-rating filter + sort, a masonry grid (CSS columns, not CSS
// grid, so cards of varying quote length pack tightly), and a summary stat
// row. Default filter state (All / All ratings / recent) renders the full
// unfiltered list, so the initial SSR HTML still contains every review —
// filtering is a client-side refinement on top of that, same pattern as
// Products.tsx's category chips.
export function FeedbackPage({ feedback }: FeedbackPageProps) {
  useReveal();
  const { cartCount, openDrawer } = useCart();
  const [cat, setCat] = useState<"All" | Category>("All");
  const [minStars, setMinStars] = useState<0 | 3 | 4 | 5>(0);
  const [sort, setSort] = useState<SortOrder>("recent");

  const avgRating =
    feedback.length > 0
      ? (feedback.reduce((sum, r) => sum + r.rating, 0) / feedback.length).toFixed(1)
      : "–";

  const filtered = useMemo(() => {
    const list = feedback.filter((r) => {
      if (cat !== "All" && r.cat !== cat) return false;
      if (minStars && r.rating < minStars) return false;
      return true;
    });
    if (sort === "highest") return [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") return [...list].sort((a, b) => a.rating - b.rating);
    return list; // "recent" = original curated order
  }, [feedback, cat, minStars, sort]);

  const countLabel = `${filtered.length} ${filtered.length === 1 ? "review" : "reviews"}${
    cat !== "All" ? ` in ${cat}` : ""
  }`;

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
        <a href="/">Home</a> · <span>Kind words</span>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <span className="kicker single">Kind words</span>
          <h1 className={styles.title}>From the people I've made for.</h1>
          <p className={styles.sub}>
            {feedback.length} real reviews from customers who bought something handmade.
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>{avgRating}</strong>
              <span>Average rating</span>
            </div>
            <div className={styles.stat}>
              <strong>{feedback.length}</strong>
              <span>Verified reviews</span>
            </div>
            <div className={styles.stat}>
              <strong className={styles.statStars}>★★★★★</strong>
              <span>Verified purchases</span>
            </div>
          </div>
        </div>

        <div className={styles.filterbar}>
          <div className={styles.chips}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`chip-btn${cat === c ? " active" : ""}`}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className={styles.filterbarRight}>
            <div className={styles.chips}>
              {STAR_FILTERS.map((s) => (
                <button
                  key={s}
                  className={`chip-btn${minStars === s ? " active" : ""}`}
                  onClick={() => setMinStars(s)}
                >
                  {s === 0 ? "All ratings" : `${s}★ & up`}
                </button>
              ))}
            </div>
            <label className={styles.sortwrap}>
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOrder)}>
                <option value="recent">Most recent</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
            </label>
          </div>
        </div>

        <div className={styles.count}>{countLabel}</div>

        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((entry) => (
              <FeedbackCard entry={entry} key={entry.id} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>No reviews match these filters — try widening your search.</div>
        )}
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
