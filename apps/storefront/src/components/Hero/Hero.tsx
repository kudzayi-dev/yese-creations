import { YarnBall, YarnHeart } from "@yese/ui";
import { IconArrow, IconSpark } from "../icons";
import styles from "./Hero.module.css";

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

export function Hero() {
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
          <a href="#shop" className="btn btn-primary">
            Shop the collection <IconArrow size={16} />
          </a>
          <a href="#bespoke" className="btn btn-ghost">
            Commission a piece
          </a>
        </div>
        <div className={styles.heroValues}>
          <span className={styles.pill}>
            <span className={styles.swatch} style={{ background: "var(--coral)" }} /> Made entirely by me
          </span>
          <span className={styles.pill}>
            <span className={styles.swatch} style={{ background: "var(--turq)" }} /> One-of-one pieces
          </span>
          <span className={styles.pill}>
            <span className={styles.swatch} style={{ background: "var(--gold)" }} /> Signed on the back
          </span>
          <span className={styles.pill}>
            <span className={styles.swatch} style={{ background: "var(--plum)" }} /> Slow, never rushed
          </span>
        </div>
      </div>

      <div className={styles.heroStage}>
        <div className={`${styles.ring} anim-spin-slow`} />
        <div className={styles.blob} />
        <div className={styles.logoHalo}>
          <img src="/assets/yese-logo.png" alt="Yese Creations logo" />
        </div>
        <div className={`${styles.chip} anim-drift ${styles.chipTopLeft}`}>
          <span className={styles.dot} style={{ background: "#FF6F61" }} /> 100% hand-crocheted
        </div>
        <div className={`${styles.chip} anim-drift-rev ${styles.chipBottomRight}`}>
          <span className={styles.dot} style={{ background: "#F2B233" }} /> Made-to-order ready
        </div>
        <div className={`${styles.chip} anim-drift ${styles.chipMidLeft}`}>
          <IconSpark size={14} /> Last bouquet in 48h
        </div>
        <div className={styles.waxStamp}>
          Studio
          <br />
          of <small>One</small>
        </div>
      </div>
    </section>
  );
}
