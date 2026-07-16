import { useEffect } from "react";
import { AboutContent } from "~/components/Story/AboutContent";
import { useAboutOverlay } from "~/hooks/useAboutOverlay";
import { IconArrowLeft, IconClose } from "../icons";
// Reuses ProductOverlay's chrome classes (overlay/open/topbar/back/brand/
// close/scroll/inner) — same full-screen-takeover pattern, not
// product-specific, so no need to fork the CSS a second time.
import overlayStyles from "~/components/ProductOverlay/ProductOverlay.module.css";
import styles from "./AboutOverlay.module.css";

// The fast, full-screen in-app view of "My Story" — opened from the Nav's
// "Our Story" link when clicked from a page other than the homepage (see
// Nav.tsx). On the homepage itself, the same content is already inline in
// the scroll (Story.tsx), so the nav link there just anchor-scrolls to it —
// popping this overlay open there too would hide content that's already
// visible for no benefit (see the "negatives" discussion this was built
// from). AboutContent is the single source of copy shared with Story.tsx
// and the standalone /about route, so nothing can drift between the three.
export function AboutOverlay() {
  const { isOpen, closeAbout } = useAboutOverlay();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAbout();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [closeAbout, isOpen]);

  return (
    <div
      className={`${overlayStyles.overlay} ${isOpen ? overlayStyles.open : ""}`}
      aria-hidden={!isOpen}
    >
      <div className={overlayStyles.topbar}>
        <button className={overlayStyles.back} onClick={closeAbout}>
          <IconArrowLeft />
          Back
        </button>
        <div className={overlayStyles.brand}>
          <img src="/assets/yese-logo-cutout.png" alt="" />
          <span>Yese Creations</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a className={overlayStyles.fullpage} href="/about">
            Open full page ↗
          </a>
          <button className={`icon-btn ${overlayStyles.close}`} onClick={closeAbout} aria-label="Close">
            <IconClose />
          </button>
        </div>
      </div>

      <div className={overlayStyles.scroll}>
        <div className={styles.inner}>
          <AboutContent />
        </div>
      </div>
    </div>
  );
}
