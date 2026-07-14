import { PHGradient } from "@yese/ui";
import { PALETTES } from "@yese/product-data";
import styles from "./Story.module.css";

export function Story() {
  return (
    <section className={`section paper-bg`} id="story">
      <div className={styles.story}>
        <div className={`${styles.imgStack} reveal`}>
          <div className={`${styles.frame} ${styles.f1}`}>
            <PHGradient palette={PALETTES[2]!} motif="flower" caption="studio · london" />
          </div>
          <div className={`${styles.frame} ${styles.f2} anim-drift`}>
            <PHGradient palette={PALETTES[0]!} motif="heart" caption="signature heart" />
          </div>
          <div className={`${styles.frame} ${styles.f3} anim-drift-rev`}>
            <PHGradient palette={PALETTES[4]!} motif="ball" caption="yarn library" />
          </div>
        </div>
        <div className={`${styles.copy} reveal`}>
          <span className="kicker single">My Story</span>
          <h2 className={`h-display ${styles.heading}`}>
            One woman, <em className={styles.one}>one</em> very colourful studio.
          </h2>
          <p className={styles.p}>
            Yese Creations started at my kitchen table with a single ball of coral yarn, a
            sketchbook, and a feeling that I'd rather make <strong>one beautiful thing slowly</strong>{" "}
            than a hundred quick ones. Six years later I'm still that same person — just with a
            lot more yarn and a slightly better lamp.
          </p>
          <p className={styles.p}>
            I crochet, I paint, I sketch, I pack the boxes, I answer the emails, I tie every
            ribbon. There's no team, no factory, no warehouse. It's me, my dog, and a steady
            stream of cinnamon-spiced tea.
          </p>
          <div className={styles.signature}>
            Yese <small>— maker, painter &amp; resident tea-drinker</small>
          </div>
          <div className={styles.marginNote}>
            this is the only "team page"
            <br />
            you'll find on the site!
          </div>
        </div>
      </div>
    </section>
  );
}
