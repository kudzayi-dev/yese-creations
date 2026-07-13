import styles from "./TrustBand.module.css";

const MARQUEE_ITEMS = [
  "Hand-stitched by one woman, one studio",
  "★ 4.9 across 380+ reviews",
  "Run, packed & posted by me",
  "Local pickup · London E1",
  "Ships worldwide from £6",
  "No factories. No team. Just me.",
  "Each piece signed on the back",
];

function TrustMarquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className={styles.trust} aria-label="press and trust marks">
      <div className="marquee">
        {row.map((t, i) => (
          <span key={i} className={styles.item}>
            <span className={styles.star}>✦</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Manifesto() {
  return (
    <div className={styles.manifesto}>
      <p className={styles.line}>
        Every piece on this site is <span className={styles.script}>made by</span>
        <br />
        one pair of hands. Slowly. With love.
      </p>
      <div className={styles.by}>— Yese</div>
    </div>
  );
}

const PROMISE_ITEMS = [
  {
    icon: (
      <path d="M12 21s-7-4.3-9-8.6C1 8.5 3.2 4.5 7 4.5c2 0 3.6 1.2 4.5 2.7C12.4 5.7 14 4.5 16 4.5c3.8 0 6 4 4 7.9C19 16.7 12 21 12 21z" />
    ),
    title: "Hand-made by me",
    text: "Every stitch, every brushstroke",
  },
  {
    icon: (
      <>
        <path d="M3 7l9-4 9 4-9 4-9-4z" />
        <path d="M3 12l9 4 9-4" />
        <path d="M3 17l9 4 9-4" />
      </>
    ),
    title: "One of one",
    text: "No two pieces ever alike",
  },
  {
    icon: (
      <>
        <path d="M20 7l-1.4-2.8a2 2 0 0 0-1.8-1.1H7.2a2 2 0 0 0-1.8 1.1L4 7" />
        <path d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
        <path d="M9 12h6" />
      </>
    ),
    title: "Wrapped & signed",
    text: "Posted from London E1",
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" />
      </>
    ),
    title: "Ships worldwide",
    text: "From £6 · 14-day bespoke",
  },
];

function Promise() {
  return (
    <div className={styles.promise}>
      <div className={styles.row}>
        {PROMISE_ITEMS.map((item, i) => (
          <div className={styles.promiseItem} key={i}>
            <div className={styles.iconC}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
            </div>
            <div className={styles.itemText}>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type TrustBandVariant = "manifesto" | "promise" | "marquee" | "off";

export interface TrustBandProps {
  variant?: TrustBandVariant;
}

export function TrustBand({ variant = "manifesto" }: TrustBandProps) {
  if (variant === "off") return null;
  if (variant === "promise") return <Promise />;
  if (variant === "marquee") return <TrustMarquee />;
  return <Manifesto />;
}
