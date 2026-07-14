import { useMemo, useRef, useState } from "react";
import { CATEGORIES } from "@yese/product-data";
import type { Category, StorefrontProduct } from "@yese/product-data";
import { useCart } from "~/hooks/useCart";
import { ProductCard } from "./ProductCard";
import { ProductOverlay } from "./ProductOverlay";

export interface ProductsProps {
  products: StorefrontProduct[];
}

// Ported from Products in app.jsx. Category filter, the add-flash timer, and
// the overlay's selected-product state stay local UI state (per-page,
// ephemeral). Cart/wishlist are shared state from Stage 14's CartProvider so
// they persist and stay in sync with the Nav badge and (eventually) the PDP
// routes.
export function Products({ products }: ProductsProps) {
  const [cat, setCat] = useState<"All" | Category>("All");
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const [selected, setSelected] = useState<StorefrontProduct | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { addToCart, isFav, toggleFav } = useCart();

  const filtered = useMemo(
    () => (cat === "All" ? products : products.filter((p) => p.cat === cat)),
    [cat, products],
  );

  const handleAdd = (p: StorefrontProduct) => {
    addToCart(p);
    setLastAdded(p.id);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setLastAdded(null), 1500);
  };

  const handleOpen = (p: StorefrontProduct) => {
    setSelected(p);
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
            faved={isFav(p.id)}
            addedFlash={lastAdded === p.id}
            onAdd={handleAdd}
            onFav={toggleFav}
            onOpen={handleOpen}
          />
        ))}
      </div>
      <ProductOverlay product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
