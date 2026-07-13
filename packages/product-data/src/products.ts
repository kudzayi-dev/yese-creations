import { PRODUCT_CATEGORIES } from "./types";
import type { Product, Category } from "./types";

// Single source of truth, ported from products-data.js (PRODUCTS).
// Image paths are relative to the storefront's /assets served directory.
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Luna Heart Bouquet", cat: "Bouquets", price: 42, palette: 0, motif: "heart", tag: "bestseller", meta: "Crochet · 12 stems" },
  { id: "p2", name: "Cosy Cloud Cushion", cat: "Home", price: 58, palette: 1, motif: "cushion", tag: "new", meta: "Hand-stitched · 40cm" },
  { id: "p3", name: "Sunshine Tote", cat: "Bags", price: 36, palette: 5, motif: "bag", tag: "limited", meta: "Macramé · 100% cotton" },
  { id: "p4", name: "Marigold Bloom Brooch", cat: "Accessories", price: 18, palette: 2, motif: "flower", tag: "", meta: "Pin-on · 6cm" },
  { id: "p5", name: "Goddess Amigurumi Doll", cat: "Plushies", price: 38, palette: 3, motif: "bunny", tag: "popular", meta: "Amigurumi · 22cm", img: "assets/product-crochet-doll.png", imgs: ["assets/product-crochet-doll.png"] },
  { id: "p6", name: "Lagoon Coaster Set", cat: "Home", price: 24, palette: 4, motif: "loop", tag: "", meta: "Set of 4 · 10cm" },
  { id: "p7", name: "Velvet Plum Tassel", cat: "Accessories", price: 14, palette: 7, motif: "tassel", tag: "", meta: "Keychain · 12cm" },
  { id: "p8", name: "Sundial Yarn Wreath", cat: "Home", price: 64, palette: 6, motif: "ball", tag: "new", meta: "Wall hanging · 35cm" },
  { id: "p9", name: "Coral Tide — Giclée Print", cat: "Prints", price: 38, palette: 0, motif: "abstract", tag: "", meta: "A3 · signed edition of 50" },
  { id: "p10", name: "Cherry Blossom Branch", cat: "Prints", price: 48, palette: 0, motif: "canvas", tag: "new", meta: "Acrylic on canvas · 20×25cm", img: "assets/product-blossom-canvas.png", imgs: ["assets/product-blossom-canvas.png"] },
];

// Homepage filter chips: "All" plus the six real categories. Derived from
// PRODUCT_CATEGORIES so a new category shows up here automatically.
export const CATEGORIES: ("All" | Category)[] = ["All", ...PRODUCT_CATEGORIES];
