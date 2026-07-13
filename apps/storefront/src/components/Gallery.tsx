import { PHGradient } from "@yese/ui";
import { PALETTES } from "@yese/product-data";
import type { Motif } from "@yese/product-data";
import { IconArrow } from "./icons";
import styles from "./Gallery.module.css";

// Ported from app.jsx Gallery(). This is static marketing content (the
// maker's own paintings), not shop products — no CMS/cart wiring, matching
// the prototype (onAdd/lastAdded were unused props there too).
interface Work {
  id: string;
  name: string;
  year: string;
  medium: string;
  palette: number;
  motif: Motif;
  price: number;
  tag: string;
  feature?: boolean;
}

const WORKS: Work[] = [
  { id: "a1", name: "Coral Tide, Drifting", year: "2025", medium: "Oil on linen · 80×100cm", palette: 0, motif: "abstract", price: 480, tag: "Original", feature: true },
  { id: "a2", name: "Lagoon Memory", year: "2025", medium: "Acrylic on canvas · 50×50cm", palette: 4, motif: "canvas", price: 320, tag: "Original" },
  { id: "a3", name: "Marigold Hours", year: "2024", medium: "Mixed media · 40×60cm", palette: 5, motif: "abstract", price: 0, tag: "Sold" },
  { id: "a4", name: "Plum Velvet Still", year: "2025", medium: "Oil on board · 30×40cm", palette: 7, motif: "portrait", price: 260, tag: "Original" },
  { id: "a5", name: "Studio Self, in Coral", year: "2024", medium: "Charcoal & oil · 50×70cm", palette: 2, motif: "portrait", price: 340, tag: "Original" },
];

export function Gallery() {
  return (
    <section className={`section ${styles.gallerySection}`} id="gallery">
      <div className="section-title">
        <div>
          <span className="kicker single">Original Artworks</span>
          <h2 className="h-display">Paintings from my studio wall.</h2>
          <p className={styles.intro}>
            Alongside the crochet, I paint — oils, acrylics, mixed media. Every piece is
            one-of-one, signed on the back, and shipped rolled or stretched anywhere in the
            world.
          </p>
        </div>
        <a href="#bespoke" className="btn btn-ghost">
          Commission a painting <IconArrow size={14} />
        </a>
      </div>

      <div className={`${styles.gallery} reveal`}>
        {WORKS.map((w) => (
          <article key={w.id} className={`${styles.art} ${w.feature ? styles.artFeature : ""}`}>
            <span className={`${styles.cornerTag} ${w.tag === "Sold" ? styles.cornerTagSold : ""}`}>
              {w.tag}
            </span>
            <div className={styles.frameWrap}>
              <PHGradient palette={PALETTES[w.palette]!} motif={w.motif} />
            </div>
            <div className={styles.label}>
              <div>
                <h3>{w.name}</h3>
                <div className={styles.sub}>
                  {w.year} · {w.medium}
                </div>
              </div>
              <div className={styles.priceArt}>
                {w.price > 0 ? (
                  <>
                    £{w.price}
                    <small>Enquire</small>
                  </>
                ) : (
                  <span className={styles.sold}>
                    —<small>Sold</small>
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.galleryCta}>
        <div className={styles.blurb}>
          Don't see it? <span className={styles.script}>Commission</span> something just for you.
        </div>
        <a href="#bespoke" className="btn btn-primary">
          Start a commission <IconArrow size={14} />
        </a>
      </div>
    </section>
  );
}
