import { createFileRoute } from "@tanstack/react-router";
import { getAllProducts } from "~/lib/products";
import { useReveal } from "~/hooks/useReveal";
import { useCart } from "~/hooks/useCart";
import { Nav } from "~/components/Nav";
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
  loader: () => getAllProducts(),
  component: HomePage,
});

function HomePage() {
  useReveal();
  const products = Route.useLoaderData();
  const { cartCount, openDrawer } = useCart();

  return (
    <>
      <Nav cartCount={cartCount} onCartClick={openDrawer} />
      <Hero />
      <TrustBand variant="manifesto" />
      <Products products={products} />
      <Gallery />
      <Story />
      <Process />
      <Moodboard />
      <Bespoke />
      <Reviews />
      <Footer />
      {/* CartDrawer + Toast render at the root layout (Stage 14) so they're
          shared across routes. ProductOverlay lands in Stage 15. */}
    </>
  );
}
