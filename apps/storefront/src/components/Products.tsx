import { useMemo, useRef, useState } from "react";
import { CATEGORIES } from "@yese/product-data";
import type { Category, StorefrontProduct } from "@yese/product-data";
import { ProductCard } from "./ProductCard";

export interface ProductsProps {
  products: StorefrontProduct[];
}

// Ported from Products in app.jsx. Category filter, fav toggle, and the
// add-flash timer are all local UI state for this stage — real cart/wishlist
// persistence (localStorage, Nav badge) lands in Stage 14; the fast overlay
// that onOpen should show lands in Stage 15.
export function Products({ products }: ProductsProps) {
  const [cat, setCat] = useState<"All" | Category>("All");
  const [favs, setFavs] = useState<Set<number>>(new Set());
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const filtered = useMemo(
    () => (cat === "All" ? products : products.filter((p) => p.cat === cat)),
    [cat, products],
  );

  const handleAdd = (p: StorefrontProduct) => {
    setLastAdded(p.id);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setLastAdded(null), 1500);
  };

  const handleFav = (id: number) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpen = (_p: StorefrontProduct) => {
    // Overlay lands in Stage 15. Intercepting the click (rather than letting
    // it navigate) is still correct now: the PDP route doesn't exist until
    // Stage 16 either, so a plain click doing nothing beats a 404.
  };

  return (
    <section className="section" id="shop">
      <div className="section-title">
        <div>
          <span className="kicker single">Shop the collection</span>
          <h2 className="h-display">A little of what I'm making right now.</h2>
        </div>
        <div className="filters">
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
      </div>
      <div className="product-grid">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            faved={favs.has(p.id)}
            addedFlash={lastAdded === p.id}
            onAdd={handleAdd}
            onFav={handleFav}
            onOpen={handleOpen}
          />
        ))}
      </div>
    </section>
  );
}
