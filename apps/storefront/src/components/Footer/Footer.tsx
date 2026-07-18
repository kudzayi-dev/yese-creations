import { useState } from "react";
import { IconArrow, IconCheck, IconClose, IconInstagram, IconPinterest, IconTiktok } from "../icons";
import { scrollToSection } from "~/lib/scrollToSection";
import { subscribeToNewsletter } from "~/lib/newsletter";
import type { FooterContent, FooterSocialLink } from "~/lib/cms";
import type { StorefrontCategory } from "@yese/product-data";
import styles from "./Footer.module.css";

export interface FooterProps {
  /**
   * CMS-driven footer links (footer-settings global) — social/studio/legal
   * links all live in the CMS now so adding or removing one never needs a
   * code deploy. Defaults to empty (fail-closed, same reasoning as
   * Nav/Hero's sectionFlags) so a page rendered without this prop never
   * shows a broken or stale link.
   */
  content?: FooterContent;
  /** CMS-editable taxonomy (fetched via getCategories()) — drives the Shop column. */
  categories?: StorefrontCategory[];
}

const DEFAULT_CONTENT: FooterContent = { socialLinks: [], studioLinks: [], legalLinks: [] };

// Only Instagram/Pinterest/TikTok have a dedicated icon today — "other"
// (and any future platform added in the CMS before an icon exists for it)
// renders as label-only text, no icon, rather than breaking.
const SOCIAL_ICONS: Partial<Record<FooterSocialLink["platform"], typeof IconInstagram>> = {
  instagram: IconInstagram,
  pinterest: IconPinterest,
  tiktok: IconTiktok,
};

// Ported from design_handoff_yese_newsletter's Footer() — the previously
// static signup (no loading/success/error states at all) now mirrors the
// handoff's full flow: disabled/loading state while submitting, the form
// replaced entirely by a dismissible gold-tinted success card (not just a
// static success line — the handoff's whole point was giving people a way
// back to a fresh form), and an inline coral error message that clears the
// moment typing resumes. "Already subscribed" reuses the same success-card
// pattern with its own copy — the handoff flagged this as a gap in its own
// prototype ("No duplicate-subscriber-specific messaging"), closed here
// since the real CMS integration (lib/newsletter.ts) can actually tell us.
type SignupStatus = "idle" | "submitting" | "success" | "alreadySubscribed" | "error";

export function Footer({ content = DEFAULT_CONTENT, categories = [] }: FooterProps = {}) {
  const { socialLinks, studioLinks, legalLinks } = content;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SignupStatus>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "submitting") return;
    setStatus("submitting");
    try {
      const result = await subscribeToNewsletter({ data: { email } });
      setStatus(result.alreadySubscribed ? "alreadySubscribed" : "success");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setEmail("");
  };

  const isDone = status === "success" || status === "alreadySubscribed";
  return (
    <footer className={styles.footer}>
      <div className={styles.news}>
        <div>
          <h2 className={styles.newsHeading}>
            Join the <span className={styles.script}>stitch club</span>
          </h2>
          <p className={styles.newsText}>
            One email a month from me — new pieces, a peek at what's on my desk, studio sales,
            and an occasional 10% off code. No spam, ever. Just me.
          </p>
        </div>
        <div className={styles.signupWrap}>
          {isDone ? (
            <div className={styles.signupSuccess}>
              <span className={styles.signupSuccessIcon}>
                <IconCheck size={16} />
              </span>
              <div>
                {status === "success" ? (
                  <>
                    <strong>You&apos;re in — welcome to the stitch club! ✦</strong>
                    <span>Keep an eye on {email || "your inbox"} for your first note from me.</span>
                  </>
                ) : (
                  <>
                    <strong>You&apos;re already on the list — thank you!</strong>
                    <span>No need to sign up twice — I&apos;ve already got you, {email || "friend"}.</span>
                  </>
                )}
              </div>
              <button className={styles.signupSuccessClose} onClick={reset} aria-label="Dismiss">
                <IconClose size={14} />
              </button>
            </div>
          ) : (
            <form className={styles.signup} onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                aria-invalid={status === "error"}
                required
                disabled={status === "submitting"}
              />
              <button className="btn btn-gold" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? (
                  "Joining\u2026"
                ) : (
                  <>
                    Join <IconArrow size={14} />
                  </>
                )}
              </button>
            </form>
          )}
          {status === "error" && (
            <div className={styles.signupError}>Something went wrong — please try again in a moment.</div>
          )}
          {!isDone && (
            <div className={styles.signupNote}>By joining you agree to occasional warm hellos.</div>
          )}
        </div>
      </div>

      <div className={styles.cols}>
        <div className={styles.brand}>
          <img src="/assets/yese-logo-cutout.png" alt="" />
          <div>
            <div className={styles.brandName}>Yese Creations</div>
            <div className={styles.brandTag}>a studio of one</div>
            <p className={styles.desc}>
              An independent artist crocheting, painting and hand-making colourful keepsakes —
              slowly, from one small London studio.
            </p>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <a href="#shop" onClick={(e) => scrollToSection(e, "shop")}>{c.name}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Studio</h4>
          <ul>
            {studioLinks.map((link) => (
              <li key={link.label}><a href={link.url}>{link.label}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Hello</h4>
          <ul>
            <li><a href="mailto:hello@yese.studio">hello@yese.studio</a></li>
            {socialLinks.map((social) => {
              const Icon = SOCIAL_ICONS[social.platform];
              return (
                <li key={social.label}>
                  <a href={social.url} className={styles.social}>
                    {Icon && <Icon size={14} />} {social.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div>© 2026 Yese Creations · run, made &amp; loved by Yese in London</div>
        <div className={styles.bottomLinks}>
          {legalLinks.map((link) => (
            <a key={link.label} href={link.url}>{link.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
