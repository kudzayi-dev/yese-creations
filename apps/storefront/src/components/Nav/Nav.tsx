import { useLocation } from "@tanstack/react-router";
import { useAboutOverlay } from "~/hooks/useAboutOverlay";
import { useSearchOverlay } from "~/hooks/useSearchOverlay";
import { scrollToSection } from "~/lib/scrollToSection";
import { trackNavClick, trackCartOpen } from "~/lib/analytics";
import { IconBag, IconHeartOutline, IconSearch } from "../icons";
import styles from "./Nav.module.css";

export interface NavProps {
  /** From useCart() — cartCount, opens the CartDrawer on click. */
  cartCount?: number;
  onCartClick?: () => void;
  /**
   * From useCart() — count of favorited/wishlisted products. Shown as a
   * badge on the nav wishlist icon, same visual pattern as the cart-count
   * badge. The original design_handoff_yese_shop prototype's Nav never
   * wired this up (its wishlist button was purely decorative, no count,
   * no click handler) — the badge is a real gap-fill, not a design
   * regression: the heart toggle on ProductCard always persisted to
   * localStorage correctly, there was just nowhere in the nav reflecting
   * it.
   */
  favCount?: number;
  /** Opens the WishlistDrawer — same click-to-open pattern as onCartClick. */
  onWishlistClick?: () => void;
  /**
   * Homepage section feature flags (site-settings CMS global). A nav link
   * whose section is flagged off would otherwise point at an anchor that
   * doesn't exist on the page — hide the link along with the section so the
   * nav never dead-ends. Defaults to all-off (same fail-closed default as
   * the flags themselves) so a page rendered without this prop never shows
   * a link to a section that might not be there.
   */
  sectionFlags?: {
    originalArtworks: boolean;
    process: boolean;
    bespoke: boolean;
  };
}

const DEFAULT_FLAGS = { originalArtworks: false, process: false, bespoke: false };

export function Nav({
  cartCount = 0,
  onCartClick,
  favCount = 0,
  onWishlistClick,
  sectionFlags = DEFAULT_FLAGS,
}: NavProps) {
  const location = useLocation();
  const { openAbout } = useAboutOverlay();
  const { openSearch } = useSearchOverlay();
  const isHome = location.pathname === "/";

  return (
    <nav className={styles.nav}>
      <div className={styles.navLogo}>
        <img src="/assets/yese-logo-cutout.png" alt="Yese Creations" />
        <div>
          <div className={styles.name}>Yese</div>
          <div className={styles.tagline}>creations</div>
        </div>
      </div>
      <div className={styles.navLinks}>
        <a
          href="#shop"
          onClick={(e) => {
            trackNavClick("Shop");
            scrollToSection(e, "shop");
          }}
        >
          Shop
        </a>
        {sectionFlags.originalArtworks && (
          <a
            href="#gallery"
            onClick={(e) => {
              trackNavClick("Gallery");
              scrollToSection(e, "gallery");
            }}
          >
            Gallery
          </a>
        )}
        {/* On the homepage, "My Story" is already inline in the scroll
            (Story.tsx) — plain anchor-scroll there beats popping an overlay
            over content that's already visible. Anywhere else, there's no
            #story section to scroll to, so open the fast in-app overlay
            instead of a full page navigation. href="/about" is the real,
            crawlable fallback (works with JS off, or a modifier-click to
            open it in a new tab). */}
        {isHome ? (
          <a
            href="#story"
            onClick={(e) => {
              trackNavClick("Our Story");
              scrollToSection(e, "story");
            }}
          >
            Our Story
          </a>
        ) : (
          <a
            href="/about"
            onClick={(e) => {
              trackNavClick("Our Story");
              e.preventDefault();
              openAbout();
            }}
          >
            Our Story
          </a>
        )}
        {sectionFlags.process && (
          <a
            href="#process"
            onClick={(e) => {
              trackNavClick("Process");
              scrollToSection(e, "process");
            }}
          >
            Process
          </a>
        )}
        {sectionFlags.bespoke && (
          <a
            href="#bespoke"
            onClick={(e) => {
              trackNavClick("Bespoke");
              scrollToSection(e, "bespoke");
            }}
          >
            Bespoke
          </a>
        )}
        {/* Real route, not a hash anchor — Feedback has its own standalone,
            indexable page (see routes/feedback.tsx) rather than a homepage
            section, since the full review list is too long for an anchor
            scroll or overlay. */}
        <a href="/feedback" onClick={() => trackNavClick("Feedback")}>
          Feedback
        </a>
      </div>
      <div className={styles.navRight}>
        <button
          className="icon-btn"
          aria-label="Search"
          onClick={() => {
            trackNavClick("Search");
            openSearch();
          }}
        >
          <IconSearch />
        </button>
        <button
          className="icon-btn"
          aria-label="Wishlist"
          onClick={() => {
            trackNavClick("Wishlist");
            onWishlistClick?.();
          }}
        >
          <IconHeartOutline />
          {favCount > 0 && <span className="cart-count">{favCount}</span>}
        </button>
        <button
          className="icon-btn"
          aria-label="Cart"
          onClick={() => {
            trackCartOpen();
            onCartClick?.();
          }}
        >
          <IconBag />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>
    </nav>
  );
}
