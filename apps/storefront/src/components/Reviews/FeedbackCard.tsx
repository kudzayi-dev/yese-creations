import type { FeedbackEntry } from "~/lib/cms";
import { IconBag } from "../icons";
import styles from "./Reviews.module.css";

/**
 * Renders one of two deliberate card styles depending on `source`:
 *  - "ebay"  — masked buyer handle (eBay never exposes a real name) + a
 *              "Verified purchase" badge doing the trust-signalling a name
 *              would otherwise do.
 *  - "app"   — real customer name + initial avatar, for future in-app
 *              reviews.
 * Two intentional variants, not one style with a missing field — see the
 * design discussion this was built from.
 *
 * Badge wording is deliberately source-agnostic: "Verified purchase", never
 * "Verified eBay purchase" — reviews currently come primarily from eBay
 * while the studio grows its own on-site reviews, and the client didn't
 * want the UI reading as eBay-exclusive. The eBay origin is still visible,
 * just deemphasized, as a small "· via eBay" suffix. Retiring eBay later is
 * a pure data change (stop setting source to "ebay") — no markup changes.
 */
export function FeedbackCard({ entry }: { entry: FeedbackEntry }) {
  const isSourced = entry.source === "ebay";

  return (
    <div className={`${styles.review} reveal`}>
      <span className={styles.catTag}>{entry.cat}</span>
      <div className={styles.cardTop}>
        <div className={styles.stars}>{"★".repeat(entry.rating)}</div>
        {entry.verified && (
          <div className={styles.verifiedBadge}>
            Verified purchase
            {isSourced && <span className={styles.source}> · via eBay</span>}
          </div>
        )}
      </div>
      <p>&ldquo;{entry.quote}&rdquo;</p>
      <div className={styles.who}>
        {isSourced ? (
          <div className={`${styles.av} ${styles.avSourced}`} aria-hidden="true">
            <IconBag />
          </div>
        ) : (
          <div className={styles.av} aria-hidden="true">
            {entry.customerName?.charAt(0) ?? "?"}
          </div>
        )}
        <div>
          <strong>{isSourced ? entry.buyerHandle : entry.customerName}</strong>
          <small>{entry.productName}</small>
        </div>
      </div>
    </div>
  );
}
