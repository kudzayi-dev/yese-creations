import type { ProcessStepData } from "~/lib/cms";
import styles from "./Process.module.css";

export interface ProcessProps {
  /** From the CMS's process block (Pages collection). Falls back to the default 4 steps if empty. */
  steps?: ProcessStepData[];
}

const DEFAULT_STEPS: ProcessStepData[] = [
  {
    title: "You tell me your idea",
    detail:
      "Pick something from the shop, or send me a few words about your dream piece — colours, occasion, the story behind it.",
  },
  {
    title: "I pick the yarn (or paint)",
    detail:
      "I hand-mix shades from my 80-strong cotton library, or stretch a fresh canvas. I'll send you a quick moodboard first.",
  },
  {
    title: "Slowly, by my hands",
    detail:
      "6 to 30 hours of careful loops, or a few weeks at the easel. I'll send WIP photos along the way so you stay close to it.",
  },
  {
    title: "Wrapped & sent by me",
    detail:
      "Pressed, scented, ribbon-tied, and dropped at my local post office. Signed on the back, with a little handwritten note inside.",
  },
];

export function Process({ steps }: ProcessProps) {
  const list = steps && steps.length > 0 ? steps : DEFAULT_STEPS;
  return (
    <section className="section" id="process">
      <div className={`${styles.process} reveal`}>
        <span className={`kicker single ${styles.kicker}`}>How I make each piece</span>
        <h2 className={`h-display ${styles.heading}`}>
          From your idea to your doorstep, by my hands alone.
        </h2>
        <div className={styles.steps}>
          {list.map((s, i) => (
            <div className={styles.step} key={i}>
              <div className={styles.num}>{String(i + 1).padStart(2, "0")}</div>
              <h3>{s.title}</h3>
              <p>{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
