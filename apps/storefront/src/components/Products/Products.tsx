import { useMemo, useRef, useState } from "react";
import type { StorefrontProduct, StorefrontCategory } from "@yese/product-data";
import { useCart } from "~/hooks/useCart";
import {
  trackCategoryFilter,
  trackProductCardClick,
  trackProductCardAddToCart,
  trackWishlistToggle,
} from "~/lib/analytics";
import { ProductCard } from "../ProductCard";
import { ProductOverlay } from "../ProductOverlay";

export interface ProductsProps {
  products: StorefrontProduct[];
  /** CMS-editable taxonomy (fetched via getCategories()) — drives the filter chips. */
  categories: StorefrontCategory[];
  /** From the CMS's productGrid block (Pages collection). Falls back to the default copy if empty. */
  kicker?: string;
  heading?: string;
}

// Ported from Products in app.jsx. Category filter, the add-flash timer, and
// the overlay's selected-product state stay local UI state (per-page,
// ephemeral). Cart/wishlist are shared state from CartProvider (hooks/useCart)
// so they persist and stay in sync with the Nav badge and the PDP routes.
export function Products({ products, categories, kicker, heading }: ProductsProps) {
  const [cat, setCat] = useState<string>("All");
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
    trackProductCardAddToCart(p.slug, "grid");
    setLastAdded(p.id);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setLastAdded(null), 1500);
  };

  const handleOpen = (p: StorefrontProduct) => {
    trackProductCardClick(p.slug, "grid");
    setSelected(p);
  };

  const handleFav = (id: number) => {
    const product = products.find((p) => p.id === id);
    const wasFaved = isFav(id);
    toggleFav(id);
    if (product) trackWishlistToggle(product.slug, !wasFaved, "grid");
  };

  const handleCategoryClick = (c: string) => {
    trackCategoryFilter(c, "shop");
    setCat(c);
  };

  return (
    <section className="section" id="shop">
      <div className="section-title">
        <div>
          <span className="kicker single">{kicker || "Shop the collection"}</span>
          <h2 className="h-display">{heading || "A little of what I'm making right now."}</h2>
        </div>
        <div className="filters">
          {["All", ...categories.map((c) => c.name)].map((c) => (
            <button
              key={c}
              className={`chip-btn${cat === c ? " active" : ""}`}
              onClick={() => handleCategoryClick(c)}
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
            onFav={handleFav}
            onOpen={handleOpen}
          />
        ))}
      </div>
      <ProductOverlay product={selected} onClose={() => setSelected(null)} allProducts={products} />
    </section>
  );
}
