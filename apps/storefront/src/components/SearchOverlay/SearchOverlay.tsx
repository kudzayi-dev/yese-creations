import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { PHGradient } from "@yese/ui";
import { PALETTES, detailForStorefront } from "@yese/product-data";
import type { StorefrontProduct } from "@yese/product-data";
import { getAllProducts, getCategories } from "~/lib/products";
import type { StorefrontCategory } from "@yese/product-data";
import { formatGBP } from "~/lib/format";
import { useSearchOverlay } from "~/hooks/useSearchOverlay";
import { scrollToSection } from "~/lib/scrollToSection";
import { IconClose, IconSearch } from "../icons";
// Reuses ProductOverlay's full-screen-takeover mechanics (fixed position,
// open/opacity transition, scroll container) — same pattern as AboutOverlay,
// not product-specific, so there's no third copy of this chrome. The topbar
// itself is custom (search field instead of back/brand/fullpage), so that
// part lives in SearchOverlay.module.css.
import overlayStyles from "~/components/ProductOverlay/ProductOverlay.module.css";
import styles from "./SearchOverlay.module.css";

const DEBOUNCE_MS = 220;

// The fast, full-screen search overlay opened from the Nav's search icon.
// No design handoff existed for this feature until
// design_handoff_yese_search/README.md; behavior decisions below come from
// that doc's "Behavior Decisions" section rather than a supplied mockup.
//
// Search runs client-side over the full CMS product list (fetched once, on
// first open, via the same getAllProducts() RPC the homepage loader uses —
// see lib/products.ts) rather than a hardcoded array like the prototype.
// Matching is a naive substring check over name/category/meta/story — a
// placeholder for a real search index per the handoff's own "Not Yet
// Implemented" note; fine for a catalog this size.
export function SearchOverlay() {
  const { isOpen, closeSearch } = useSearchOverlay();
  const isHome = useLocation({ select: (l) => l.pathname === "/" });
  const [allProducts, setAllProducts] = useState<StorefrontProduct[] | null>(null);
  const [categories, setCategories] = useState<StorefrontCategory[] | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [debouncing, setDebouncing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch the product list and category list once, the first time the
  // overlay is opened — not on every route load — since nothing else on the
  // page needs them.
  useEffect(() => {
    if (isOpen && allProducts === null) {
      getAllProducts().then(setAllProducts);
    }
    if (isOpen && categories === null) {
      getCategories().then(setCategories);
    }
  }, [isOpen, allProducts, categories]);

  // Debounce-as-you-type. The skeleton state below fills the debounce
  // window so typing never flashes a blank pause (per the handoff's
  // "Loading state" decision) — today that's just this fixed timer, but the
  // same debouncing/loading split is what a real async search call would
  // slot into later.
  useEffect(() => {
    if (query === "") {
      setDebouncedQuery("");
      setDebouncing(false);
      return;
    }
    setDebouncing(true);
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setDebouncing(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setDebouncedQuery("");
      // Auto-focus, same as the design handoff's behavior decisions.
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [closeSearch, isOpen]);

  const results = useMemo(() => {
    if (!allProducts || !debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return allProducts.filter((p) => {
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.cat.toLowerCase().includes(q)) return true;
      if (p.meta.toLowerCase().includes(q)) return true;
      return detailForStorefront(p).story.toLowerCase().includes(q);
    });
  }, [allProducts, debouncedQuery]);

  return (
    <div className={`${overlayStyles.overlay} ${isOpen ? overlayStyles.open : ""}`} aria-hidden={!isOpen}>
      <div className={styles.topbar}>
        <div className={styles.field}>
          <IconSearch size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a bouquet, print, plushie…"
            aria-label="Search products"
          />
          {query && (
            <button className={styles.clear} onClick={() => setQuery("")} aria-label="Clear search">
              <IconClose size={14} />
            </button>
          )}
        </div>
        <button className={`icon-btn ${styles.close}`} onClick={closeSearch} aria-label="Close search">
          <IconClose />
        </button>
      </div>

      <div className={overlayStyles.scroll}>
        <div className={styles.body}>
          {!query && (
            <>
              <span className={styles.label}>Popular categories</span>
              <div className={styles.chips}>
                {(categories ?? []).slice(0, 4).map((c) => (
                  <button key={c.id} className="chip-btn" onClick={() => setQuery(c.name)}>
                    {c.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {query && debouncing && (
            <div className={styles.skeletonList}>
              {[0, 1, 2].map((i) => (
                <div className={styles.skeletonRow} key={i}>
                  <div className={styles.skeletonThumb} />
                  <div className={styles.skeletonLines}>
                    <div className={styles.skeletonLine} style={{ width: "60%" }} />
                    <div className={styles.skeletonLine} style={{ width: "35%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {query && !debouncing && debouncedQuery && results.length === 0 && (
            <div className={styles.empty}>
              <p>No matches for &ldquo;{debouncedQuery}&rdquo;</p>
              {/* Search is a global overlay (mounted at root, can be open on
                  any route). If we're already on the homepage, the #shop
                  section is right there under the overlay — close and
                  scroll to it instead of a real navigation. From any other
                  route there's no #shop in the DOM to scroll to, so a real
                  href="/#shop" navigation is the only option there. */}
              <a
                className="btn btn-ghost"
                href="/#shop"
                onClick={(e) => {
                  closeSearch();
                  if (isHome) scrollToSection(e, "shop");
                }}
              >
                Browse the shop
              </a>
            </div>
          )}

          {query && !debouncing && debouncedQuery && results.length > 0 && (
            <>
              <span className={styles.count}>
                {results.length} {results.length === 1 ? "result" : "results"}
              </span>
              <div className={styles.results}>
                {results.map((p) => (
                  <a
                    key={p.id}
                    className={styles.row}
                    href={`/product/${p.slug}`}
                    onClick={closeSearch}
                  >
                    <div className={styles.thumb}>
                      {p.photos[0] ? (
                        <img src={p.photos[0].sizes.thumb.url} alt={p.name} loading="lazy" />
                      ) : (
                        <PHGradient palette={PALETTES[p.palette]!} motif={p.motif} />
                      )}
                    </div>
                    <div className={styles.info}>
                      <div className={styles.name}>{p.name}</div>
                      <div className={styles.meta}>
                        {p.cat} · {p.meta}
                      </div>
                    </div>
                    <div className={styles.price}>{formatGBP(p.price)}</div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
