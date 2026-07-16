import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { StorefrontProduct } from "@yese/product-data";
import { readCart, writeCart, readFavs, writeFavs, type CartLine } from "~/lib/cart-storage";

export type { CartLine };

interface CartContextValue {
  cart: CartLine[];
  cartCount: number;
  addToCart: (p: StorefrontProduct, qty?: number) => void;
  incQty: (id: number) => void;
  decQty: (id: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  isFav: (id: number) => boolean;
  toggleFav: (id: number) => void;
  /**
   * Drops any favorited ids that don't match a product in `validIds`. Guards
   * against a stale localStorage entry outliving the product it pointed at
   * (e.g. a CMS reseed that reassigns ids) — without this, the Nav badge can
   * show a phantom count that never matches what the WishlistDrawer actually
   * lists, since the drawer cross-references favIds against the live product
   * list but the badge count doesn't. Called once the real product list is
   * known (see WishlistDrawer).
   */
  pruneFavs: (validIds: number[]) => void;
  favCount: number;
  /** Favorited product ids, for pages that need to filter a product list
   * down to just the wishlist (e.g. WishlistDrawer). Favs are stored as
   * bare ids (byte-compatible with the prototype's `yese_favs` localStorage
   * key), not denormalized product data like CartLine — so any UI showing
   * favorited products needs its own product list to cross-reference. */
  favIds: number[];
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  favDrawerOpen: boolean;
  openFavDrawer: () => void;
  closeFavDrawer: () => void;
  toast: string;
}

const CartContext = createContext<CartContextValue | null>(null);

// Ported from the cart/wishlist state + CartDrawer/Toast wiring in App() in
// app.jsx. Initial state is a stable empty cart/favs (matching what SSR
// renders) — the real values are hydrated from localStorage in a mount
// effect, so the server and first client render always agree and there's no
// hydration mismatch. A `pageshow` listener re-reads storage so returning via
// the back button (e.g. from a PDP) picks up anything added there.
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favs, setFavs] = useState<Set<number>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favDrawerOpen, setFavDrawerOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setCart(readCart());
    setFavs(new Set(readFavs()));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    writeCart(cart);
  }, [cart, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    writeFavs([...favs]);
  }, [favs, isHydrated]);

  useEffect(() => {
    const onShow = () => {
      setCart(readCart());
      setFavs(new Set(readFavs()));
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  };

  const addToCart = (p: StorefrontProduct, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.id === p.id);
      if (existing) {
        return prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + qty } : x));
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          price: p.price,
          palette: p.palette,
          motif: p.motif,
          img: p.photos[0]?.sizes.card.url,
          qty,
        },
      ];
    });
    showToast(`${p.name} added to basket`);
  };

  const incQty = (id: number) =>
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  const decQty = (id: number) =>
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)),
    );
  const removeItem = (id: number) => setCart((prev) => prev.filter((x) => x.id !== id));
  // Called by the confirmation page once Stripe's redirect_status
  // confirms a successful order, so the basket badge resets for the next
  // visit (same as the prototype's localStorage.removeItem(CART_KEY)).
  const clearCart = () => setCart([]);

  const toggleFav = (id: number) =>
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const isFav = (id: number) => favs.has(id);

  const pruneFavs = (validIds: number[]) => {
    const valid = new Set(validIds);
    setFavs((prev) => {
      const next = new Set([...prev].filter((id) => valid.has(id)));
      return next.size === prev.size ? prev : next;
    });
  };

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const favCount = favs.size;
  const favIds = [...favs];

  const value: CartContextValue = {
    cart,
    cartCount,
    addToCart,
    incQty,
    decQty,
    removeItem,
    clearCart,
    isFav,
    toggleFav,
    pruneFavs,
    favCount,
    favIds,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    favDrawerOpen,
    openFavDrawer: () => setFavDrawerOpen(true),
    closeFavDrawer: () => setFavDrawerOpen(false),
    toast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
