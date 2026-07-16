import type { FeedbackEntry } from "~/lib/cms";
import { FeedbackCard } from "./FeedbackCard";
import styles from "./Reviews.module.css";

export interface ReviewsProps {
  /** Featured feedback entries from the CMS (see lib/cms.ts fetchFeaturedFeedback). */
  feedback: FeedbackEntry[];
}

export function Reviews({ feedback }: ReviewsProps) {
  if (feedback.length === 0) return null;

  return (
    <section className="section">
      <div className={`section-title ${styles.titleRow}`}>
        <div>
          <span className="kicker single">Kind words</span>
          <h2 className="h-display">From the people I've made for.</h2>
        </div>
        <a href="/feedback" className={styles.seeAll}>
          Read all reviews →
        </a>
      </div>
      <div className={styles.reviews}>
        {feedback.map((entry) => (
          <FeedbackCard entry={entry} key={entry.id} />
        ))}
      </div>
    </section>
  );
}
