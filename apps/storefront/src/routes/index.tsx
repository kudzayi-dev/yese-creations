import { createFileRoute } from "@tanstack/react-router";
import {
  getAllProducts,
  getFeaturedFeedback,
  getFooterContent,
  getCategories,
  getHomepageLayout,
  getAboutContent,
} from "~/lib/products";
import type { PromoBannerBlockData } from "~/lib/cms";
import { useReveal } from "~/hooks/useReveal";
import { useScrollToShopFromReferrer } from "~/hooks/useScrollToShopFromReferrer";
import { useCart } from "~/hooks/useCart";
import { Nav } from "~/components/Nav";
import { WishlistDrawer } from "~/components/WishlistDrawer";
import { Hero } from "~/components/Hero";
import { TrustBand } from "~/components/TrustBand";
import { Products } from "~/components/Products";
import { Gallery } from "~/components/Gallery";
import { Story } from "~/components/Story";
import { Process } from "~/components/Process";
import { Moodboard } from "~/components/Moodboard";
import { Bespoke } from "~/components/Bespoke";
import { Reviews } from "~/components/Reviews";
import { Footer } from "~/components/Footer";
import { PromoBanner } from "~/components/PromoBanner";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [products, featuredFeedback, footerContent, categories, layout, aboutContent] = await Promise.all([
      getAllProducts(),
      getFeaturedFeedback(),
      getFooterContent(),
      getCategories(),
      getHomepageLayout(),
      getAboutContent(),
    ]);
    return { products, featuredFeedback, footerContent, categories, layout, aboutContent };
  },
  component: HomePage,
});

// A promoBanner block only renders while "now" falls inside its optional
// activeFrom/activeTo window — an editor sets a start/end date once and the
// banner disappears on its own; no need to remember to come back and
// remove it.
function isPromoBannerActive(block: PromoBannerBlockData): boolean {
  const now = Date.now();
  if (block.activeFrom && now < new Date(block.activeFrom).getTime()) return false;
  if (block.activeTo && now > new Date(block.activeTo).getTime()) return false;
  return true;
}

function HomePage() {
  useReveal();
  useScrollToShopFromReferrer();
  const { products, featuredFeedback, footerContent, categories, layout, aboutContent } = Route.useLoaderData();
  const { cartCount, favCount, openDrawer, openFavDrawer } = useCart();

  // Nav/Hero still take the old boolean-flag shape for anchor visibility;
  // derive it from which blocks are actually present in the live layout
  // instead of the old SiteSettings.homepageSections booleans — presence in
  // the CMS layout IS the on/off switch now.
  const blockTypes = new Set(layout.map((b) => b.blockType));
  const sectionFlags = {
    originalArtworks: blockTypes.has("gallery"),
    process: blockTypes.has("process"),
    studioJournal: blockTypes.has("moodboard"),
    bespoke: blockTypes.has("bespoke"),
  };

  return (
    <>
      <Nav
        cartCount={cartCount}
        favCount={favCount}
        onCartClick={openDrawer}
        onWishlistClick={openFavDrawer}
        sectionFlags={sectionFlags}
      />
      {layout.map((block) => {
        switch (block.blockType) {
          case "hero":
            return (
              <Hero
                key={block.id ?? "hero"}
                sectionFlags={sectionFlags}
                heading={block.heading ?? undefined}
                leadCopy={block.leadCopy ?? undefined}
              />
            );
          case "promoBanner":
            return isPromoBannerActive(block) ? (
              <PromoBanner
                key={block.id ?? "promoBanner"}
                heading={block.heading}
                copy={block.copy}
                ctaLabel={block.ctaLabel}
                ctaHref={block.ctaHref}
                theme={block.theme}
              />
            ) : null;
          case "trustBand":
            return <TrustBand key={block.id ?? "trustBand"} variant="manifesto" />;
          case "productGrid":
            return (
              <Products
                key={block.id ?? "productGrid"}
                products={products}
                categories={categories}
                kicker={block.kicker ?? undefined}
                heading={block.heading ?? undefined}
              />
            );
          case "story":
            return <Story key={block.id ?? "story"} content={aboutContent} />;
          case "gallery":
            return <Gallery key={block.id ?? "gallery"} />;
          case "process":
            return <Process key={block.id ?? "process"} steps={block.steps ?? undefined} />;
          case "moodboard":
            return <Moodboard key={block.id ?? "moodboard"} />;
          case "bespoke":
            return <Bespoke key={block.id ?? "bespoke"} />;
          case "testimonials":
            return <Reviews key={block.id ?? "testimonials"} feedback={featuredFeedback} />;
          default:
            return null;
        }
      })}
      <Footer content={footerContent} categories={categories} />
      <WishlistDrawer products={products} />
      {/* CartDrawer, Toast, AboutOverlay, and SearchOverlay all render once
          at the root layout (__root.tsx), shared across every route.
          ProductOverlay is homepage-specific and renders inside
          Products.tsx instead, since it's only ever opened from a
          ProductCard click here. */}
    </>
  );
}
