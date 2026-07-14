import styles from "./Reviews.module.css";

const REVIEWS = [
  {
    who: "Amara K.",
    what: "Bridal bouquet",
    text: "Walked down the aisle holding a Yese bouquet — six months later it's on our mantle, still perfect. You can feel it was made by one person, with care.",
    av: "A",
  },
  {
    who: "Priya & James",
    what: "Nursery set",
    text: "The cottonball bunny is genuinely the softest thing we own. Yese sent us photos through the whole process — felt like a friend was making it for us.",
    av: "P",
  },
  {
    who: "Linh O.",
    what: "Anniversary commission",
    text: "I asked for a painting of our wedding venue and Yese turned it around in three weeks. The personal back-and-forth made it feel like a tiny collaboration.",
    av: "L",
  },
];

export function Reviews() {
  return (
    <section className="section">
      <div className={`section-title ${styles.titleRow}`}>
        <div>
          <span className="kicker single">Kind words</span>
          <h2 className="h-display">From the people I've made for.</h2>
        </div>
      </div>
      <div className={styles.reviews}>
        {REVIEWS.map((r, i) => (
          <div className={`${styles.review} reveal`} key={i}>
            <div className={styles.stars}>★★★★★</div>
            <p>&ldquo;{r.text}&rdquo;</p>
            <div className={styles.who}>
              <div className={styles.av}>{r.av}</div>
              <div>
                <strong>{r.who}</strong>
                <small>{r.what}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
