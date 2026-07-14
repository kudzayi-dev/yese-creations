import type {
  Product,
  ProductDetail,
  GalleryView,
  StorefrontGalleryView,
  StorefrontProduct,
  Motif,
} from "./types";

// Per-product story/spec/care overrides, ported from products-data.js
// (PRODUCT_DETAILS). Products without an entry fall back to detailFor()'s
// generic copy built from the product's own meta.
export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  p5: {
    story:
      "She started as a doodle in the margin of my sketchbook — a little goddess with a halo of golden curls. I crochet her in soft ivory cotton, then hand-stitch every strand of her gilded hair one loop at a time. Her face is embroidered, never printed, so no two are quite the same.",
    specs: [
      "Approx. 22cm tall, sits or stands",
      "Ivory cotton body · gold metallic hair",
      "Hand-embroidered features",
      "Wire-free, child-safe stuffing",
    ],
    care: "Surface spot-clean only with a damp cloth. Keep out of direct sun so her ivory stays bright.",
    madeIn: "6–8 hours by hand",
  },
  p10: {
    story:
      "Painted over three quiet evenings with the window open. Cherry blossom is my favourite thing to paint — all that soft pink against bare branch. This one's an original on stretched canvas, signed on the back, ready to hang straight from the box.",
    specs: [
      "20 × 25cm · stretched canvas",
      "Acrylic, hand-painted original",
      "One-of-one — not a print",
      "Signed & dated on reverse",
    ],
    care: "Dust gently with a dry, soft brush. Hang away from direct sunlight and damp.",
    madeIn: "an original, 1 of 1",
  },
};

// Generic fallback detail copy, shared by detailFor() (seed data, keyed by
// PRODUCT_DETAILS) and detailForStorefront() (CMS data, keyed by per-field
// nullability) so the two fallback texts can't drift apart.
function genericDetail(meta: string): ProductDetail {
  return {
    story:
      "One of my made-by-hand pieces — designed, crocheted (or painted) and finished entirely by me in my little London studio. Made slowly, in small batches, and signed before it's wrapped and posted to you.",
    specs: [meta, "Hand-made in small batches", "Materials chosen by hand", "Signed on the back"],
    care: "Spot-clean gently with a damp cloth. Keep out of prolonged direct sunlight.",
    madeIn: "made to order",
  };
}

export function detailFor(p: Product): ProductDetail {
  return PRODUCT_DETAILS[p.id] || genericDetail(p.meta);
}

// Storefront (CMS-backed) counterpart to detailFor(). StorefrontProduct's
// detail fields are independently nullable (the CMS lets an editor fill in
// just a story, or just specs, etc.) rather than being all-or-nothing like
// the seed data's PRODUCT_DETAILS, so fallback is applied per field.
export function detailForStorefront(p: StorefrontProduct): ProductDetail {
  const fallback = genericDetail(p.meta);
  return {
    story: p.story ?? fallback.story,
    specs: p.specs.length > 0 ? p.specs : fallback.specs,
    care: p.care ?? fallback.care,
    madeIn: p.madeIn ?? fallback.madeIn,
  };
}

const ANGLE_LABELS = ["Front", "Detail", "Side", "In the light", "Back"];

// Builds the gallery view list: real photos first, then synthesized placeholder
// "angle" views (using the product palette + rotating motifs) until there are at
// least 3, so the gallery UI always demonstrates the multi-photo pattern.
export function galleryFor(p: Product): GalleryView[] {
  const views: GalleryView[] = [];
  const photos = p.imgs && p.imgs.length ? p.imgs : p.img ? [p.img] : [];
  photos.forEach((src, i) => {
    views.push({ type: "photo", src, label: ANGLE_LABELS[i] || `View ${i + 1}` });
  });
  const motifs: Motif[] = [p.motif, "loop", "ball", "heart"];
  let m = 0;
  while (views.length < 3) {
    views.push({
      type: "ph",
      palette: p.palette,
      motif: motifs[m % motifs.length] as Motif,
      label: ANGLE_LABELS[views.length] || "Angle",
    });
    m++;
  }
  return views;
}

// Storefront (CMS-backed) counterpart to galleryFor(). CMS photos carry both
// a thumb-sized and stage-sized crop (Stage 04's Media sizes), unlike the seed
// data's single `src`, so real photo views expose both URLs.
export function galleryForStorefront(p: StorefrontProduct): StorefrontGalleryView[] {
  const views: StorefrontGalleryView[] = [];
  p.photos.forEach((photo, i) => {
    views.push({
      type: "photo",
      thumbUrl: photo.sizes.thumb.url,
      stageUrl: photo.sizes.stage.url,
      label: ANGLE_LABELS[i] || `View ${i + 1}`,
    });
  });
  const motifs: Motif[] = [p.motif, "loop", "ball", "heart"];
  let m = 0;
  while (views.length < 3) {
    views.push({
      type: "ph",
      palette: p.palette,
      motif: motifs[m % motifs.length] as Motif,
      label: ANGLE_LABELS[views.length] || "Angle",
    });
    m++;
  }
  return views;
}

