import { PHGradient } from "@yese/ui";
import { PALETTES } from "@yese/product-data";
import type { AboutContentData } from "~/lib/cms";
import { renderStyledHeading } from "~/lib/styledHeading";
import styles from "./Story.module.css";

export interface AboutContentProps {
  content: AboutContentData;
}

// The actual bio copy — now CMS-driven (apps/cms/src/globals/About.ts) via
// the `content` prop, instead of hardcoded here. Rendered by three
// consumers that must never drift apart (same load-bearing reasoning as
// products.ts being the single source for the grid/overlay/PDP):
//   1. Story.tsx        — the homepage's inline scroll section (#story)
//   2. AboutPage.tsx     — the standalone, indexable /about route
//   3. AboutOverlay.tsx  — the fast in-app overlay opened from non-homepage pages
export function AboutContent({ content }: AboutContentProps) {
  return (
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
        <span className="kicker single">{content.kicker}</span>
        <h2 className={`h-display ${styles.heading}`}>{renderStyledHeading(content.heading, { script: styles.one })}</h2>
        {content.paragraphs.map((p, i) => (
          <p className={styles.p} key={i}>
            {p}
          </p>
        ))}
        <div className={styles.signature}>
          {content.signatureName} <small>{content.signatureSubtitle}</small>
        </div>
        <div className={styles.marginNote}>
          {content.marginNote.split("\n").map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
