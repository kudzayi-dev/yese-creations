/**
 * cart-storage.ts — pure localStorage read/write for cart + wishlist.
 *
 * Keys and shapes MUST stay byte-compatible with the prototype (app.jsx and
 * pdp.js), since the homepage and the PDP routes read/write the same two
 * keys so they never disagree:
 *   - yese_cart: CartLine[]
 *   - yese_favs: number[] (product ids)
 *
 * Every function guards on `typeof window === "undefined"` so this is safe to
 * call from anywhere without crashing during SSR.
 */
import type { Motif } from "@yese/product-data";

const CART_KEY = "yese_cart";
const FAVS_KEY = "yese_favs";

export interface CartLine {
  id: number;
  name: string;
  price: number;
  palette: number;
  motif: Motif;
  img?: string;
  qty: number;
}

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(cart: CartLine[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // localStorage can throw (private mode, quota) — losing persistence isn't fatal.
  }
}

export function readFavs(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVS_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function writeFavs(ids: number[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FAVS_KEY, JSON.stringify(ids));
  } catch {
    // same as writeCart — non-fatal.
  }
}
