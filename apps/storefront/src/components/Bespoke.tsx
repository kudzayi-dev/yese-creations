import { useState } from "react";
import { IconArrow, IconCheck } from "./icons";
import styles from "./Bespoke.module.css";

const STATS = [
  { value: "£45+", label: "typical bespoke" },
  { value: "14d", label: "turn-around" },
  { value: "∞", label: "revisions until 100%" },
];

export function Bespoke() {
  const [sent, setSent] = useState(false);

  return (
    <section className="section" id="bespoke">
      <div className={`${styles.bespoke} reveal`}>
        <div>
          <span className={`kicker single ${styles.kicker}`}>Made just for you</span>
          <h2 className={`h-display ${styles.heading}`}>Tell me what you're imagining.</h2>
          <p className={styles.p}>
            Anniversaries, baby announcements, bridal bouquets that never wilt, a tiny crochet
            version of your dog, a painting of your favourite place — if you can picture it, I
            can probably make it. Send me the brief and I'll personally reply within 48 hours.
          </p>
          <div className={styles.stats}>
            {STATS.map((s) => (
              <div key={s.label}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          {!sent ? <BespokeFields /> : <BespokeSent />}
        </form>
      </div>
    </section>
  );
}

function BespokeFields() {
  return (
    <>
      <div className={styles.row2}>
        <div className={styles.field}>
          <label>Your name</label>
          <input type="text" placeholder="Yese" />
        </div>
        <div className={styles.field}>
          <label>Email</label>
          <input type="email" placeholder="hello@email.com" />
        </div>
      </div>
      <div className={styles.row2}>
        <div className={styles.field}>
          <label>Occasion</label>
          <select>
            <option>Wedding / engagement</option>
            <option>Baby announcement</option>
            <option>Anniversary</option>
            <option>Original painting commission</option>
            <option>Just because</option>
          </select>
        </div>
        <div className={styles.field}>
          <label>Budget</label>
          <select>
            <option>£45 – £80</option>
            <option>£80 – £150</option>
            <option>£150 – £300</option>
            <option>£300+</option>
          </select>
        </div>
      </div>
      <div className={styles.field}>
        <label>Tell us your idea</label>
        <textarea rows={3} placeholder="A coral & ivory bridal bouquet, 12 stems, never-wilt..." />
      </div>
      <button type="submit" className={`btn btn-primary ${styles.submit}`}>
        Send the brief <IconArrow size={16} />
      </button>
    </>
  );
}

function BespokeSent() {
  return (
    <div className={styles.sentWrap}>
      <div className={styles.sentIcon}>
        <IconCheck size={28} />
      </div>
      <h3 className={styles.sentTitle}>Brief received — thank you!</h3>
      <p className={styles.sentText}>
        It lands straight in my inbox — I'll reply personally within 48 hours with a moodboard
        &amp; quote. Yese x
      </p>
    </div>
  );
}
