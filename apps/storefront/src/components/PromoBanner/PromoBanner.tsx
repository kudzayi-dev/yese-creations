import styles from "./PromoBanner.module.css";

export interface PromoBannerProps {
  heading: string;
  copy: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  theme?: "coral" | "gold" | "teal" | null;
}

// No design handoff exists for this \u2014 like Search before it, this is a
// direct product decision: a slim, dismissible-by-nature (self-expiring via
// activeFrom/activeTo on the CMS block, not a client-side close button)
// announcement strip for seasonal sales, delivery notices, or limited
// offers. Themed to match the brand's existing coral/gold/teal accent
// palette rather than introducing a new color. Rendered by routes/index.tsx
// only when the CMS's promoBanner block is both present in the layout AND
// within its active date range \u2014 see isPromoBannerActive() there.
export function PromoBanner({ heading, copy, ctaLabel, ctaHref, theme }: PromoBannerProps) {
  const themeClass = styles[theme ?? "coral"] ?? styles["coral"];
  return (
    <div className={`${styles.banner} ${themeClass}`}>
      <div className={styles.inner}>
        <span className={styles.heading}>{heading}</span>
        <span className={styles.copy}>{copy}</span>
        {ctaLabel && ctaHref && (
          <a className={styles.cta} href={ctaHref}>
            {ctaLabel}
          </a>
        )}
      </div>
    </div>
  );
}
