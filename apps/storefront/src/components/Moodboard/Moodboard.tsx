import { MoodArt } from "@yese/ui";
import { IconInstagram } from "../icons";
import styles from "./Moodboard.module.css";

const TILES = [
  { idx: 0, caption: "coral · gold", style: { gridColumn: "span 4", gridRow: "span 3" } },
  { idx: 4, caption: "lagoon", style: { gridColumn: "span 3", gridRow: "span 2" } },
  { idx: 2, caption: "marigold", style: { gridColumn: "span 5", gridRow: "span 2" } },
  { idx: 3, caption: "plum velvet", style: { gridColumn: "span 3", gridRow: "span 3" } },
  { idx: 5, caption: "buttercream", style: { gridColumn: "span 2", gridRow: "span 2" } },
  { idx: 1, caption: "deep teal", style: { gridColumn: "span 4", gridRow: "span 2" } },
  { idx: 7, caption: "studio mood", style: { gridColumn: "span 3", gridRow: "span 2" } },
  { idx: 6, caption: "flat-lay", style: { gridColumn: "span 5", gridRow: "span 2" } },
];

export function Moodboard() {
  return (
    <section className="section paper-bg" id="journal">
      <div className="section-title">
        <div>
          <span className="kicker single">Studio Journal</span>
          <h2 className="h-display">A peek inside my yarn room.</h2>
        </div>
        <a href="#" className="btn btn-ghost">
          Follow me on Instagram <IconInstagram size={14} />
        </a>
      </div>
      <div className="moodboard reveal">
        {TILES.map((t, i) => (
          <div key={i} className={styles.mood} style={t.style}>
            <MoodArt idx={t.idx} caption={t.caption} />
          </div>
        ))}
      </div>
    </section>
  );
}
