import styles from "./Process.module.css";

const STEPS = [
  {
    n: "01",
    t: "You tell me your idea",
    d: "Pick something from the shop, or send me a few words about your dream piece — colours, occasion, the story behind it.",
  },
  {
    n: "02",
    t: "I pick the yarn (or paint)",
    d: "I hand-mix shades from my 80-strong cotton library, or stretch a fresh canvas. I'll send you a quick moodboard first.",
  },
  {
    n: "03",
    t: "Slowly, by my hands",
    d: "6 to 30 hours of careful loops, or a few weeks at the easel. I'll send WIP photos along the way so you stay close to it.",
  },
  {
    n: "04",
    t: "Wrapped & sent by me",
    d: "Pressed, scented, ribbon-tied, and dropped at my local post office. Signed on the back, with a little handwritten note inside.",
  },
];

export function Process() {
  return (
    <section className="section" id="process">
      <div className={`${styles.process} reveal`}>
        <span className={`kicker single ${styles.kicker}`}>How I make each piece</span>
        <h2 className={`h-display ${styles.heading}`}>
          From your idea to your doorstep, by my hands alone.
        </h2>
        <div className={styles.steps}>
          {STEPS.map((s) => (
            <div className={styles.step} key={s.n}>
              <div className={styles.num}>{s.n}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
