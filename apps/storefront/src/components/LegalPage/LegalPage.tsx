import { useCart } from "~/hooks/useCart";
import { useReveal } from "~/hooks/useReveal";
import type { LegalPageData } from "~/lib/cms";
import { IconArrowLeft, IconBag } from "~/components/icons";
// Reuses the PDP's page-chrome classes (nav/back/brand/cart/crumb/foot) —
// same standalone-page layout as /about and /feedback, not product-specific.
import pdpStyles from "~/components/Pdp/Pdp.module.css";
import styles from "./LegalPage.module.css";

export interface LegalPageProps {
  title: string;
  data: LegalPageData;
}

// Shared shell for /privacy and /terms — both CMS-driven (Legal Pages
// global) sets of sections, same page-chrome pattern as AboutPage/
// FeedbackPage. Content is DRAFT/not-legal-advice — see
// apps/cms/src/globals/LegalPages.ts's header comment.
export function LegalPage({ title, data }: LegalPageProps) {
  useReveal();
  const { cartCount, openDrawer } = useCart();

  return (
    <div className={pdpStyles.body}>
      <nav className={pdpStyles.nav}>
        <a className={pdpStyles.back} href="/">
          <IconArrowLeft size={18} />
          Back to shop
        </a>
        <a className={pdpStyles.brand} href="/" aria-label="Yese Creations home">
          <img src="/assets/yese-logo-cutout.png" alt="" />
          <span>
            <span className={pdpStyles.brandName}>Yese</span>{" "}
            <span className={pdpStyles.brandTag}>creations</span>
          </span>
        </a>
        <button className={pdpStyles.cart} onClick={openDrawer}>
          <IconBag size={18} />
          Basket {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </nav>

      <nav className={pdpStyles.crumb} aria-label="Breadcrumb">
        <a href="/">Home</a> · <span>{title}</span>
      </nav>

      <main className={`${styles.main} reveal`}>
        <h1 className={`h-display ${styles.heading}`}>{title}</h1>
        {data.lastUpdated && (
          <p className={styles.updated}>
            Last updated{" "}
            {new Date(data.lastUpdated).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        {data.sections.map((section, i) => (
          <section key={i} className={styles.section}>
            <h2>{section.heading}</h2>
            {section.body.split("\n\n").map((para, j) => (
              <p key={j}>{para}</p>
            ))}
          </section>
        ))}
      </main>

      <footer className={pdpStyles.foot}>
        <div>© 2026 Yese Creations · run, made &amp; loved by Yese in London</div>
        <div>
          <a href="/">Back to the shop →</a>
        </div>
      </footer>
    </div>
  );
}
