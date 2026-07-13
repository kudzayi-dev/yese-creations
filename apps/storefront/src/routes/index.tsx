import { createFileRoute } from "@tanstack/react-router";
import { getAllProducts } from "~/lib/products";
import { useReveal } from "~/hooks/useReveal";
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

  return (
    <>
      <Nav />
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
      {/* CartDrawer, ProductOverlay, Toast — Stages 14/15 */}
    </>
  );
}
