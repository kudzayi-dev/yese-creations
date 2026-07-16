import { YarnBall, YarnHeart } from "@yese/ui";
import { IconArrow } from "../icons";
import { scrollToSection } from "~/lib/scrollToSection";
import styles from "./Hero.module.css";

export interface HeroProps {
  /**
   * Homepage section feature flags (site-settings CMS global) — same prop
   * shape/source as Nav's sectionFlags. "Commission a piece" links to
   * #bespoke, so it's gated behind sectionFlags.bespoke: showing it while
   * the Bespoke section itself is hidden would dead-end the CTA. Defaults
   * to off (fail-closed), matching Nav.
   *
   * (The "Made entirely by me" / "One-of-one pieces" / "Signed on the
   * back" / "Slow, never rushed" value pills that used to sit here were
   * removed — TrustBand right below covers the same ground better.)
   */
  sectionFlags?: {
    bespoke: boolean;
  };
}

const DEFAULT_FLAGS = { bespoke: false };

function FloatingMotifs() {
  return (
    <>
      <div className={`float anim-drift ${styles.motifTopLeft}`}>
        <YarnBall color="#FF6F61" accent="#F2B233" size={70} />
      </div>
      <div className={`float anim-drift-rev ${styles.motifMidRight}`}>
        <YarnBall color="#2BB6C4" accent="#0E3B43" size={60} />
      </div>
      <div className={`float anim-drift ${styles.motifBottomLeft}`}>
        <YarnBall color="#F2B233" accent="#5B2A4E" size={44} />
      </div>
      <div className={`float anim-drift-rev anim-glow ${styles.motifTopRight}`}>
        <YarnHeart color="rgba(255,111,97,0.6)" stroke="rgba(255,111,97,0.95)" />
      </div>
    </>
  );
}

export function Hero({ sectionFlags = DEFAULT_FLAGS }: HeroProps = {}) {
  return (
    <section className={`${styles.hero} paper-bg`}>
      <FloatingMotifs />

      <div className={styles.heroCopy}>
        <span className="eyebrow">
          <svg viewBox="0 0 24 24" fill="#FF6F61">
            <path d="M12 21s-7.5-4.6-9.6-9.2C.7 8 3 4 6.8 4c2 0 3.6 1.2 4.6 2.6h1.2C13.6 5.2 15.2 4 17.2 4 21 4 23.3 8 21.6 11.8 19.5 16.4 12 21 12 21z" />
          </svg>
          hi, I'm Yese — a one-woman studio
        </span>
        <h1 className={styles.h1}>
          Crochet &amp; <span className={styles.script}>painted</span>
          <br />
          keepsakes, made by
          <br />
          me, with a little <span className={styles.stroke}>magic</span>.
        </h1>
        <p className={styles.lead}>
          I'm an independent artist working from a tiny studio — crocheting bouquets and
          plushies, painting in oils, and stitching bespoke keepsakes for people who'd rather
          have <em>one made-by-hand thing</em> than ten mass-produced ones.
        </p>
        <div className={styles.heroCtas}>
          <a href="#shop" className="btn btn-primary" onClick={(e) => scrollToSection(e, "shop")}>
            Shop the collection <IconArrow size={16} />
          </a>
          {sectionFlags.bespoke && (
            <a href="#bespoke" className="btn btn-ghost" onClick={(e) => scrollToSection(e, "bespoke")}>
              Commission a piece
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
