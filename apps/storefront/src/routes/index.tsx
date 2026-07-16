import { createFileRoute } from "@tanstack/react-router";
import { getAllProducts, getHomepageSectionFlags, getFeaturedFeedback } from "~/lib/products";
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

export const Route = createFileRoute("/")({
  loader: async () => {
    const [products, sectionFlags, featuredFeedback] = await Promise.all([
      getAllProducts(),
      getHomepageSectionFlags(),
      getFeaturedFeedback(),
    ]);
    return { products, sectionFlags, featuredFeedback };
  },
  component: HomePage,
});

function HomePage() {
  useReveal();
  useScrollToShopFromReferrer();
  const { products, sectionFlags, featuredFeedback } = Route.useLoaderData();
  const { cartCount, favCount, openDrawer, openFavDrawer } = useCart();

  return (
    <>
      <Nav
        cartCount={cartCount}
        favCount={favCount}
        onCartClick={openDrawer}
        onWishlistClick={openFavDrawer}
        sectionFlags={sectionFlags}
      />
      <Hero sectionFlags={sectionFlags} />
      <TrustBand variant="manifesto" />
      <Products products={products} />
      {sectionFlags.originalArtworks && <Gallery />}
      <Story />
      {sectionFlags.process && <Process />}
      {sectionFlags.studioJournal && <Moodboard />}
      {sectionFlags.bespoke && <Bespoke />}
      <Reviews feedback={featuredFeedback} />
      <Footer sectionFlags={sectionFlags} />
      <WishlistDrawer products={products} />
      {/* CartDrawer, Toast, AboutOverlay, and SearchOverlay all render once
          at the root layout (__root.tsx), shared across every route.
          ProductOverlay is homepage-specific and renders inside
          Products.tsx instead, since it's only ever opened from a
          ProductCard click here. */}
    </>
  );
}
